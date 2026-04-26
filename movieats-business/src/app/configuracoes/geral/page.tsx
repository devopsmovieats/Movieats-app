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
    localStorage.setItem("movieats_system_settings", JSON.stringify(settings));
    Toast.fire({
      icon: "success",
      title: "Configurações salvas!",
      iconColor: "#ea580c" // Orange 600
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Toast.fire({ icon: "error", title: "Arquivo muito grande! (Máx 2MB)", iconColor: "#ef4444" });
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
        Toast.fire({ icon: "success", title: "Imagem carregada!", iconColor: "#ea580c" });
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
          Toast.fire({ icon: "info", title: "Endereço localizado!", iconColor: "#3b82f6" });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      }
    }
  };

  const ImagePlaceholder = ({ label, type }: { label: string, type: 'logo' | 'banner' }) => (
    <div 
      onClick={() => type === 'logo' ? logoInputRef.current?.click() : bannerInputRef.current?.click()}
      className={`relative group ${type === 'logo' ? 'w-24 h-24' : 'w-full h-24'} bg-slate-50 dark:bg-muted border border-border rounded-md flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-slate-200 dark:hover:bg-muted/80`}
    >
      <div className="flex flex-col items-center justify-center pointer-events-none">
        <ImageIcon className="w-6 h-6 text-slate-400 dark:text-muted-foreground/20 mb-1" />
        <span className="text-[8px] font-black text-slate-400 dark:text-muted-foreground/30 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="absolute inset-0 bg-orange-600/5 opacity-0 group-hover:opacity-100 rounded-md transition-opacity flex items-center justify-center">
        <span className="text-[9px] font-black text-orange-600 uppercase tracking-tighter">Fazer Upload</span>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto min-h-full">
        {/* Hidden Inputs para Upload */}
        <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" className="hidden" />
        <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" className="hidden" />

        <form id="config-form" onSubmit={handleSave} className="flex flex-col gap-8 pb-20">
          
          {/* Header - Fixed/Sticky Robusto */}
          <div className="sticky -top-8 z-50 py-8 bg-slate-50 dark:bg-background border-b border-border -mx-8 px-8 mb-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-orange-600/10 rounded-md shadow-sm">
                    <Settings className="text-orange-600 w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-headline font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                    Configurações
                  </h2>
                </div>
                <p className="text-slate-500 dark:text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Gestão de Marca & Sistema</p>
              </div>
              <button 
                type="submit" 
                className="group flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 cursor-pointer outline-none active:scale-95"
              >
                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Salvar Alterações
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             
             {/* Informações Básicas */}
             <div className="bg-white dark:bg-card border border-border rounded-md p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                   <Store className="w-4 h-4 text-orange-600" />
                   <span className="text-[10px] font-black text-slate-950 dark:text-foreground uppercase tracking-widest">Informações Básicas</span>
                </div>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Nome Fantasia</label>
                      <input 
                        type="text" 
                        value={settings.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSettings({...settings, name: val});
                          syncBranding(val, settings.logo);
                        }}
                        className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-3.5 px-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Slogan / Descrição Curta</label>
                      <textarea 
                        rows={2}
                        value={settings.description}
                        onChange={(e) => setSettings({...settings, description: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-3.5 px-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold resize-none"
                      />
                   </div>
                </div>
             </div>

             {/* Identidade Visual */}
             <div className="bg-white dark:bg-card border border-border rounded-md p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                   <ImageIcon className="w-4 h-4 text-orange-600" />
                   <span className="text-[10px] font-black text-slate-950 dark:text-foreground uppercase tracking-widest">Imagens da Loja</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Logo (500x500)</label>
                      {settings.logo ? (
                        <div 
                          onClick={() => logoInputRef.current?.click()}
                          className="relative group w-24 h-24 mx-auto sm:mx-0 cursor-pointer"
                        >
                           <img src={settings.logo} className="w-full h-full object-cover rounded-md border border-border group-hover:opacity-50 transition-opacity" />
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-6 h-6 text-slate-900 dark:text-foreground" />
                           </div>
                        </div>
                      ) : (
                        <div className="flex justify-center sm:justify-start">
                          <ImagePlaceholder label="Logo" type="logo" />
                        </div>
                      )}
                   </div>
                   <div className="sm:col-span-2 space-y-3">
                      <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Banner Capa (1200x400)</label>
                      {settings.banner ? (
                        <div 
                          onClick={() => bannerInputRef.current?.click()}
                          className="relative group h-24 cursor-pointer"
                        >
                           <img src={settings.banner} className="w-full h-full object-cover rounded-md border border-border group-hover:opacity-50 transition-opacity" />
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-6 h-6 text-slate-900 dark:text-foreground" />
                           </div>
                        </div>
                      ) : (
                        <ImagePlaceholder label="Capa" type="banner" />
                      )}
                   </div>
                </div>
             </div>
          </div>

          {/* Endereço Operacional - Layout Compacto */}
          <div className="bg-white dark:bg-card border border-border rounded-md p-6 sm:p-8 space-y-6 shadow-sm">
             <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="text-[10px] font-black text-slate-950 dark:text-foreground uppercase tracking-widest">Endereço Operacional</span>
             </div>
             
             <div className="space-y-4">
                {/* Linha 1 */}
                <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                   <div className="md:col-span-3 space-y-2">
                      <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">CEP</label>
                      <div className="relative group">
                         <input 
                           type="text" 
                           placeholder="00000-000"
                           value={settings.cep}
                           onBlur={handleCepBlur}
                           onChange={(e) => setSettings({...settings, cep: e.target.value})}
                           className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-3 px-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-muted-foreground/20"
                         />
                         <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-muted-foreground/20 group-focus-within:text-orange-600 transition-colors cursor-default" />
                      </div>
                   </div>
                   <div className="md:col-span-5 space-y-2">
                      <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Rua / Logradouro</label>
                      <input 
                       type="text" 
                       value={settings.street}
                       onChange={(e) => setSettings({...settings, street: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-3 px-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold"
                      />
                   </div>
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Nº</label>
                      <input 
                       type="text" 
                       value={settings.number}
                       onChange={(e) => setSettings({...settings, number: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-3 px-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold"
                      />
                   </div>
                </div>

                {/* Linha 2 */}
                <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                   <div className="md:col-span-4 space-y-2">
                      <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Bairro</label>
                      <input 
                       type="text" 
                       value={settings.neighborhood}
                       onChange={(e) => setSettings({...settings, neighborhood: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-3 px-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold"
                      />
                   </div>
                   <div className="md:col-span-4 space-y-2">
                      <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Cidade</label>
                      <input 
                       type="text" 
                       value={settings.city}
                       onChange={(e) => setSettings({...settings, city: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-3 px-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold"
                      />
                   </div>
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">UF</label>
                      <input 
                       type="text" 
                       maxLength={2}
                       value={settings.uf}
                       onChange={(e) => setSettings({...settings, uf: e.target.value.toUpperCase()})}
                       className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-3 px-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold"
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Canais de Contato */}
          <div className="bg-white dark:bg-card border border-border rounded-md p-6 sm:p-8 space-y-6 shadow-sm">
             <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-orange-600" />
                <span className="text-[10px] font-black text-slate-950 dark:text-foreground uppercase tracking-widest">Canais de Atendimento</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">WhatsApp de Suporte</label>
                   <div className="relative group">
                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-muted-foreground/20 group-focus-within:text-orange-600 transition-colors cursor-default" />
                     <input 
                       type="text" 
                       placeholder="(00) 00000-0000"
                       value={settings.whatsapp}
                       onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-3.5 pl-12 pr-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-muted-foreground/20"
                     />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Instagram (@)</label>
                   <div className="relative group">
                     <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-muted-foreground/20 group-focus-within:text-orange-600 transition-colors cursor-default" />
                     <input 
                       type="text" 
                       placeholder="movieats.oficial"
                       value={settings.instagram}
                       onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-3.5 pl-12 pr-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-muted-foreground/20"
                     />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">E-mail para Publicidade</label>
                   <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-muted-foreground/20 group-focus-within:text-orange-600 transition-colors cursor-default" />
                     <input 
                       type="email" 
                       placeholder="comercial@loja.com"
                       value={settings.email}
                       onChange={(e) => setSettings({...settings, email: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-3.5 pl-12 pr-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-muted-foreground/20"
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
