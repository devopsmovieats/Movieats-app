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
    whatsapp: "",
    instagram: "",
    email: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("bd_config_estabelecimento")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        // Decompor o endereço para os campos individuais para UX
        let rua = "", numero = "", bairro = "", cidade = "", uf = "";
        if (data.endereco) {
          try {
            // Padrão: "Rua, Numero - Bairro, Cidade/UF"
            const [main, rest] = data.endereco.split(" - ");
            const [street, num] = main.split(", ");
            const [neighborhood, cityState] = rest.split(", ");
            const [city, state] = cityState.split("/");
            
            rua = street || "";
            numero = num || "";
            bairro = neighborhood || "";
            cidade = city || "";
            uf = state || "";
          } catch (e) {
            rua = data.endereco;
          }
        }

        setSettings({
          nome_loja: data.nome_loja || "",
          descricao: data.descricao || "",
          url_logo: data.url_logo || "",
          url_banner: data.url_banner || "",
          cep: data.cep || "",
          rua: rua || "",
          numero: numero || "",
          bairro: bairro || "",
          cidade: cidade || "",
          uf: uf || "",
          telefone: data.telefone || "",
          whatsapp: data.whatsapp || "",
          instagram: data.instagram || "",
          email: data.email || ""
        });
      }
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Concatenar campos para o banco (Single Column Pattern)
    const fullAddress = `${settings.rua}, ${settings.numero} - ${settings.bairro}, ${settings.cidade}/${settings.uf}`;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado no Supabase");

      let finalLogoUrl = settings.url_logo;
      let finalBannerUrl = settings.url_banner;

      // Upload Logo para R2 se houver arquivo novo
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        formData.append('establishment_id', user.id);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error("Erro ao subir Logo para o Cloudflare");
        const { url } = await res.json();
        finalLogoUrl = url;
      }

      // Upload Banner para R2 se houver arquivo novo
      if (bannerFile) {
        const formData = new FormData();
        formData.append('file', bannerFile);
        formData.append('establishment_id', user.id);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error("Erro ao subir Banner para o Cloudflare");
        const { url } = await res.json();
        finalBannerUrl = url;
      }

      const { error } = await supabase
        .from("bd_config_estabelecimento")
        .upsert({
          id: user.id,
          nome_loja: settings.nome_loja,
          descricao: settings.descricao,
          url_logo: finalLogoUrl,
          url_banner: finalBannerUrl,
          endereco: fullAddress,
          telefone: settings.telefone,
          whatsapp: settings.whatsapp,
          cep: settings.cep,
          instagram: settings.instagram,
          email: settings.email
        }, { onConflict: "id" });

      console.log("AUDITORIA SALVAMENTO - PAYLOAD:", {
        id: user.id,
        whatsapp: settings.whatsapp,
        telefone: settings.telefone
      });

      if (error) {
        console.log("ERRO_SUPABASE_DETALHADO:", error);
        throw error;
      }

      console.log("Success: Configurações salvas no Supabase");
      
      window.dispatchEvent(new CustomEvent("movieats:branding_update", {
        detail: { 
          name: settings.nome_loja, 
          logo: finalLogoUrl 
        }
      }));

      // Atualiza o estado local com as URLs finais para evitar dessincronia
      setSettings(prev => ({ ...prev, url_logo: finalLogoUrl, url_banner: finalBannerUrl }));

      Toast.fire({ icon: "success", title: "Configurações salvas!" });
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      Toast.fire({ icon: "error", title: "Erro ao salvar no banco." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'url_logo' | 'url_banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'url_logo') {
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      } else {
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
      }
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
              <h1 className="text-xl font-bold text-white tracking-tight uppercase">Configurações Gerais</h1>
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
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Informações</h3>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome da Loja</label>
                  <input 
                    type="text" 
                    value={settings.nome_loja}
                    onChange={(e) => setSettings({...settings, nome_loja: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:outline-none focus:border-orange-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição</label>
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
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Imagens</h3>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Logotipo</label>
                      <div 
                        onClick={() => logoInputRef.current?.click()}
                        className="relative w-28 h-28 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-orange-600 transition-all overflow-hidden"
                      >
                        {logoPreview || settings.url_logo ? (
                          <img src={logoPreview || settings.url_logo} className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-6 h-6 text-slate-700" />
                        )}
                      </div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Sugestão: Logo (512x512px)</p>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Banner</label>
                      <div 
                        onClick={() => bannerInputRef.current?.click()}
                        className="relative h-28 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-orange-600 transition-all overflow-hidden"
                      >
                        {bannerPreview || settings.url_banner ? (
                          <img src={bannerPreview || settings.url_banner} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-700" />
                        )}
                      </div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Sugestão: Banner (1920x1080px)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Endereço</h3>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-6">
              <div className="grid grid-cols-4 gap-6">
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CEP</label>
                  <input 
                    type="text" 
                    placeholder="00000-000"
                    value={settings.cep}
                    onBlur={handleCepBlur}
                    onChange={(e) => setSettings({...settings, cep: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rua</label>
                  <input 
                    type="text" 
                    placeholder="Nome da rua"
                    value={settings.rua}
                    onChange={(e) => setSettings({...settings, rua: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                </div>

                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bairro</label>
                  <input 
                    type="text" 
                    placeholder="Nome do bairro"
                    value={settings.bairro}
                    onChange={(e) => setSettings({...settings, bairro: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cidade</label>
                  <input 
                    type="text" 
                    placeholder="Sua cidade"
                    value={settings.cidade}
                    onChange={(e) => setSettings({...settings, cidade: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UF</label>
                  <input 
                    type="text" 
                    placeholder="UF"
                    value={settings.uf}
                    onChange={(e) => setSettings({...settings, uf: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none text-center"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nº</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 123"
                    value={settings.numero}
                    onChange={(e) => setSettings({...settings, numero: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Contato e Social</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp</label>
                <input 
                  type="text" 
                  placeholder="(99) 99999-9999"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({...settings, whatsapp: maskPhone(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telefone</label>
                <input 
                  type="text" 
                  placeholder="(99) 4444-4444"
                  value={settings.telefone}
                  onChange={(e) => setSettings({...settings, telefone: maskPhone(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instagram (@)</label>
                <input 
                  type="text" 
                  placeholder="@seu.perfil"
                  value={settings.instagram}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val && !val.startsWith("@") && val.length > 0) val = "@" + val;
                    setSettings({...settings, instagram: val});
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm text-gray-400 focus:border-orange-600 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail</label>
                <input 
                  type="email" 
                  placeholder="contato@loja.com"
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





