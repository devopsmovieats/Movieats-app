"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Settings, 
  Store, 
  MapPin, 
  Phone, 
  Camera, 
  Mail, 
  Image as ImageIcon, 
  Search,
  Globe,
  Loader2
} from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";

const ESTABLISHMENT_ID = "17db3a9f-f6c1-434d-8f4a-e40cd67035f2";

interface SystemSettings {
  nome_loja: string;
  descricao: string;
  url_logo: string;
  url_banner: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  telefone: string;
  instagram: string;
  email: string;
  entrega_ativa: boolean;
}

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  background: "#0f172a",
  color: "#fff",
  customClass: {
    popup: "rounded-md border border-slate-700"
  }
});

export default function ConfigGeralPage() {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<SystemSettings>({
    nome_loja: "",
    descricao: "",
    url_logo: "", 
    url_banner: "", 
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    telefone: "",
    instagram: "",
    email: "",
    entrega_ativa: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("bd_config_estabelecimento")
        .select("*")
        .eq("establishment_id", ESTABLISHMENT_ID)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setSettings({
          nome_loja: data.nome_loja || "",
          descricao: data.descricao || "",
          url_logo: data.url_logo || "",
          url_banner: data.url_banner || "",
          cep: data.cep || "",
          rua: data.rua || "",
          numero: data.numero || "",
          bairro: data.bairro || "",
          cidade: data.cidade || "",
          uf: data.uf || "",
          telefone: data.telefone || "",
          instagram: data.instagram || "",
          email: data.email || "",
          entrega_ativa: data.entrega_ativa ?? true
        });
      }
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const fullAddress = `${settings.rua}, ${settings.numero} - ${settings.bairro}, ${settings.cidade}/${settings.uf}`;

    try {
      const { error } = await supabase
        .from("bd_config_estabelecimento")
        .upsert({
          establishment_id: ESTABLISHMENT_ID,
          nome_loja: settings.nome_loja,
          descricao: settings.descricao,
          url_logo: settings.url_logo,
          url_banner: settings.url_banner,
          endereco: fullAddress, // Campo unificado solicitado
          cep: settings.cep,
          rua: settings.rua,
          numero: settings.numero,
          bairro: settings.bairro,
          cidade: settings.cidade,
          uf: settings.uf,
          telefone: settings.telefone,
          instagram: settings.instagram,
          email: settings.email,
          entrega_ativa: settings.entrega_ativa,
          updated_at: new Date().toISOString()
        }, { onConflict: "establishment_id" });

      if (error) throw error;

      Toast.fire({ icon: "success", title: "Configurações salvas!" });
    } catch (err) {
      console.error("Erro ao salvar:", err);
      Toast.fire({ icon: "error", title: "Erro ao salvar no banco." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'url_logo' | 'url_banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({...prev, [type]: reader.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCepBlur = async () => {
    const cleanCep = settings.cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setSettings(prev => ({
            ...prev,
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            uf: data.uf
          }));
        }
      } catch (error) {
        console.error("Erro CEP", error);
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-900 -m-8 p-10 animate-in fade-in duration-500">
        <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'url_logo')} accept="image/*" className="hidden" />
        <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'url_banner')} accept="image/*" className="hidden" />

        <form onSubmit={handleSave} className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Settings className="text-orange-600 w-5 h-5" />
              <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Configurações Gerais</h1>
            </div>
            
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-8 py-3 bg-white hover:bg-orange-600 text-black hover:text-white rounded-md font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer border-none"
            >
              {isSaving ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Informações</h3>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Loja</label>
                  <input 
                    type="text" 
                    value={settings.nome_loja}
                    onChange={(e) => setSettings({...settings, nome_loja: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:outline-none focus:border-orange-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</label>
                  <textarea 
                    rows={3}
                    value={settings.descricao}
                    onChange={(e) => setSettings({...settings, descricao: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:outline-none focus:border-orange-600 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Imagens</h3>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block">Logotipo</label>
                    <div 
                      onClick={() => logoInputRef.current?.click()}
                      className="relative w-28 h-28 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-orange-600 transition-all overflow-hidden"
                    >
                      {settings.url_logo ? (
                        <img src={settings.url_logo} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-700" />
                      )}
                    </div>
                    <p className="text-[9px] text-gray-500 font-bold">Sugestão: Logo (512x512px)</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block">Banner</label>
                    <div 
                      onClick={() => bannerInputRef.current?.click()}
                      className="relative h-28 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-orange-600 transition-all overflow-hidden"
                    >
                      {settings.url_banner ? (
                        <img src={settings.url_banner} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-700" />
                      )}
                    </div>
                    <p className="text-[9px] text-gray-500 font-bold">Sugestão: Banner (1920x1080px)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Endereço</h3>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CEP</label>
                  <input 
                    type="text" 
                    value={settings.cep}
                    onBlur={handleCepBlur}
                    onChange={(e) => setSettings({...settings, cep: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rua</label>
                  <input 
                    type="text" 
                    value={settings.rua}
                    onChange={(e) => setSettings({...settings, rua: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bairro</label>
                  <input 
                    type="text" 
                    value={settings.bairro}
                    onChange={(e) => setSettings({...settings, bairro: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</label>
                  <input 
                    type="text" 
                    value={settings.cidade}
                    onChange={(e) => setSettings({...settings, cidade: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">UF</label>
                  <input 
                    type="text" 
                    value={settings.uf}
                    onChange={(e) => setSettings({...settings, uf: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nº</label>
                  <input 
                    type="text" 
                    value={settings.numero}
                    onChange={(e) => setSettings({...settings, numero: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Contato e Canais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  value={settings.telefone}
                  onChange={(e) => setSettings({...settings, telefone: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Instagram (@)</label>
                <input 
                  type="text" 
                  value={settings.instagram}
                  onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</label>
                <input 
                  type="email" 
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>
            </div>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}





