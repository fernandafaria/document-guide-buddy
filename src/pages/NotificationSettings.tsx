import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    likes: true,
    checkIns: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Carregar configurações do perfil
    const loadSettings = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("notifications_enabled")
        .eq("id", user.id)
        .single();
      
      if (data) {
        const enabled = data.notifications_enabled ?? true;
        setNotifications({
          matches: enabled,
          messages: enabled,
          likes: enabled,
          checkIns: enabled,
        });
      }
    };
    
    loadSettings();
  }, [user]);

  const handleToggle = async (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    
    setLoading(true);
    try {
      const allEnabled = Object.values({ ...notifications, [key]: !notifications[key] }).some(v => v);
      
      const { error } = await supabase
        .from("profiles")
        .update({ notifications_enabled: allEnabled })
        .eq("id", user?.id);
      
      if (error) throw error;
      
      toast({
        title: "Configurações atualizadas",
        description: "Suas preferências de notificação foram salvas",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-light">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-medium hover:text-black-soft transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-black-soft">Notificações</h1>
      </div>

      {/* Notification Options */}
      <div className="px-6 py-6 space-y-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex-1">
            <Label htmlFor="matches" className="text-lg font-semibold text-black-soft">
              Novos Matches
            </Label>
            <p className="text-sm text-gray-medium mt-1">
              Receba notificações quando der match com alguém
            </p>
          </div>
          <Switch
            id="matches"
            checked={notifications.matches}
            onCheckedChange={() => handleToggle("matches")}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex-1">
            <Label htmlFor="messages" className="text-lg font-semibold text-black-soft">
              Mensagens
            </Label>
            <p className="text-sm text-gray-medium mt-1">
              Receba notificações de novas mensagens
            </p>
          </div>
          <Switch
            id="messages"
            checked={notifications.messages}
            onCheckedChange={() => handleToggle("messages")}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex-1">
            <Label htmlFor="likes" className="text-lg font-semibold text-black-soft">
              Curtidas
            </Label>
            <p className="text-sm text-gray-medium mt-1">
              Receba notificações quando alguém curtir você
            </p>
          </div>
          <Switch
            id="likes"
            checked={notifications.likes}
            onCheckedChange={() => handleToggle("likes")}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex-1">
            <Label htmlFor="checkIns" className="text-lg font-semibold text-black-soft">
              Check-in
            </Label>
            <p className="text-sm text-gray-medium mt-1">
              Receba notificações sobre seus check-in ativos
            </p>
          </div>
          <Switch
            id="checkIns"
            checked={notifications.checkIns}
            onCheckedChange={() => handleToggle("checkIns")}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
