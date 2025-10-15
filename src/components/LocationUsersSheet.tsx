import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  age: number;
  photos: string[];
  profession?: string;
  education?: string;
  intentions: string[];
  about_me?: string;
  musical_styles?: string[];
}

interface LocationUsersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: string;
  locationName: string;
}

export const LocationUsersSheet = ({
  open,
  onOpenChange,
  locationId,
  locationName,
}: LocationUsersSheetProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && locationId) {
      fetchUsersAtLocation();
    }
  }, [open, locationId]);

  const fetchUsersAtLocation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-users-at-location', {
        body: { locationId },
      });

      if (error) throw error;
      setUsers(data || []);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar pessoas neste local',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (toUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('process-like', {
        body: { 
          toUserId, 
          locationId,
          action: 'like' 
        },
      });

      if (error) throw error;

      if (data?.isMatch) {
        toast({
          title: '🎉 É um Match!',
          description: `Você e ${users[currentIndex]?.name} curtiram um ao outro!`,
        });
      }

      nextUser();
    } catch (error) {
      console.error('Error processing like:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível curtir este perfil',
        variant: 'destructive',
      });
    }
  };

  const handlePass = () => {
    nextUser();
  };

  const nextUser = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast({
        title: 'Fim da lista',
        description: 'Você viu todas as pessoas neste local',
      });
      onOpenChange(false);
    }
  };

  const currentUser = users[currentIndex];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-primary" />
            {locationName}
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            {users.length > 0 ? `${currentIndex + 1} de ${users.length} pessoas` : 'Ninguém aqui no momento'}
          </p>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : currentUser ? (
          <div className="flex flex-col h-full gap-4">
            {/* User Card */}
            <div className="flex-1 overflow-y-auto">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                <img
                  src={currentUser.photos?.[0] || '/placeholder.svg'}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h3 className="text-white text-2xl font-bold mb-1">
                    {currentUser.name}, {currentUser.age}
                  </h3>
                  {currentUser.profession && (
                    <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                      <Briefcase className="w-4 h-4" />
                      {currentUser.profession}
                    </div>
                  )}
                  {currentUser.education && (
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <GraduationCap className="w-4 h-4" />
                      {currentUser.education}
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-4 px-2 pb-24">
                {currentUser.intentions?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Interesses</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.intentions.map((intention) => (
                        <Badge key={intention} variant="secondary">
                          {intention}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {currentUser.musical_styles?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Estilos Musicais</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.musical_styles.map((style) => (
                        <Badge key={style} variant="outline">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {currentUser.about_me && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Sobre</h4>
                    <p className="text-sm">{currentUser.about_me}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
              <div className="flex justify-center gap-6 max-w-md mx-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full w-16 h-16 p-0 border-2"
                  onClick={handlePass}
                >
                  <X className="w-8 h-8 text-muted-foreground" />
                </Button>
                <Button
                  size="lg"
                  className="rounded-full w-20 h-20 p-0"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--coral-vibrant)), hsl(var(--pink-deep)))',
                  }}
                  onClick={() => handleLike(currentUser.id)}
                >
                  <Heart className="w-10 h-10 fill-white" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ninguém aqui ainda</h3>
            <p className="text-muted-foreground">
              Seja o primeiro a fazer check-in neste local
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
