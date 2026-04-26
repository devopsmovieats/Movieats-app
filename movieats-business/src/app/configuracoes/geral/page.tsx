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
  name: string;
  description: string;
  logo: string;
  banner: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  uf: string;
  whatsapp: string;
  instagram: string;
  email: string;
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
    name: "",
    description: "",
    logo: "", 
    banner: "", 
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    uf: "",
    whatsapp: "",
    instagram: "",
    email: "",
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
          name: data.name || "",
          description: data.description || "",
          logo: data.logo_url || "",
          banner: data.banner_url || "",
          cep: data.cep || "",
          street: data.street || "",
          number: data.number || "",
          neighborhood: data.neighborhood || "",
          city: data.city || "",
          uf: data.uf || "",
          whatsapp: data.whatsapp || "",
          instagram: data.instagram || "",
          email: data.email || "",
        });
      }
    } catch (err) {
      console.error("Erro ao carregar configurações:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("bd_config_estabelecimento")
        .upsert({
          establishment_id: ESTABLISHMENT_ID,
          name: settings.name,
          description: settings.description,
          logo_url: settings.logo,
          banner_url: settings.banner,
          cep: settings.cep,
          street: settings.street,
          number: settings.number,
          neighborhood: settings.neighborhood,
          city: settings.city,
          uf: settings.uf,
          whatsapp: settings.whatsapp,
          instagram: settings.instagram,
          email: settings.email,
          updated_at: new Date().toISOString()
        }, { onConflict: "establishment_id" });

      if (error) throw error;

      Toast.fire({
        icon: "success",
        title: "Configurações salvas!"
      });
    } catch (err) {
      console.error("Erro ao salvar:", err);
      Toast.fire({ icon: "error", title: "Erro ao salvar no banco." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
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
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
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
        <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" className="hidden" />
        <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" className="hidden" />

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
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Informações Básicas</h3>
                </div>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider ml-7">Dados principais do estabelecimento</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nome do Estabelecimento</label>
                  <input 
                    type="text" 
                    value={settings.name}
                    onChange={(e) => setSettings({...settings, name: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:outline-none focus:border-orange-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Bio / Slogan</label>
                  <textarea 
                    rows={3}
                    value={settings.description}
                    onChange={(e) => setSettings({...settings, description: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:outline-none focus:border-orange-600 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Identidade Visual</h3>
                </div>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider ml-7">Logo e Banner do Cardápio</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Logotipo</label>
                  <div 
                    onClick={() => logoInputRef.current?.click()}
                    className="relative w-28 h-28 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-orange-600 transition-all overflow-hidden"
                  >
                    {settings.logo ? (
                      <img src={settings.logo} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-700" />
                    )}
                  </div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Ideal: 512x512px</p>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Banner</label>
                  <div 
                    onClick={() => bannerInputRef.current?.click()}
                    className="relative h-28 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-orange-600 transition-all overflow-hidden"
                  >
                    {settings.banner ? (
                      <img src={settings.banner} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-700" />
                    )}
                  </div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Ideal: 1920x1080px</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Localização Operacional</h3>
              </div>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider ml-7">Dados de endereço e contato</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">CEP</label>
                <input 
                  type="text" 
                  value={settings.cep}
                  onBlur={handleCepBlur}
                  onChange={(e) => setSettings({...settings, cep: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Rua</label>
                <input 
                  type="text" 
                  value={settings.street}
                  onChange={(e) => setSettings({...settings, street: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Bairro</label>
                <input 
                  type="text" 
                  value={settings.neighborhood}
                  onChange={(e) => setSettings({...settings, neighborhood: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cidade</label>
                <input 
                  type="text" 
                  value={settings.city}
                  onChange={(e) => setSettings({...settings, city: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Número</label>
                <input 
                  type="text" 
                  value={settings.number}
                  onChange={(e) => setSettings({...settings, number: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">WhatsApp</label>
                <input 
                  type="text" 
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">E-mail</label>
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




