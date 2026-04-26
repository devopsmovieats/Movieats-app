"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Lock, 
  Shield, 
  Pencil, 
  Trash2, 
  LockKeyhole, 
  LockKeyholeOpen,
  CheckCircle2,
  XCircle,
  Search,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import Swal from "sweetalert2";

type UserLevel = "Admin" | "Gerente" | "Cozinha" | "Entregador" | "Garçom";
type UserStatus = "Ativo" | "Inativo";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  level: UserLevel;
  status: UserStatus;
  createdAt: string;
}

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "#0f0f0f",
  color: "#fff",
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<UserAccount>>({
    name: "",
    email: "",
    level: "Garçom",
    status: "Ativo"
  });
  const [password, setPassword] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("movieats_users");
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      const initial: UserAccount[] = [
        { id: "1", name: "Administrador", email: "admin@movieats.com.br", level: "Admin", status: "Ativo", createdAt: new Date().toISOString() },
        { id: "2", name: "Ricardo Gerente", email: "ricardo@teste.com", level: "Gerente", status: "Ativo", createdAt: new Date().toISOString() },
      ];
      setUsers(initial);
      localStorage.setItem("movieats_users", JSON.stringify(initial));
    }
  }, []);

  const saveToStorage = (newUsers: UserAccount[]) => {
    setUsers(newUsers);
    localStorage.setItem("movieats_users", JSON.stringify(newUsers));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && currentUser.id) {
      const updated = users.map(u => u.id === currentUser.id ? { ...u, ...currentUser } as UserAccount : u);
      saveToStorage(updated);
      Toast.fire({ icon: "success", title: "Alterações salvas!", background: "#0f0f0f", color: "#10b981" });
    } else {
      const newUser: UserAccount = {
        id: Math.random().toString(36).substr(2, 9),
        name: currentUser.name || "",
        email: currentUser.email || "",
        level: (currentUser.level as UserLevel) || "Garçom",
        status: "Ativo",
        createdAt: new Date().toISOString()
      };
      saveToStorage([...users, newUser]);
      Toast.fire({ icon: "success", title: "Usuário cadastrado!", background: "#0f0f0f", color: "#10b981" });
    }

    resetForm();
  };

  const resetForm = () => {
    setCurrentUser({ name: "", email: "", level: "Garçom", status: "Ativo" });
    setPassword("");
    setIsEditing(false);
  };

  const handleEdit = (user: UserAccount) => {
    setCurrentUser(user);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Tem certeza?",
      text: "Esta ação não poderá ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff6b00",
      cancelButtonColor: "#333",
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
      background: "#0f0f0f",
      color: "#fff"
    });

    if (result.isConfirmed) {
      const updated = users.filter(u => u.id !== id);
      saveToStorage(updated);
      Toast.fire({ icon: "error", title: "Usuário removido!", background: "#0f0f0f", color: "#ef4444" });
    }
  };

  const toggleStatus = (user: UserAccount) => {
    const isBlocking = user.status === "Ativo";
    const updated = users.map(u => u.id === user.id ? { ...u, status: u.status === "Ativo" ? "Inativo" : "Ativo" } as UserAccount : u);
    saveToStorage(updated);
    
    Toast.fire({ 
      icon: isBlocking ? "error" : "info", 
      title: isBlocking ? "Usuário bloqueado!" : "Usuário ativo!", 
      background: "#0f0f0f", 
      color: isBlocking ? "#ef4444" : "#3b82f6"
    });
  };

  const getLevelBadge = (level: UserLevel) => {
    const configs = {
      Admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Gerente: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Cozinha: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      Entregador: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      Garçom: "bg-pink-500/10 text-pink-400 border-pink-500/20"
    };
    return configs[level];
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="text-primary w-5 h-5" />
            </div>
            <h2 className="text-2xl font-headline font-black text-white tracking-tight uppercase leading-none">
              Gestão de Usuários
            </h2>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Controle de acessos e permissões da equipe.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Formulário (Esquerda) */}
          <div className="bg-black/20 border border-white/5 rounded-2xl p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {isEditing ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                {isEditing ? "Editar Usuário" : "Novo Usuário"}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors cursor-default" />
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: João Silva"
                    value={currentUser.name}
                    onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors cursor-default" />
                  <input 
                    required 
                    type="email" 
                    placeholder="nome@movieats.com"
                    value={currentUser.email}
                    onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors cursor-default" />
                  <input 
                    required={!isEditing}
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Nível de Acesso</label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors pointer-events-none" />
                  <select 
                    value={currentUser.level}
                    onChange={(e) => setCurrentUser({...currentUser, level: e.target.value as UserLevel})}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-all font-bold cursor-pointer appearance-none outline-none"
                  >
                    <option value="Admin" className="bg-[#0a0a0a]">Administrador</option>
                    <option value="Gerente" className="bg-[#0a0a0a]">Gerente</option>
                    <option value="Cozinha" className="bg-[#0a0a0a]">Cozinha</option>
                    <option value="Entregador" className="bg-[#0a0a0a]">Entregador</option>
                    <option value="Garçom" className="bg-[#0a0a0a]">Garçom</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 cursor-pointer outline-none">
                  {isEditing ? "Salvar Alterações" : "Cadastrar Usuário"}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="w-full py-3 bg-white/5 text-white/40 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all cursor-pointer outline-none">
                    Cancelar Edição
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Usuário</th>
                      <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Nível</th>
                      <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs border border-primary/20 uppercase">
                              {user.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-white leading-tight">{user.name}</span>
                              <span className="text-[11px] text-white/30 font-medium">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getLevelBadge(user.level)}`}>
                            {user.level}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                             {user.status === "Ativo" ? (
                               <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">Ativo</span>
                               </div>
                             ) : (
                               <div className="flex items-center gap-1.5 text-white/40 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                                  <XCircle className="w-3 h-3" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">Inativo</span>
                               </div>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 outline-none">
                            <button 
                              onClick={() => handleEdit(user)}
                              title="Editar"
                              className="p-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 rounded-xl transition-all cursor-pointer outline-none"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => toggleStatus(user)}
                              title={user.status === "Ativo" ? "Bloquear" : "Desbloquear"}
                              className={`p-2.5 border rounded-xl transition-all cursor-pointer outline-none ${
                                user.status === "Ativo" 
                                ? "bg-white/5 text-white/40 border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/20" 
                                : "bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white"
                              }`}
                            >
                              {user.status === "Ativo" ? <LockKeyhole className="w-3.5 h-3.5" /> : <LockKeyholeOpen className="w-3.5 h-3.5" />}
                            </button>
                            <button 
                              onClick={() => handleDelete(user.id)}
                              title="Excluir"
                              className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all cursor-pointer outline-none"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
