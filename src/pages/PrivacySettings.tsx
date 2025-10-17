import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const PrivacySettings = () => {
  const navigate = useNavigate();
  const [privacy, setPrivacy] = useState({
    showLocation: true,
    showAge: true,
    showLastActive: true,
    allowMessages: true,
  });

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
        <h1 className="text-2xl font-bold text-black-soft">Privacidade</h1>
      </div>

      {/* Privacy Options */}
      <div className="px-6 py-6 space-y-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex-1">
            <Label htmlFor="location" className="text-lg font-semibold text-black-soft">
              Mostrar Localização
            </Label>
            <p className="text-sm text-gray-medium mt-1">
              Exibir sua cidade e estado no perfil
            </p>
          </div>
          <Switch
            id="location"
            checked={privacy.showLocation}
            onCheckedChange={() => setPrivacy({ ...privacy, showLocation: !privacy.showLocation })}
          />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex-1">
            <Label htmlFor="age" className="text-lg font-semibold text-black-soft">
              Mostrar Idade
            </Label>
            <p className="text-sm text-gray-medium mt-1">
              Exibir sua idade no perfil
            </p>
          </div>
          <Switch
            id="age"
            checked={privacy.showAge}
            onCheckedChange={() => setPrivacy({ ...privacy, showAge: !privacy.showAge })}
          />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex-1">
            <Label htmlFor="lastActive" className="text-lg font-semibold text-black-soft">
              Mostrar Última Atividade
            </Label>
            <p className="text-sm text-gray-medium mt-1">
              Permitir que outros vejam quando você esteve ativo
            </p>
          </div>
          <Switch
            id="lastActive"
            checked={privacy.showLastActive}
            onCheckedChange={() => setPrivacy({ ...privacy, showLastActive: !privacy.showLastActive })}
          />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex-1">
            <Label htmlFor="messages" className="text-lg font-semibold text-black-soft">
              Permitir Mensagens
            </Label>
            <p className="text-sm text-gray-medium mt-1">
              Somente matches podem enviar mensagens
            </p>
          </div>
          <Switch
            id="messages"
            checked={privacy.allowMessages}
            onCheckedChange={() => setPrivacy({ ...privacy, allowMessages: !privacy.allowMessages })}
          />
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
