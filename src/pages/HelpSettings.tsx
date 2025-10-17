import { ArrowLeft, Mail, MessageCircle, FileText, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HelpSettings = () => {
  const navigate = useNavigate();

  const helpOptions = [
    {
      icon: MessageCircle,
      title: "Central de Ajuda",
      description: "Encontre respostas para perguntas frequentes",
      action: () => window.open("https://help.example.com", "_blank"),
    },
    {
      icon: Mail,
      title: "Contato por Email",
      description: "suporte@yoapp.com",
      action: () => window.location.href = "mailto:suporte@yoapp.com",
    },
    {
      icon: FileText,
      title: "Termos de Uso",
      description: "Leia nossos termos e condições",
      action: () => navigate("/terms"),
    },
    {
      icon: FileText,
      title: "Política de Privacidade",
      description: "Como tratamos seus dados",
      action: () => navigate("/privacy"),
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
        <h1 className="text-2xl font-bold text-black-soft">Ajuda</h1>
      </div>

      {/* Help Options */}
      <div className="px-6 py-6 space-y-4">
        {helpOptions.map((option, index) => (
          <button
            key={index}
            onClick={option.action}
            className="w-full p-4 flex items-start gap-4 bg-gray-light hover:bg-gray-medium/20 rounded-2xl transition-colors"
          >
            <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center flex-shrink-0">
              <option.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-semibold text-black-soft mb-1">
                {option.title}
              </h3>
              <p className="text-sm text-gray-medium">
                {option.description}
              </p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-medium flex-shrink-0 mt-1" />
          </button>
        ))}
      </div>

      {/* App Info */}
      <div className="px-6 py-8">
        <div className="text-center p-6 bg-gray-light rounded-2xl">
          <h3 className="text-xl font-bold text-black-soft mb-2">YO!</h3>
          <p className="text-sm text-gray-medium mb-4">Versão 1.0.0</p>
          <p className="text-xs text-gray-medium">
            © 2025 YO! Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpSettings;
