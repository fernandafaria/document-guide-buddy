import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";

interface LikeProfile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  about_me?: string;
  locationId?: string;
}

export default function Likes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState<LikeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingLike, setProcessingLike] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchLikes = async () => {
      try {
        // Buscar curtidas recebidas que não viraram match
        const { data: likesData, error: likesError } = await supabase
          .from("likes")
          .select("from_user_id, location_id")
          .eq("to_user_id", user.id)
          .eq("is_match", false);

        if (likesError) throw likesError;

        if (!likesData || likesData.length === 0) {
          setLikes([]);
          setLoading(false);
          return;
        }

        // Buscar perfis das pessoas que curtiram
        const userIds = likesData.map((like) => like.from_user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, age, photos, about_me")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        // Combinar dados de likes com perfis
        const profilesWithLocation = profilesData?.map((profile) => ({
          ...profile,
          locationId: likesData.find((like) => like.from_user_id === profile.id)?.location_id,
        })) || [];

        setLikes(profilesWithLocation);
      } catch (error) {
        console.error("Error fetching likes:", error);
        toast.error("Erro ao carregar curtidas");
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();

    // Realtime para novas curtidas
    const channel = supabase
      .channel("likes-received")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "likes",
          filter: `to_user_id=eq.${user.id}`,
        },
        () => {
          fetchLikes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLikeBack = async (userId: string, locationId?: string) => {
    if (!user) return;

    setProcessingLike(userId);
    try {
      const { data, error } = await supabase.functions.invoke("process-like", {
        body: {
          toUserId: userId,
          locationId: locationId || "",
          action: "like",
        },
      });

      if (error) throw error;

      if (data?.isMatch) {
        toast.success("É um match! 🎉");
        navigate("/match");
      } else {
        toast.success("Curtida enviada!");
        setLikes((prev) => prev.filter((like) => like.id !== userId));
      }
    } catch (error) {
      console.error("Error processing like:", error);
      toast.error("Erro ao processar curtida");
    } finally {
      setProcessingLike(null);
    }
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-20">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Quem curtiu você</h1>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-coral" />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-20">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Quem curtiu você</h1>

        {likes.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhuma curtida ainda</p>
            <p className="text-sm text-gray-400 mt-2">
              Quando alguém curtir você, aparecerá aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {likes.map((profile) => (
              <Card key={profile.id} className="overflow-hidden">
                <div className="flex gap-4 p-4">
                  <Avatar
                    className="h-20 w-20 cursor-pointer flex-shrink-0"
                    onClick={() => handleProfileClick(profile.id)}
                  >
                    <AvatarImage
                      src={profile.photos[0]}
                      alt={profile.name}
                      className="object-cover"
                    />
                    <AvatarFallback>{profile.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div
                      className="cursor-pointer"
                      onClick={() => handleProfileClick(profile.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">
                          {profile.name}
                        </h3>
                        <Badge variant="secondary">{profile.age} anos</Badge>
                      </div>
                      {profile.about_me && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {profile.about_me}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => handleLikeBack(profile.id, profile.locationId)}
                      disabled={processingLike === profile.id}
                      className="mt-3 w-full bg-coral hover:bg-coral/90"
                    >
                      {processingLike === profile.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Curtindo...
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-2" />
                          Curtir de volta
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
