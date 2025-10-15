import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface DiscoveryUser {
  id: string;
  name: string;
  age: number;
  gender: string;
  profession?: string;
  photos: string[];
  intentions: string[];
  musical_styles?: string[];
  languages?: string[];
  alcohol?: string;
  education?: string;
  religion?: string;
  zodiac_sign?: string;
  about_me?: string;
  current_check_in?: {
    location_id: string;
    location_name: string;
    checked_in_at: string;
    expires_at: string;
  };
}

export interface DiscoveryFilters {
  intentions?: string[];
  genders?: string[];
  minAge?: number;
  maxAge?: number;
  education?: string;
  alcohol?: string;
  musicalStyles?: string[];
  languages?: string[];
}

export const useDiscovery = (filters?: DiscoveryFilters) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<DiscoveryUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDiscoveryUsers = async () => {
      try {
        setLoading(true);

        // Get current user's profile to exclude them
        const { data: myProfile } = await supabase
          .from("profiles")
          .select("current_check_in")
          .eq("id", user.id)
          .single();

        // Build query for users with active check-ins
        let query = supabase
          .from("profiles")
          .select("*")
          .not("id", "eq", user.id)
          .not("current_check_in", "is", null);

        // Apply filters
        if (filters?.intentions && filters.intentions.length > 0) {
          query = query.overlaps("intentions", filters.intentions);
        }

        if (filters?.genders && filters.genders.length > 0) {
          query = query.in("gender", filters.genders);
        }

        if (filters?.minAge) {
          query = query.gte("age", filters.minAge);
        }

        if (filters?.maxAge) {
          query = query.lte("age", filters.maxAge);
        }

        if (filters?.education) {
          query = query.eq("education", filters.education);
        }

        if (filters?.alcohol) {
          query = query.eq("alcohol", filters.alcohol);
        }

        if (filters?.musicalStyles && filters.musicalStyles.length > 0) {
          query = query.overlaps("musical_styles", filters.musicalStyles);
        }

        if (filters?.languages && filters.languages.length > 0) {
          query = query.overlaps("languages", filters.languages);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Filter out users with expired check-ins
        const now = new Date();
        const activeUsers = (data || []).filter((profile) => {
          if (!profile.current_check_in) return false;
          const checkIn = profile.current_check_in as any;
          if (!checkIn.expires_at) return false;
          const expiresAt = new Date(checkIn.expires_at);
          return expiresAt > now;
        });

        // Get users I've already liked
        const { data: myLikes } = await supabase
          .from("likes")
          .select("to_user_id")
          .eq("from_user_id", user.id);

        const likedUserIds = new Set(myLikes?.map((like) => like.to_user_id) || []);

        // Filter out users I've already liked
        const usersToShow = activeUsers.filter(
          (profile) => !likedUserIds.has(profile.id)
        );

        setUsers(usersToShow as any);
      } catch (error: any) {
        console.error("Error fetching discovery users:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDiscoveryUsers();
  }, [user, filters]);

  const sendYo = async (toUserId: string, locationId?: string) => {
    if (!user) return;

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from("likes")
        .select("*")
        .eq("from_user_id", user.id)
        .eq("to_user_id", toUserId)
        .maybeSingle();

      if (existingLike) {
        toast({
          title: "Aviso",
          description: "Você já enviou um YO para este usuário",
        });
        return;
      }

      // Create the like
      const { data: like, error: likeError } = await supabase
        .from("likes")
        .insert({
          from_user_id: user.id,
          to_user_id: toUserId,
          location_id: locationId,
        })
        .select()
        .single();

      if (likeError) throw likeError;

      // Check if it's a match (they also liked me)
      const { data: reciprocalLike } = await supabase
        .from("likes")
        .select("*")
        .eq("from_user_id", toUserId)
        .eq("to_user_id", user.id)
        .maybeSingle();

      if (reciprocalLike) {
        // It's a match! Create match record
        const { error: matchError } = await supabase
          .from("matches")
          .insert({
            user1_id: user.id,
            user2_id: toUserId,
            location_id: locationId,
          });

        if (matchError) throw matchError;

        // Update both likes to mark as match
        await supabase
          .from("likes")
          .update({ is_match: true })
          .in("id", [like.id, reciprocalLike.id]);

        toast({
          title: "🎉 É um Match!",
          description: "Vocês deram match! Agora podem conversar.",
        });
      } else {
        toast({
          title: "YO enviado!",
          description: "Aguarde para ver se vai dar match",
        });
      }

      // Remove user from discovery list
      setUsers((prev) => prev.filter((u) => u.id !== toUserId));
    } catch (error: any) {
      console.error("Error sending YO:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o YO",
        variant: "destructive",
      });
    }
  };

  const skipUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return {
    users,
    loading,
    sendYo,
    skipUser,
  };
};
