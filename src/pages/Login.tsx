import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation, Link } from "react-router-dom";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  const logoutParam = new URLSearchParams(location.search).get('logout');
  const [signingOut, setSigningOut] = useState(!!logoutParam);
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Sempre redireciona para /map após o login
  const redirectPath = '/map';

  useEffect(() => {
    if (logoutParam) {
      supabase.auth.signOut().finally(() => {
        setSigningOut(false);
        navigate('/login', { replace: true });
      });
    } else if (!authLoading && user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, authLoading, logoutParam]);


  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        const firstError = validation.error.issues[0];
        toast({
          title: "Dados inválidos",
          description: firstError.message,
          variant: "destructive",
        });
        return;
      }

      if (isLogin) {
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Email ou senha incorretos");
          }
          throw error;
        }
        
        toast({
          title: "Login realizado!",
          description: "Que bom te ver novamente!",
        });
        navigate(redirectPath);
      } else {
        navigate("/signup-info", { state: { email, password } });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (signingOut) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-7xl font-fredoka font-bold text-coral tracking-tight mb-4">
            Yo!
          </h1>
          <p className="text-gray-medium">Saindo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 safe-area-all">
      {/* Logo */}
      <h1 className="text-7xl font-fredoka font-bold text-coral tracking-tight mb-8">
        Yo!
      </h1>

      {/* Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-black-soft mb-2">
          {isLogin ? "Que bom te ver" : "Criar conta"}
        </h2>
        <p className="text-lg text-gray-medium">
          {isLogin ? "Entre para continuar" : "Cadastre-se no Yo!"}
        </p>
      </div>

      {/* Auth Buttons */}
      <div className="w-full max-w-md space-y-4">
        {/* Email Form */}
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold text-black-soft">
              Email
            </Label>
            <Input
               id="email"
               type="email"
               placeholder="seu@email.com"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               disabled={signingOut}
               className="h-14 bg-gray-light border-0 rounded-2xl text-base"
             />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-semibold text-black-soft">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={signingOut}
              className="h-14 bg-gray-light border-0 rounded-2xl text-base"
            />
          </div>

          <Button
            className="w-full h-14"
            onClick={handleSubmit}
            disabled={loading || signingOut}
          >
            {signingOut ? "Saindo..." : loading ? "Carregando..." : (isLogin ? "Entrar" : "Continuar")}
          </Button>

          <button
            className="w-full text-center text-sm text-gray-medium hover:text-coral transition-colors"
            onClick={() => setIsLogin(!isLogin)}
            disabled={signingOut}
          >
            {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Entre"}
          </button>
        </div>
      </div>

      {/* Legal */}
      <p className="text-sm text-gray-medium text-center mt-8 max-w-md">
        Ao continuar, você concorda com nossos{" "}
        <Link to="/terms" className="text-coral hover:underline">
          Termos de Serviço
        </Link>
        {" "}e{" "}
        <Link to="/privacy" className="text-coral hover:underline">
          Política de Privacidade
        </Link>
      </p>
    </div>
  );
};

export default Login;
