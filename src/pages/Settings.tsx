import { ArrowLeft, ChevronRight, Bell, Shield, User, HelpCircle, FileText, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Até logo!",
        description: "Você foi desconectado com sucesso",
      });
      // Redireciona para login sem passar o "from" para evitar voltar às configurações
      navigate("/login", { replace: true });
    }
  };

  const settingsOptions = [
    {
      icon: Bell,
      title: "Notificações",
      color: "bg-coral",
      onClick: () => navigate("/settings/notifications"),
    },
    {
      icon: Shield,
      title: "Privacidade",
      color: "bg-turquoise",
      onClick: () => navigate("/settings/privacy"),
    },
    {
      icon: User,
      title: "Conta",
      color: "bg-coral",
      onClick: () => navigate("/settings/account"),
    },
    {
      icon: HelpCircle,
      title: "Ajuda",
      color: "bg-lavender",
      onClick: () => navigate("/settings/help"),
    },
    {
      icon: FileText,
      title: "Termos de Uso",
      color: "bg-lavender",
      onClick: () => navigate("/terms", { state: { from: "/settings" } }),
    },
  ];

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
        <h1 className="text-2xl font-bold text-black-soft">Configurações</h1>
      </div>

      {/* Settings List */}
      <div className="divide-y divide-gray-light">
        {settingsOptions.map((option, index) => (
          <button
            key={index}
            onClick={option.onClick}
            className="w-full px-6 py-5 flex items-center gap-4 hover:bg-gray-light/50 transition-colors"
          >
            <div className={`${option.color} w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <option.icon className="w-6 h-6 text-white" />
            </div>
            <span className="flex-1 text-left text-lg font-semibold text-black-soft">
              {option.title}
            </span>
            <ChevronRight className="w-6 h-6 text-gray-medium" />
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-6 py-6">
        <button
          onClick={handleLogout}
          className="w-full px-6 py-5 flex items-center gap-4 bg-gray-light hover:bg-gray-medium/20 transition-colors rounded-2xl"
        >
          <div className="bg-black-soft w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0">
            <LogOut className="w-6 h-6 text-white" />
          </div>
          <span className="flex-1 text-left text-lg font-semibold text-black-soft">
            Sair
          </span>
        </button>
      </div>

      {/* App Version */}
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-gray-medium">YO! v1.0.0</p>
      </div>
    </div>
  );
};

export default Settings;
