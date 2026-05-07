"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Shield, 
  Trash2, 
  Pencil, 
  X,
  Loader2,
  Users as UsersIcon,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Swal from "sweetalert2";

// Configuração do Toast elegante conforme o padrão Movieats
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  background: "#09090b",
  color: "#fff",
  customClass: {
    popup: "rounded-xl border border-zinc-800 shadow-2xl"
  }
});

type Profile = {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'GERENTE' | 'ATENDENTE' | 'COZINHA' | 'ENTREGADOR';
  status: boolean;
  establishment_id: string;
  created_at: string;
};

const roleLabels: Record<Profile['role'], string> = {
  ADMIN: 'Administrador',
  GERENTE: 'Gerente',
  ATENDENTE: 'Atendente',
  COZINHA: 'Cozinha',
  ENTREGADOR: 'Entregador'
};

const roleColors: Record<Profile['role'], string> = {
  ADMIN: 'bg-red-500/10 text-red-500 border-red-500/20',
  GERENTE: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  ATENDENTE: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  COZINHA: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  ENTREGADOR: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
};

export default function UsuariosPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<Partial<Profile> | null>(null);
  const [password, setPassword] = useState("");

  const loadProfiles = async () => {
    if (!establishmentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bd_perfis")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEstablishmentId(user.id);
      } else {
        const userSaved = localStorage.getItem("movieats_user");
        if (userSaved) {
          try {
            const parsedUser = JSON.parse(userSaved);
            if (parsedUser.id) setEstablishmentId(parsedUser.id);
          } catch (e) {}
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (establishmentId) loadProfiles();
  }, [establishmentId]);

  const filteredProfiles = profiles.filter(p => 
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingProfile({
      nome: "",
      email: "",
      role: "ATENDENTE",
      status: true,
      establishment_id: establishmentId || ""
    });
    setPassword("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !establishmentId) return;

    setIsSaving(true);
    try {
      if (editingProfile.id) {
        // Update
        const { error } = await supabase
          .from("bd_perfis")
          .update({
            nome: editingProfile.nome,
            role: editingProfile.role,
            status: editingProfile.status
          })
          .eq("id", editingProfile.id);
        if (error) throw error;
        Toast.fire({ icon: "success", title: "Usuário atualizado" });
      } else {
        // Create (In a real app, you'd use a service to create auth user + profile)
        const { error } = await supabase
          .from("bd_perfis")
          .insert([{
            ...editingProfile,
            establishment_id: establishmentId
          }]);
        if (error) throw error;
        Toast.fire({ icon: "success", title: "Usuário criado" });
      }
      setIsModalOpen(false);
      loadProfiles();
    } catch (error: any) {
      Toast.fire({ icon: "error", title: "Erro ao salvar", text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (profile: Profile) => {
    Swal.fire({
      title: "Remover Usuário?",
      text: `Deseja excluir "${profile.nome}"?`,
      icon: "warning",
      background: "#09090b",
      color: "#fff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "rounded-2xl border border-zinc-800"
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase
            .from("bd_perfis")
            .delete()
            .eq("id", profile.id);
          if (error) throw error;
          loadProfiles();
          Toast.fire({ icon: "success", title: "Usuário removido" });
        } catch (error) {
          Toast.fire({ icon: "error", title: "Erro ao remover" });
        }
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <UsersIcon className="text-white w-6 h-6" />
              <h2 className="text-3xl font-bold text-white tracking-tight">Equipe</h2>
            </div>
            <p className="text-zinc-500 text-sm font-medium">
              Gerencie os colaboradores e níveis de acesso do seu estabelecimento.
            </p>
          </div>

          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-orange-600/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex items-center">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/20">
                  <th className="px-6 py-4 text-[12px] font-medium text-zinc-500 tracking-tight">Colaborador</th>
                  <th className="px-6 py-4 text-[12px] font-medium text-zinc-500 tracking-tight">Nível de Acesso</th>
                  <th className="px-6 py-4 text-[12px] font-medium text-zinc-500 tracking-tight">Status</th>
                  <th className="px-6 py-4 text-[12px] font-medium text-zinc-500 tracking-tight text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin opacity-50" />
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Carregando equipe...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProfiles.length > 0 ? (
                  filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="group hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold overflow-hidden">
                            {profile.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">{profile.nome}</span>
                            <span className="text-xs text-zinc-500">{profile.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${roleColors[profile.role]}`}>
                          {roleLabels[profile.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {profile.status ? (
                            <div className="flex items-center gap-1.5 text-emerald-500">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Ativo</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-zinc-600">
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Inativo</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditingProfile(profile);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-zinc-500 hover:text-white transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(profile)}
                            className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-zinc-600 text-sm">
                      Nenhum colaborador encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingProfile?.id ? "Editar Colaborador" : "Novo Colaborador"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text"
                  required
                  value={editingProfile?.nome || ""}
                  onChange={e => setEditingProfile(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                <input 
                  type="email"
                  required
                  disabled={!!editingProfile?.id}
                  value={editingProfile?.email || ""}
                  onChange={e => setEditingProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all disabled:opacity-50"
                  placeholder="email@empresa.com"
                />
              </div>

              {!editingProfile?.id && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Senha Inicial</label>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nível de Acesso</label>
                  <select 
                    value={editingProfile?.role || "ATENDENTE"}
                    onChange={e => setEditingProfile(prev => ({ ...prev, role: e.target.value as Profile['role'] }))}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer"
                  >
                    {Object.entries(roleLabels).map(([val, label]) => (
                      <option key={val} value={val} className="bg-[#09090b]">{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Status</label>
                  <div 
                    onClick={() => setEditingProfile(prev => ({ ...prev, status: !prev?.status }))}
                    className="flex items-center gap-3 h-[42px] px-4 bg-zinc-900/50 border border-zinc-800 rounded-lg cursor-pointer group"
                  >
                    <div className={`w-8 h-4 rounded-full transition-all relative ${editingProfile?.status ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all ${editingProfile?.status ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {editingProfile?.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold text-sm transition-all border border-zinc-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
