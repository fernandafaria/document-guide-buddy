import { ArrowLeft, ChevronRight, Bell, Shield, User, HelpCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  const settingsOptions = [
    {
      icon: Bell,
      title: "Notificações",
      color: "bg-coral",
      onClick: () => console.log("Notifications"),
    },
    {
      icon: Shield,
      title: "Privacidade",
      color: "bg-turquoise",
      onClick: () => console.log("Privacy"),
    },
    {
      icon: User,
      title: "Conta",
      color: "bg-coral",
      onClick: () => console.log("Account"),
    },
    {
      icon: HelpCircle,
      title: "Ajuda",
      color: "bg-lavender",
      onClick: () => console.log("Help"),
    },
    {
      icon: FileText,
      title: "Termos de Uso",
      color: "bg-lavender",
      onClick: () => window.open("https://example.com/terms", "_blank"),
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
        <h1 className="text-2xl font-bold text-black-soft">Settings</h1>
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

      {/* App Version */}
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-gray-medium">YO! v1.0.0</p>
      </div>
    </div>
  );
};

export default Settings;
