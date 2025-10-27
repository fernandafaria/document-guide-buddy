import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface NearbyUser {
  id: string;
  name: string;
  age: number;
  photos: string[];
  distance?: number;
}

interface NearbyUsersCardProps {
  users: NearbyUser[];
}

export const NearbyUsersCard = ({ users }: NearbyUsersCardProps) => {
  const navigate = useNavigate();

  const getPhotoUrl = (photoPath: string) => {
    if (!photoPath) return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
    // Se já for uma URL completa, retorna direto
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(photoPath);
    return data.publicUrl;
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`, { state: { fromCheckIn: true } });
  };

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3">
        {users.map((user) => (
          <Card 
            key={user.id} 
            className="p-4 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => handleUserClick(user.id)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={user.photos?.[0] ? getPhotoUrl(user.photos[0]) : "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} 
                  alt={user.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{user.name}</h4>
                  <Badge variant="secondary">{user.age} anos</Badge>
                </div>
                {user.distance !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    {user.distance < 1000 
                      ? `${Math.round(user.distance)}m de você` 
                      : `${(user.distance / 1000).toFixed(1)}km de você`}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
