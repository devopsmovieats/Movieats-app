"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Flame, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Configuração base do SweetAlert para Toasts
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "#111111",
  color: "#fff",
  iconColor: "#ff6b00",
  customClass: {
    popup: "rounded-xl border-none shadow-2xl p-3 w-auto",
    title: "text-[11px] font-medium leading-tight",
    icon: "text-xs scale-75"
  },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  }
});

// Configuração para Diálogos (Recuperação de senha)
const Modal = Swal.mixin({
  background: "#1a1a1a",
  color: "#fff",
  confirmButtonColor: "#ff6b00",
  cancelButtonColor: "#333",
  customClass: {
    popup: "rounded-2xl border border-white/5 shadow-2xl",
    confirmButton: "rounded-lg font-black uppercase text-[10px] px-6 py-3 tracking-widest",
    cancelButton: "rounded-lg font-black uppercase text-[10px] px-6 py-3 tracking-widest",
    input: "bg-white/5 border-white/10 text-white rounded-lg focus:ring-primary/20 text-sm",
  }
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        const fullName = data.user.user_metadata?.full_name || "Usuário";
        
        // Define o papel (role) baseado no email ou em metadados se existirem
        let role = "ADMIN";
        let redirectPath = "/";

        if (email.includes("gerente")) {
          role = "GERENTE";
        } else if (email.includes("atendente")) {
          role = "ATENDENTE";
          redirectPath = "/operacao/pedidos";
        }

        const userData = { email, role, name: fullName, id: data.user.id };
        localStorage.setItem("movieats_user", JSON.stringify(userData));
        Cookies.set("auth_token", "movieats-store-session", { expires: 1 });
        
        Toast.fire({
          icon: "success",
          title: `Bem-vindo, ${fullName}!`,
        });

        // Redirecionamento obrigatório para o portal
        window.location.href = "https://portal.movieats.com.br/";
      }
    } catch (error: any) {
      setIsLoading(false);
      
      let errorMessage = error.message || "Erro ao realizar login";
      if (errorMessage === "Invalid login credentials") {
        errorMessage = "E-mail ou senha incorretos";
      }

      Toast.fire({
        icon: "error",
        title: errorMessage,
      });
    }
  };

  const handleRecoverPassword = async () => {
    const { value: userEmail } = await Modal.fire({
      title: "Recuperar Senha",
      input: "email",
      inputLabel: "Informe seu e-mail de acesso",
      inputPlaceholder: "contato@sualoja.com.br",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Enviar Link",
      showLoaderOnConfirm: true,
      preConfirm: async (email) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "https://portal.movieats.com.br/reset-password",
          });
          if (error) throw new Error(error.message);
          return email;
        } catch (error: any) {
          Swal.showValidationMessage(`Erro: ${error.message}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (userEmail) {
      Toast.fire({
        icon: "success",
        title: "Link de recuperação enviado!",
      });
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center font-body overflow-hidden" suppressHydrationWarning>
      
      {/* Estilos para animação do coração */}
      <style jsx global>{`
        @keyframes pulse-heart {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.4); }
        }
        .animate-pulse-heart {
          animation: pulse-heart 1.5s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>

      {/* Imagem de Fundo Fullscreen */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=1920" 
          alt="Gastronomia Background" 
          className="w-full h-full object-cover"
        />
        {/* Overlay Escuro Suave (70%) */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      </div>

      {/* Conteúdo Centralizado (Modal) */}
      <div className="relative z-10 w-full max-w-[500px] px-6 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Modal Premium Horizontal (Largo e Compacto) */}
        <div className="bg-[#0a0a0a]/85 backdrop-blur-[15px] rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all">
          
          {/* Branding */}
          <div className="flex flex-col items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ff6b00]/10 rounded-xl">
                <Flame className="text-[#ff6b00] w-8 h-8 fill-[#ff6b00]" />
              </div>
              <h1 className="font-headline text-3xl font-black tracking-tighter text-white">MOVIEATS</h1>
            </div>
            <span className="text-[9px] mt-4 uppercase tracking-[0.5em] font-medium text-white/50 whitespace-nowrap">Portal do Estabelecimento</span>
          </div>

          {/* Welcome Text */}
          <div className="mb-5 text-center">
            <h2 className="font-headline text-2xl font-black text-white/80 tracking-tight">Acesse sua operação</h2>
          </div>

          {/* Form */}
          <form id="login-form-premium" onSubmit={handleLogin} className="space-y-4 flex flex-col">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1 mb-2 block" htmlFor="email">
                E-mail de Acesso
              </label>
              <input 
                id="email"
                type="email"
                required
                autoFocus
                autoComplete="off"
                placeholder="seu@estabelecimento.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white/[0.05] rounded-xl px-5 text-sm text-white font-medium placeholder:text-white/10 outline-none transition-all focus:bg-white/[0.08]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1 mb-2 block" htmlFor="password">
                Senha
              </label>
              <div className="relative group">
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="off"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-white/[0.05] rounded-xl px-5 text-sm text-white font-medium placeholder:text-white/10 outline-none transition-all focus:bg-white/[0.08] pr-14"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={handleRecoverPassword}
                  className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#ff6b00] hover:text-orange-400 transition-colors cursor-pointer mt-2"
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>

            <div className="h-2" />

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#ff6b00] hover:bg-orange-600 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-[#ff6b00]/10 transition-all flex items-center justify-center cursor-pointer mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Acessar Sistema"
              )}
            </button>


          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-white/50">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em]">
              © 2026 MoviEats Feito com <span className="text-[#ff6b00] animate-pulse-heart mx-1">❤</span> no Brasil
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
