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
  background: "#141414",
  color: "#fff",
  customClass: {
    popup: "rounded-xl border border-white/5 shadow-2xl shadow-black/50"
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
      className={`relative group ${type === 'logo' ? 'w-24 h-24' : 'w-full h-32'} bg-white/[0.05] border border-white/5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-white/[0.08] hover:border-[#ff6b00]/40 overflow-hidden shadow-xl`}
    >
      <div className="flex flex-col items-center justify-center pointer-events-none">
        <ImageIcon className="w-6 h-6 text-white/20 mb-2 group-hover:text-[#ff6b00] transition-colors" />
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="absolute inset-0 bg-[#ff6b00]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
        <Camera className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-10 animate-in fade-in duration-700">
        <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" className="hidden" />
        <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" className="hidden" />

        <form onSubmit={handleSave} className="space-y-12">
          
          {/* Header Superior - Padronizado Elite */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-white/[0.03]">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#ff6b00]/10 rounded-2xl border border-[#ff6b00]/20">
                  <Settings className="text-[#ff6b00] w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">CONFIGURAÇÕES GERAIS</h1>
              </div>
              <p className="text-muted-foreground/60 text-[11px] font-bold uppercase tracking-widest ml-1 opacity-50">Identidade Visual e Parâmetros da Loja</p>
            </div>
            
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-14 py-4 bg-[#ff6b00] hover:bg-[#e66000] disabled:opacity-50 disabled:hover:bg-[#ff6b00] text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 cursor-pointer shadow-xl shadow-[#ff6b00]/20 min-w-[280px] text-center border-none"
            >
              {isSaving ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sincronizando...</span>
                </div>
              ) : "Salvar Alterações"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Coluna Esquerda: Dados e Localização */}
            <div className="lg:col-span-7 space-y-10">
              
              {/* Card: Informações da Loja */}
              <div className="bg-[#111827] border border-white/5 rounded-[32px] p-8 space-y-8 shadow-2xl">
                <div className="flex items-center gap-3 pb-4 border-b border-white/[0.03]">
                  <Store className="w-4 h-4 text-[#ff6b00]" />
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Dados do Estabelecimento</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Nome Fantasia</label>
                    <input 
                      type="text" 
                      value={settings.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings({...settings, name: val});
                        syncBranding(val, settings.logo);
                      }}
                      placeholder="Nome da sua loja"
                      className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl px-5 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-[#ff6b00]/50 transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Slogan / Biografia</label>
                    <textarea 
                      rows={3}
                      value={settings.description}
                      onChange={(e) => setSettings({...settings, description: e.target.value})}
                      placeholder="Ex: O melhor hambúrguer artesanal da região..."
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-5 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-[#ff6b00]/50 transition-all font-medium resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Card: Endereço Operacional */}
              <div className="bg-[#111827] border border-white/5 rounded-[32px] p-8 space-y-8 shadow-2xl">
                <div className="flex items-center gap-3 pb-4 border-b border-white/[0.03]">
                  <MapPin className="w-4 h-4 text-[#ff6b00]" />
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Localização Operacional</h3>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">CEP</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={settings.cep}
                          onBlur={handleCepBlur}
                          onChange={(e) => setSettings({...settings, cep: e.target.value})}
                          placeholder="00000-000"
                          className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl px-5 text-sm text-white focus:outline-none focus:border-[#ff6b00]/50 transition-all font-bold"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Cidade / UF</label>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={settings.city}
                          readOnly
                          className="flex-1 h-12 bg-white/[0.02] border border-white/10 rounded-xl px-5 text-sm text-white/40 font-bold outline-none"
                        />
                        <input 
                          type="text" 
                          value={settings.uf}
                          readOnly
                          className="w-16 h-12 bg-white/[0.02] border border-white/10 rounded-xl text-center text-sm text-white/40 font-bold outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2.5">
                      <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Rua / Logradouro</label>
                      <input 
                        type="text" 
                        value={settings.street}
                        onChange={(e) => setSettings({...settings, street: e.target.value})}
                        className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl px-5 text-sm text-white font-bold focus:border-[#ff6b00]/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Bairro</label>
                      <input 
                        type="text" 
                        value={settings.neighborhood}
                        onChange={(e) => setSettings({...settings, neighborhood: e.target.value})}
                        className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl px-5 text-sm text-white font-bold focus:border-[#ff6b00]/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Imagens e Canais */}
            <div className="lg:col-span-5 space-y-10">
              
              {/* Card: Identidade Visual */}
              <div className="bg-[#111827] border border-white/5 rounded-[32px] p-8 space-y-8 shadow-2xl">
                <div className="flex items-center gap-3 pb-4 border-b border-white/[0.03]">
                  <ImageIcon className="w-4 h-4 text-[#ff6b00]" />
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Mídias da Marca</h3>
                </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Logotipo (Square)</label>
                    {settings.logo ? (
                      <div className="relative group w-28 h-28 rounded-[24px] overflow-hidden border border-white/10 cursor-pointer shadow-2xl" onClick={() => logoInputRef.current?.click()}>
                        <img src={settings.logo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Logo" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-28 h-28">
                        <ImagePlaceholder label="Logo" type="logo" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Banner Principal</label>
                    {settings.banner ? (
                      <div className="relative group w-full h-40 rounded-[24px] overflow-hidden border border-white/10 cursor-pointer shadow-2xl" onClick={() => bannerInputRef.current?.click()}>
                        <img src={settings.banner} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Banner" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <ImagePlaceholder label="Banner" type="banner" />
                    )}
                  </div>
                </div>
              </div>

              {/* Card: Canais Digitais */}
              <div className="bg-[#111827] border border-white/5 rounded-[32px] p-8 space-y-8 shadow-2xl">
                <div className="flex items-center gap-3 pb-4 border-b border-white/[0.03]">
                  <Globe className="w-4 h-4 text-[#ff6b00]" />
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Canais Digitais</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">WhatsApp Business</label>
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={settings.whatsapp}
                        onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                        placeholder="(00) 00000-0000"
                        className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl pl-12 pr-5 text-sm text-white font-bold focus:border-[#ff6b00]/50 outline-none transition-all"
                      />
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#ff6b00] transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">Instagram Business</label>
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={settings.instagram}
                        onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                        placeholder="@seu.negocio"
                        className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl pl-12 pr-5 text-sm text-white font-bold focus:border-[#ff6b00]/50 outline-none transition-all"
                      />
                      <Camera className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#ff6b00] transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest ml-1">E-mail Comercial</label>
                    <div className="relative group">
                      <input 
                        type="email" 
                        value={settings.email}
                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                        placeholder="contato@empresa.com"
                        className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl pl-12 pr-5 text-sm text-white font-bold focus:border-[#ff6b00]/50 outline-none transition-all"
                      />
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#ff6b00] transition-colors" />
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

