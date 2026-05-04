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
    <div className="min-h-screen w-full relative flex items-center justify-center font-sans overflow-hidden" suppressHydrationWarning>
      
      {/* Imagem de Fundo Fullscreen */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=1920" 
          alt="Gastronomia Background" 
          className="w-full h-full object-cover"
        />
        {/* Overlay Escuro Leve (40%) */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>
158: 
159:       {/* Conteúdo Centralizado (Card Glass) */}
160:       <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in-95 duration-1000">
161:         
162:         <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-10 border border-white/20 shadow-2xl relative overflow-hidden transition-all">
163:           
164:           {/* Branding */}
165:           <div className="flex flex-col items-center mb-8">
166:             <div className="flex items-center gap-3">
167:               <div className="p-2 bg-orange-500/20 rounded-xl">
168:                 <Flame className="text-orange-500 w-8 h-8 fill-orange-500" />
169:               </div>
170:               <h1 className="text-3xl font-black tracking-tighter text-white">MOVIEATS</h1>
171:             </div>
172:             <span className="text-[10px] mt-4 uppercase tracking-[0.3em] font-semibold text-white/70">Portal do estabelecimento</span>
173:           </div>
174: 
175:           {/* Welcome Text */}
176:           <div className="mb-8 text-center">
177:             <h2 className="text-2xl font-bold text-white tracking-tight">Acesse sua Operação</h2>
178:           </div>
179: 
180:           {/* Form */}
181:           <form onSubmit={handleLogin} className="space-y-5">
182:             <div className="space-y-1.5">
183:               <label className="text-xs font-semibold text-white/70 ml-1" htmlFor="email">
184:                 E-mail de Acesso
185:               </label>
186:               <input 
187:                 id="email"
188:                 type="email"
189:                 required
190:                 autoFocus
191:                 placeholder="seu@estabelecimento.com"
192:                 value={email}
193:                 onChange={(e) => setEmail(e.target.value)}
194:                 className="w-full h-12 bg-white/20 border border-orange-400/50 rounded-lg px-5 text-sm text-white placeholder:text-white/40 outline-none focus:border-orange-500 transition-all"
195:               />
196:             </div>
197: 
198:             <div className="space-y-1.5">
199:               <label className="text-xs font-semibold text-white/70 ml-1" htmlFor="password">
200:                 Senha
201:               </label>
202:               <div className="relative">
203:                 <input 
204:                   id="password"
205:                   type={showPassword ? "text" : "password"}
206:                   required
207:                   placeholder="••••••••"
208:                   value={password}
209:                   onChange={(e) => setPassword(e.target.value)}
210:                   className="w-full h-12 bg-white/20 border border-orange-400/50 rounded-lg px-5 text-sm text-white placeholder:text-white/40 outline-none focus:border-orange-500 transition-all pr-12"
211:                 />
212:                 <button 
213:                   type="button"
214:                   onClick={() => setShowPassword(!showPassword)}
215:                   className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all"
216:                 >
217:                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
218:                 </button>
219:               </div>
220:               <div className="flex justify-end">
221:                 <button 
222:                   type="button"
223:                   onClick={handleRecoverPassword}
224:                   className="text-xs font-medium text-gray-300 hover:text-orange-400 transition-colors mt-2"
225:                 >
226:                   Esqueci minha senha
227:                 </button>
228:               </div>
229:             </div>
230: 
231:             <button 
232:               type="submit"
233:               disabled={isLoading}
234:               className="w-full h-14 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-70 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center mt-4"
235:             >
236:               {isLoading ? (
237:                 <Loader2 className="w-6 h-6 animate-spin" />
238:               ) : (
239:                 "Acessar Sistema"
240:               )}
241:             </button>
242:           </form>
243: 
244:           {/* Footer */}
245:           <div className="mt-10 text-center text-white/50">
246:             <p className="text-[10px] font-medium">
247:               ©2026 Movieats feito com ❤️ no Brasil
248:             </p>
249:           </div>
250:         </div>
251:       </div>
252:     </div>
253:   );
254: }
