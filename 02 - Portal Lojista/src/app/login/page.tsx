"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  background: "#1a1a1a",
  color: "#fff",
  iconColor: "#ff6b00",
  customClass: {
    popup: "rounded-xl border border-white/5 shadow-2xl",
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

    // Simulação de delay para efeito visual premium
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (email === "lojista@teste.com" && password === "lojista123") {
      Cookies.set("auth_token", "movieats-store-session", { expires: 1 });
      router.push("/");
    } else {
      setIsLoading(false);
      Toast.fire({
        icon: "error",
        title: "E-mail ou senha incorretos",
      });
    }
  };

  const handleRecoverPassword = async () => {
    const { value: userEmail } = await Modal.fire({
      title: "Recuperar Senha",
      input: "email",
      inputLabel: "Informe seu e-mail de estabelecimento",
      inputPlaceholder: "contato@sualoja.com.br",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Enviar Link",
      showLoaderOnConfirm: true,
      preConfirm: (login) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(login);
          }, 1500);
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (userEmail) {
      Toast.fire({
        icon: "success",
        title: "Link enviado para o seu e-mail!",
      });
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 relative overflow-hidden font-body bg-[#0a0a0a]">
      {/* Glow Background Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[340px] z-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-6 px-4 sm:px-0">
        <div className="bg-[#141414] border border-white/5 rounded-lg p-7 shadow-2xl shadow-black/50">
          
          {/* Branding */}
          <div className="flex flex-col items-center mb-7">
            <div className="flex items-center gap-2 mb-1.5 cursor-default">
              <Flame className="text-primary w-7 h-7 fill-primary" />
              <h1 className="font-headline text-xl font-black tracking-tighter text-primary">MOVIEATS</h1>
            </div>
            <span className="text-[8px] uppercase tracking-[0.3em] font-black text-muted-foreground italic">PAINEL DO ESTABELECIMENTO</span>
          </div>

          {/* Welcome Text */}
          <div className="mb-10 text-center sm:text-left cursor-default">
            <h2 className="font-headline text-[17px] font-black text-white mb-2">Acesso do Estabelecimento</h2>
            <p className="text-[11px] text-muted-foreground font-medium">Painel operacional do estabelecimento.</p>
          </div>

          {/* Form */}
          <form id="login-form-v2" onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 block mb-2" htmlFor="email">
                E-mail da Loja
              </label>
              <input 
                id="email"
                type="email"
                required
                autoComplete="off"
                placeholder="nome@sualoja.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-lg px-4 text-sm text-white placeholder:text-muted-foreground/20 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 block mb-2" htmlFor="password">
                Senha de acesso
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
                  className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-lg px-4 text-sm text-white placeholder:text-muted-foreground/20 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-all cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pb-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="peer hidden" />
                  <div className="w-3.5 h-3.5 rounded bg-white/5 border border-white/10 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground group-hover:text-white transition-colors font-bold uppercase tracking-widest">Manter</span>
              </label>
              <button 
                type="button" 
                onClick={handleRecoverPassword}
                className="text-[9px] font-black text-primary hover:underline underline-offset-4 tracking-widest uppercase transition-colors cursor-pointer"
              >
                Recuperar Senha
              </button>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-orange-500 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Entrar no Painel
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center flex flex-col items-center gap-4">
            <div className="w-full h-px bg-white/5" />
            <p className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-widest">
              Suporte Técnico <button className="text-muted-foreground hover:text-white transition-colors underline decoration-white/10 underline-offset-4 ml-1 cursor-pointer">Clique aqui</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
