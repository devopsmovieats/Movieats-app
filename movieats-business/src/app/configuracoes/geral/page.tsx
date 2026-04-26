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
  Globe
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
  timer: 3000,
  timerProgressBar: true,
  background: "var(--card)",
  color: "var(--foreground)",
  customClass: {
    popup: "rounded-md border border-border shadow-2xl"
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
    
    // Simular delay de salvamento para UX
    setTimeout(() => {
      localStorage.setItem("movieats_system_settings", JSON.stringify(settings));
      setIsSaving(false);
      Toast.fire({
        icon: "success",
        title: "Configurações salvas com sucesso!",
        background: "#111827",
        color: "#fff"
      });
    }, 800);
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
          Toast.fire({ icon: "success", title: "Endereço localizado!" });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      }
    }
  };

  const ImagePlaceholder = ({ label, type }: { label: string, type: 'logo' | 'banner' }) => (
    <div 
      onClick={() => type === 'logo' ? logoInputRef.current?.click() : bannerInputRef.current?.click()}
      className={`relative group ${type === 'logo' ? 'w-24 h-24' : 'w-full h-32'} bg-white/[0.03] border border-white/10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-white/[0.05] hover:border-orange-500/50`}
    >
      <div className="flex flex-col items-center justify-center pointer-events-none">
        <ImageIcon className="w-6 h-6 text-white/10 mb-2" />
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="absolute inset-0 bg-orange-600/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center">
        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Alterar Imagem</span>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" className="hidden" />
        <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" className="hidden" />

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-orange-600/10 rounded-xl border border-orange-600/20">
                  <Settings className="text-orange-600 w-5 h-5" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">Configurações Gerais</h1>
              </div>
              <p className="text-muted-foreground/60 text-sm font-medium">Gerencie a identidade e informações fundamentais da sua loja.</p>
            </div>
            
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-10 py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 text-white rounded-xl font-black text-[13px] uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-lg shadow-orange-600/20 min-w-[240px] text-center"
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Coluna Esquerda: Informações e Endereço */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Card: Informações Básicas */}
              <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 space-y-8 shadow-2xl">
                <div className="flex items-center gap-3 pb-2 border-b border-white/[0.03]">
                  <Store className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Informações da Loja</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Nome Fantasia</label>
                    <input 
                      type="text" 
                      value={settings.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings({...settings, name: val});
                        syncBranding(val, settings.logo);
                      }}
                      placeholder="Ex: Movieats Burger"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl h-14 px-5 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Slogan ou Descrição</label>
                    <textarea 
                      rows={3}
                      value={settings.description}
                      onChange={(e) => setSettings({...settings, description: e.target.value})}
                      placeholder="Uma breve descrição que aparece no seu cardápio..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-5 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all font-bold resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card: Endereço */}
              <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 space-y-8 shadow-2xl">
                <div className="flex items-center gap-3 pb-2 border-b border-white/[0.03]">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Localização Operacional</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">CEP</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={settings.cep}
                        onBlur={handleCepBlur}
                        onChange={(e) => setSettings({...settings, cep: e.target.value})}
                        placeholder="00000-000"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl h-14 px-5 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 transition-all font-bold"
                      />
                      <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                    </div>
                  </div>

                  <div className="md:col-span-1 space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Cidade / UF</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={settings.city}
                        readOnly
                        className="flex-1 bg-white/[0.01] border border-white/5 rounded-xl h-14 px-5 text-sm text-white/40 font-bold outline-none"
                      />
                      <input 
                        type="text" 
                        value={settings.uf}
                        readOnly
                        className="w-20 bg-white/[0.01] border border-white/5 rounded-xl h-14 text-center text-sm text-white/40 font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-1 space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Rua / Logradouro</label>
                    <input 
                      type="text" 
                      value={settings.street}
                      onChange={(e) => setSettings({...settings, street: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl h-14 px-5 text-sm text-white font-bold focus:border-orange-500/50 outline-none transition-all"
                    />
                  </div>

                  <div className="md:col-span-1 space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Bairro</label>
                    <input 
                      type="text" 
                      value={settings.neighborhood}
                      onChange={(e) => setSettings({...settings, neighborhood: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl h-14 px-5 text-sm text-white font-bold focus:border-orange-500/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Imagens e Contato */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Card: Identidade Visual */}
              <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 space-y-8 shadow-2xl">
                <div className="flex items-center gap-3 pb-2 border-b border-white/[0.03]">
                  <ImageIcon className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Identidade Visual</h3>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Logotipo Principal</label>
                    {settings.logo ? (
                      <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border border-white/10 cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                        <img src={settings.logo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-32">
                        <ImagePlaceholder label="Logo" type="logo" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Banner de Capa</label>
                    {settings.banner ? (
                      <div className="relative group w-full h-40 rounded-2xl overflow-hidden border border-white/10 cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
                        <img src={settings.banner} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <ImagePlaceholder label="Banner" type="banner" />
                    )}
                  </div>
                </div>
              </div>

              {/* Card: Canais de Atendimento */}
              <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 space-y-8 shadow-2xl">
                <div className="flex items-center gap-3 pb-2 border-b border-white/[0.03]">
                  <Globe className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Canais Digitais</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">WhatsApp Business</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={settings.whatsapp}
                        onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                        placeholder="(00) 00000-0000"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl h-14 pl-14 pr-5 text-sm text-white font-bold focus:border-orange-500/50 outline-none transition-all"
                      />
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Instagram (@)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={settings.instagram}
                        onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                        placeholder="seu.restaurante"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl h-14 pl-14 pr-5 text-sm text-white font-bold focus:border-orange-500/50 outline-none transition-all"
                      />
                      <Camera className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">E-mail Comercial</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={settings.email}
                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                        placeholder="contato@loja.com"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl h-14 pl-14 pr-5 text-sm text-white font-bold focus:border-orange-500/50 outline-none transition-all"
                      />
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
