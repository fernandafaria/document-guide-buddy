import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail } from "lucide-react";
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

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-light" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-medium">Ou continue com</span>
          </div>
        </div>

        {/* Google */}
        <Button
          variant="secondary"
          className="w-full h-14 bg-white border-2 border-gray-light text-black-soft hover:bg-gray-light"
          onClick={handleGoogleLogin}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue com Google
        </Button>
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
