import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, Award, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface CheckInHistoryItem {
  location_id: string;
  location_name: string;
  checked_in_at: string;
  checked_out_at: string | null;
  latitude: number;
  longitude: number;
}

const CheckInHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<CheckInHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCheckIns: 0,
    uniqueLocations: 0,
    favoriteLocation: '',
  });

  useEffect(() => {
    if (user) {
      fetchCheckInHistory();
    }
  }, [user]);

  const fetchCheckInHistory = async () => {
    try {
      setLoading(true);
      
      // Buscar perfil do usuário
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      // Simular histórico (em produção, você teria uma tabela check_in_history)
      // Por enquanto, vamos mostrar apenas dados de exemplo
      const mockHistory: CheckInHistoryItem[] = [
        {
          location_id: '1',
          location_name: "D'Villas Bar",
          checked_in_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          checked_out_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          latitude: -23.5590986,
          longitude: -46.7815891,
        },
      ];

      setHistory(mockHistory);
      
      // Calcular estatísticas
      const uniqueLocs = new Set(mockHistory.map(h => h.location_id)).size;
      setStats({
        totalCheckIns: mockHistory.length,
        uniqueLocations: uniqueLocs,
        favoriteLocation: mockHistory[0]?.location_name || 'Nenhum',
      });
    } catch (error: any) {
      console.error('Error fetching check-in history:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (checkedIn: string, checkedOut: string | null) => {
    if (!checkedOut) return 'Em andamento';
    
    const duration = new Date(checkedOut).getTime() - new Date(checkedIn).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) return 'Hoje';
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
    
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-2xl mx-auto p-4 space-y-4 pb-20">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/map')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Histórico de Check-ins</h1>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalCheckIns}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.uniqueLocations}</div>
              <div className="text-xs text-muted-foreground">Locais</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
              <div className="text-xs text-muted-foreground">Explorador</div>
            </CardContent>
          </Card>
        </div>

        {/* Local Favorito */}
        {stats.favoriteLocation && (
          <Card className="bg-gradient-primary text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">
                Local Mais Visitado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="font-semibold">{stats.favoriteLocation}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Últimos Check-ins</h2>
          
          {history.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum check-in ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Faça seu primeiro check-in para começar seu histórico!
                </p>
                <Button onClick={() => navigate('/map')}>
                  Ir para o Mapa
                </Button>
              </CardContent>
            </Card>
          ) : (
            history.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.location_name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(item.checked_in_at)}</span>
                        <span>•</span>
                        <span>{formatDuration(item.checked_in_at, item.checked_out_at)}</span>
                      </div>
                    </div>
                    {!item.checked_out_at && (
                      <Badge variant="default" className="bg-green-500">
                        Ativo
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t shadow-card flex items-center justify-around px-6 max-w-2xl mx-auto">
        <button 
          className="flex flex-col items-center gap-1 text-muted-foreground transition-all hover:scale-110 hover:text-primary"
          onClick={() => navigate("/map")}
        >
          <MapPin className="w-6 h-6" />
          <span className="text-xs font-medium">Mapa</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-muted-foreground transition-all hover:scale-110 hover:text-primary"
          onClick={() => navigate("/active-checkins")}
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Check-ins</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-muted-foreground transition-all hover:scale-110 hover:text-primary"
          onClick={() => navigate("/matches")}
        >
          <span className="text-2xl">❤️</span>
          <span className="text-xs font-medium">Matches</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-muted-foreground transition-all hover:scale-110 hover:text-primary"
          onClick={() => navigate("/profile")}
        >
          <span className="text-2xl">👤</span>
          <span className="text-xs font-medium">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default CheckInHistory;
