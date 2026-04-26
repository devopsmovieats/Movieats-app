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
  Save,
  Search,
  Globe,
  Loader2
} from "lucide-react";
import Swal from "sweetalert2";

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
  background: "#1a1a1a",
  color: "#fff",
  customClass: {
    popup: "rounded-lg border border-white/10 shadow-2xl"
  }
});

export default function ConfigGeralPage() {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<SystemSettings>({
    name: "Movieats Burguer",
    description: "O melhor hambúrguer artesanal da cidade",
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

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("movieats_system_settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const syncBranding = (newName: string, newLogo: string) => {
    const event = new CustomEvent("movieats:branding_update", {
      detail: { name: newName, logo: newLogo }
    });
    window.dispatchEvent(event);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      localStorage.setItem("movieats_system_settings", JSON.stringify(settings));
      setIsSaving(false);
      Toast.fire({
        icon: "success",
        title: "Alterações salvas com sucesso!"
      });
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Toast.fire({ icon: "error", title: "Arquivo muito grande! (Máx 5MB)" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSettings(prev => {
          const next = {...prev, [type]: result};
          if (type === 'logo') syncBranding(next.name, result);
          return next;
        });
        Toast.fire({ icon: "success", title: "Imagem carregada!" });
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
          Toast.fire({ icon: "success", title: "CEP localizado!" });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      }
    }
  };

  const ImagePlaceholder = ({ label, type }: { label: string, type: 'logo' | 'banner' }) => (
    <div 
      onClick={() => type === 'logo' ? logoInputRef.current?.click() : bannerInputRef.current?.click()}
      className={`relative group ${type === 'logo' ? 'w-24 h-24' : 'w-full h-24'} bg-[#1a1a1a] border border-white/10 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-[#222] overflow-hidden`}
    >
      <ImageIcon className="w-5 h-5 text-gray-600 mb-1" />
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#121212] -m-8 p-8 animate-in fade-in duration-500">
        <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" className="hidden" />
        <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" className="hidden" />

        <form onSubmit={handleSave} className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Superior Estilo Elite */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Settings className="text-orange-600 w-6 h-6" />
              <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Configurações Gerais</h1>
            </div>
            
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>SALVAR ALTERAÇÕES</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Dados Básicos */}
            <div className="bg-[#121212] border border-white/10 rounded-lg p-6 space-y-6 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Informações da Loja</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nome Fantasia</label>
                  <input 
                    type="text" 
                    value={settings.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings({...settings, name: val});
                      syncBranding(val, settings.logo);
                    }}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-3 px-4 text-sm text-gray-400 focus:outline-none focus:border-orange-600 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Slogan / Descrição</label>
                  <textarea 
                    rows={2}
                    value={settings.description}
                    onChange={(e) => setSettings({...settings, description: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-3 px-4 text-sm text-gray-400 focus:outline-none focus:border-orange-600 transition-all font-medium resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Identidade Visual */}
            <div className="bg-[#121212] border border-white/10 rounded-lg p-6 space-y-6 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Identidade Visual</h3>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Logo</label>
                  {settings.logo ? (
                    <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-white/10 cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                      <img src={settings.logo} className="w-full h-full object-cover" alt="Logo" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20">
                      <ImagePlaceholder label="Logo" type="logo" />
                    </div>
                  )}
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Banner</label>
                  {settings.banner ? (
                    <div className="relative group h-20 rounded-lg overflow-hidden border border-white/10 cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
                      <img src={settings.banner} className="w-full h-full object-cover" alt="Banner" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <ImagePlaceholder label="Banner" type="banner" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Endereço - Grid 4 Colunas */}
          <div className="bg-[#121212] border border-white/10 rounded-lg p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Endereço Operacional</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">CEP</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={settings.cep}
                    onBlur={handleCepBlur}
                    onChange={(e) => setSettings({...settings, cep: e.target.value})}
                    placeholder="00000-000"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-700" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Rua / Logradouro</label>
                <input 
                  type="text" 
                  value={settings.street}
                  onChange={(e) => setSettings({...settings, street: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>

              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Bairro</label>
                <input 
                  type="text" 
                  value={settings.neighborhood}
                  onChange={(e) => setSettings({...settings, neighborhood: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Cidade</label>
                <input 
                  type="text" 
                  value={settings.city}
                  readOnly
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-3 px-4 text-sm text-gray-600 cursor-not-allowed"
                />
              </div>
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">UF</label>
                <input 
                  type="text" 
                  value={settings.uf}
                  readOnly
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-3 px-4 text-sm text-gray-600 text-center"
                />
              </div>
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nº</label>
                <input 
                  type="text" 
                  value={settings.number}
                  onChange={(e) => setSettings({...settings, number: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Atendimento */}
          <div className="bg-[#121212] border border-white/10 rounded-lg p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Canais de Contato</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                  <input 
                    type="text" 
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-3 pl-12 pr-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Instagram (@)</label>
                <div className="relative">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                  <input 
                    type="text" 
                    value={settings.instagram}
                    onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-3 pl-12 pr-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                  <input 
                    type="email" 
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-3 pl-12 pr-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}


