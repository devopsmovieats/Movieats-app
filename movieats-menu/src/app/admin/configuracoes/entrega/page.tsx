"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Truck, 
  MapPin, 
  Plus, 
  Trash2, 
  Save, 
  Search,
  DollarSign,
  Navigation,
  Globe,
  Clock,
  ChevronRight
} from "lucide-react";
import Swal from "sweetalert2";

interface City {
  id: string;
  name: string;
  uf: string;
  active: boolean;
}

interface Neighborhood {
  id: string;
  cityId: string;
  name: string;
  deliveryFee: number;
  estimatedTime: number;
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

export default function EntregaPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>("");

  const [newCity, setNewCity] = useState({ name: "", uf: "SP" });
  const [newNeighborhood, setNewNeighborhood] = useState({ 
    name: "", 
    cityId: "",
    deliveryFee: 0, 
    estimatedTime: 30 
  });

  const [rules, setRules] = useState({
    freeDelivery: false,
    freeValue: 0,
    fixRate: false,
    rateValue: 0,
    allowPickup: true
  });

  useEffect(() => {
    const savedCities = localStorage.getItem("movieats_cities");
    const savedNeighborhoods = localStorage.getItem("movieats_neighborhoods");
    const savedRules = localStorage.getItem("movieats_delivery_rules");

    if (savedCities) {
      const parsed = JSON.parse(savedCities);
      setCities(parsed);
      if (parsed.length > 0) {
        setSelectedCityId(parsed[0].id);
        setNewNeighborhood(prev => ({ ...prev, cityId: parsed[0].id }));
      }
    }
    if (savedNeighborhoods) setNeighborhoods(JSON.parse(savedNeighborhoods));
    if (savedRules) setRules(JSON.parse(savedRules));
  }, []);

  const saveRules = () => {
    localStorage.setItem("movieats_delivery_rules", JSON.stringify(rules));
    Toast.fire({ icon: "success", title: "Regras salvas!", iconColor: "#ea580c" });
  };

  const addCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.name) return;
    const city: City = { id: Math.random().toString(36).substr(2, 9), ...newCity, active: true };
    const newList = [...cities, city];
    setCities(newList);
    localStorage.setItem("movieats_cities", JSON.stringify(newList));
    setNewCity({ name: "", uf: "SP" });
    if (!selectedCityId) {
      setSelectedCityId(city.id);
      setNewNeighborhood(prev => ({ ...prev, cityId: city.id }));
    }
    Toast.fire({ icon: "success", title: "Cidade cadastrada!", iconColor: "#ea580c" });
  };

  const addNeighborhood = (e: React.FormEvent) => {
    e.preventDefault();
    const cityId = newNeighborhood.cityId || selectedCityId;
    if (!cityId || !newNeighborhood.name) {
       Toast.fire({ icon: "error", title: "Selecione uma cidade e nomeie o bairro", iconColor: "#ef4444" });
       return;
    }
    const neighbor: Neighborhood = { 
      id: Math.random().toString(36).substr(2, 9), 
      ...newNeighborhood,
      cityId: cityId 
    };
    const newList = [...neighborhoods, neighbor];
    setNeighborhoods(newList);
    localStorage.setItem("movieats_neighborhoods", JSON.stringify(newList));
    setNewNeighborhood({ ...newNeighborhood, name: "", deliveryFee: 0, estimatedTime: 30 });
    Toast.fire({ icon: "success", title: "Bairro cadastrado!", iconColor: "#ea580c" });
  };

  const deleteCity = (id: string) => {
    const newList = cities.filter(c => c.id !== id);
    setCities(newList);
    localStorage.setItem("movieats_cities", JSON.stringify(newList));
    setNeighborhoods(neighborhoods.filter(n => n.cityId !== id));
    if (selectedCityId === id) setSelectedCityId("");
    Toast.fire({ icon: "success", title: "Cidade removida!", iconColor: "#ef4444" });
  };

  const deleteNeighborhood = (id: string) => {
    const newList = neighborhoods.filter(n => n.id !== id);
    setNeighborhoods(newList);
    localStorage.setItem("movieats_neighborhoods", JSON.stringify(newList));
    Toast.fire({ icon: "success", title: "Bairro removido!", iconColor: "#ef4444" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-orange-600/10 rounded-md">
                <Truck className="text-orange-600 w-6 h-6" />
              </div>
              <h2 className="text-3xl font-headline font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Configurações de Entrega
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Gestão de Logística & Fretes</p>
          </div>
          <button 
            onClick={saveRules}
            className="flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
          >
            <Save className="w-4 h-4" /> Salvar Configurações Globais
          </button>
        </div>

        {/* 1. Regras Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-6 shadow-sm">
             <div className="flex items-center justify-between mb-5">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Entrega Grátis</span>
                   <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black opacity-60">Acima de R$ X</span>
                </div>
                <button 
                  onClick={() => setRules({...rules, freeDelivery: !rules.freeDelivery})}
                  className={`relative w-12 h-6 rounded-full transition-colors flex items-center px-1 ${rules.freeDelivery ? 'bg-orange-600' : 'bg-slate-300 dark:bg-zinc-800'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${rules.freeDelivery ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
             </div>
             <input 
               type="number" 
               disabled={!rules.freeDelivery}
               value={rules.freeValue}
               onChange={(e) => setRules({...rules, freeValue: parseFloat(e.target.value) || 0})}
               className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-4 px-4 text-sm font-black text-slate-900 dark:text-white focus:border-orange-600 outline-none transition-all disabled:opacity-20"
               placeholder="Valor Mínimo"
             />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-6 shadow-sm">
             <div className="flex items-center justify-between mb-5">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Taxa Única Fixa</span>
                   <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black opacity-60">Para todo o raio</span>
                </div>
                <button 
                  onClick={() => setRules({...rules, fixRate: !rules.fixRate})}
                  className={`relative w-12 h-6 rounded-full transition-colors flex items-center px-1 ${rules.fixRate ? 'bg-orange-600' : 'bg-slate-300 dark:bg-zinc-800'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${rules.fixRate ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
             </div>
             <input 
               type="number" 
               disabled={!rules.fixRate}
               value={rules.rateValue}
               onChange={(e) => setRules({...rules, rateValue: parseFloat(e.target.value) || 0})}
               className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-4 px-4 text-sm font-black text-slate-900 dark:text-white focus:border-orange-600 outline-none transition-all disabled:opacity-20"
               placeholder="Valor da Taxa"
             />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-6 flex flex-col justify-center shadow-sm">
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Retirada no Balcão</span>
                   <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black opacity-60">Ativar Takeout</span>
                </div>
                <button 
                  onClick={() => setRules({...rules, allowPickup: !rules.allowPickup})}
                  className={`relative w-12 h-6 rounded-full transition-colors flex items-center px-1 ${rules.allowPickup ? 'bg-orange-600' : 'bg-slate-300 dark:bg-zinc-800'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${rules.allowPickup ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
             </div>
          </div>
        </div>

        {/* Estrutura de Duas Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Coluna 1: Cidades */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-7 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-orange-600" />
                  <span className="text-lg font-headline font-black text-slate-900 dark:text-white uppercase tracking-tight">Cidades</span>
                </div>
                <button onClick={() => Toast.fire({ icon: 'success', title: 'Cidades atualizadas' })} className="p-2 text-slate-400 hover:text-orange-600 transition-colors">
                   <Save className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={addCity} className="flex gap-3 mb-8">
                 <input 
                   type="text" 
                   placeholder="NOME DA CIDADE"
                   value={newCity.name}
                   onChange={(e) => setNewCity({...newCity, name: e.target.value})}
                   className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md px-5 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all uppercase placeholder:text-slate-400"
                 />
                 <input 
                   type="text" 
                   maxLength={2}
                   placeholder="UF"
                   value={newCity.uf}
                   onChange={(e) => setNewCity({...newCity, uf: e.target.value.toUpperCase()})}
                   className="w-20 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md px-4 py-4 text-sm font-black text-slate-900 dark:text-white text-center outline-none focus:border-orange-600 transition-all uppercase"
                 />
                 <button type="submit" className="p-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 active:scale-95">
                    <Plus className="w-5 h-5" />
                 </button>
              </form>

              <div className="space-y-3">
                 {cities.map(city => (
                    <div 
                      key={city.id} 
                      onClick={() => {
                        setSelectedCityId(city.id);
                        setNewNeighborhood(prev => ({ ...prev, cityId: city.id }));
                      }}
                      className={`flex items-center justify-between p-5 rounded-md border transition-all cursor-pointer group
                        ${selectedCityId === city.id 
                          ? 'bg-orange-500 text-white border-orange-600 shadow-md' 
                          : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:translate-x-1'}
                      `}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-md ${selectedCityId === city.id ? 'bg-white/20' : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-orange-600'}`}>
                             <Navigation className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-black uppercase tracking-tight">
                             {city.name} - {city.uf}
                          </span>
                       </div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); deleteCity(city.id); }}
                         className={`p-2 transition-colors ${selectedCityId === city.id ? 'text-white/60 hover:text-white' : 'text-slate-300 hover:text-red-500'}`}
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 ))}
                 {cities.length === 0 && (
                    <div className="py-12 border border-dashed border-slate-200 dark:border-zinc-800 rounded-md flex flex-col items-center justify-center opacity-40">
                       <Globe className="w-10 h-10 mb-2" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nenhuma cidade cadastrada</p>
                    </div>
                 )}
              </div>
            </div>
          </div>

          {/* Coluna 2: Bairros */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-7 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                   <MapPin className="w-5 h-5 text-orange-600" />
                   <span className="text-lg font-headline font-black text-slate-900 dark:text-white uppercase tracking-tight">Bairros & Taxas</span>
                 </div>
                 <button onClick={() => Toast.fire({ icon: 'success', title: 'Bairros atualizados' })} className="p-2 text-slate-400 hover:text-orange-600 transition-colors">
                   <Save className="w-4 h-4" />
                 </button>
              </div>

              <form onSubmit={addNeighborhood} className="grid grid-cols-1 gap-4 mb-10">
                 {/* Select da Cidade (Vínculo Real) */}
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Vincular à Cidade</label>
                    <div className="relative">
                      <select 
                        value={newNeighborhood.cityId || selectedCityId}
                        onChange={(e) => {
                           setNewNeighborhood({...newNeighborhood, cityId: e.target.value});
                           setSelectedCityId(e.target.value);
                        }}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md px-5 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all uppercase appearance-none cursor-pointer"
                      >
                        <option value="">Selecione a Cidade...</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>{city.name} - {city.uf}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600 rotate-90 pointer-events-none" />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Bairro</label>
                    <input 
                      type="text" 
                      placeholder="EX: CENTRO, VILA NOVA..."
                      value={newNeighborhood.name}
                      onChange={(e) => setNewNeighborhood({...newNeighborhood, name: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md px-5 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all uppercase placeholder:text-slate-400"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Taxa Entrega (R$)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600" />
                          <input 
                           type="number" 
                           step="0.01"
                           placeholder="0.00"
                           value={newNeighborhood.deliveryFee}
                           onChange={(e) => setNewNeighborhood({...newNeighborhood, deliveryFee: parseFloat(e.target.value) || 0})}
                           className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-4 pl-12 pr-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all font-manrope"
                          />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Tempo Est. (min)</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600" />
                          <input 
                           type="number" 
                           placeholder="30"
                           value={newNeighborhood.estimatedTime}
                           onChange={(e) => setNewNeighborhood({...newNeighborhood, estimatedTime: parseInt(e.target.value) || 0})}
                           className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-4 pl-12 pr-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all font-manrope"
                          />
                        </div>
                    </div>
                 </div>

                 <button type="submit" className="w-full mt-4 flex items-center justify-center gap-3 bg-orange-600 text-white rounded-md py-5 hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/30 text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.98]">
                    <Plus className="w-5 h-5" /> Cadastrar Bairro
                 </button>
              </form>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[500px] scrollbar-thin">
                 {neighborhoods.filter(n => n.cityId === (newNeighborhood.cityId || selectedCityId)).map(n => (
                    <div key={n.id} className="flex items-center justify-between p-5 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-md group hover:border-orange-500/40 transition-all shadow-sm">
                       <div className="flex flex-col gap-1">
                          <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{n.name}</span>
                          <div className="flex items-center gap-4">
                             <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                <DollarSign className="w-3 h-3" /> R$ {n.deliveryFee.toFixed(2)}
                             </span>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> {n.estimatedTime} min
                             </span>
                          </div>
                       </div>
                       <button 
                         onClick={() => deleteNeighborhood(n.id)}
                         className="p-2.5 text-slate-300 hover:text-red-500 dark:text-zinc-700 dark:hover:text-red-500/80 transition-all opacity-0 group-hover:opacity-100"
                       >
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                 ))}
                 {neighborhoods.filter(n => n.cityId === (newNeighborhood.cityId || selectedCityId)).length === 0 && (
                    <div className="py-20 border border-dashed border-slate-100 dark:border-zinc-800/50 rounded-md flex flex-col items-center justify-center opacity-30">
                       <MapPin className="w-12 h-12 mb-3" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-center px-10">Nenhum bairro encontrado para esta cidade</p>
                    </div>
                 )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
