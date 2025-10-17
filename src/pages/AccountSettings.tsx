import { ArrowLeft, Mail, Phone, Calendar, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleDeleteAccount = async () => {
    try {
      // Deletar perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user?.id);
      
      if (profileError) throw profileError;
      
      // Fazer logout
      await signOut();
      
      toast({
        title: "Conta deletada",
        description: "Sua conta foi removida com sucesso",
      });
      
      navigate("/login");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar sua conta",
        variant: "destructive",
      });
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
        <h1 className="text-2xl font-bold text-black-soft">Conta</h1>
      </div>

      {/* Account Info */}
      <div className="px-6 py-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-light rounded-2xl">
            <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-medium">Email</p>
              <p className="text-base font-semibold text-black-soft">{user?.email}</p>
            </div>
          </div>

          {profile?.phone_number && (
            <div className="flex items-center gap-4 p-4 bg-gray-light rounded-2xl">
              <div className="w-12 h-12 bg-turquoise rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-medium">Telefone</p>
                <p className="text-base font-semibold text-black-soft">{profile.phone_number}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 p-4 bg-gray-light rounded-2xl">
            <div className="w-12 h-12 bg-lavender rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-medium">Membro desde</p>
              <p className="text-base font-semibold text-black-soft">
                {new Date(profile?.created_at || Date.now()).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 pt-6 border-t border-gray-light">
          <div className="flex items-start gap-3 p-4 bg-error/10 rounded-2xl mb-4">
            <AlertCircle className="w-6 h-6 text-error flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-error mb-1">Zona de Perigo</h3>
              <p className="text-sm text-gray-dark">
                Esta ação é irreversível. Todos os seus dados serão permanentemente deletados.
              </p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Deletar Conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso vai deletar permanentemente sua conta
                  e remover todos os seus dados dos nossos servidores.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-error hover:bg-error/90">
                  Sim, deletar minha conta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
