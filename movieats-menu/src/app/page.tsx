"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShoppingBag, 
  Search, 
  ChevronRight, 
  Plus, 
  Minus, 
  X, 
  Clock, 
  User, 
  Phone,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Circle,
  ArrowLeft,
  ChevronDown,
  Loader2,
  Truck
} from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";

// Configuração do Toast elegante conforme o padrão Movieats
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

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  status: string;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
  selectedAddOns: AddOn[];
  observation: string;
  uniqueId: string;
}

interface StoreBranding {
  nome_loja: string;
  url_logo: string;
  url_banner: string;
  endereco: string;
}

export default function CardapioDigitalPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lojaAtiva, setLojaAtiva] = useState(true);
  const [branding, setBranding] = useState<StoreBranding | null>(null);
  
  // States para o Modal de Detalhes
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [observation, setObservation] = useState("");
  
  // Identity Modal
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", whatsapp: "" });
  
  // Rastreamento
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch Branding
      const { data: configData, error: configError } = await supabase
        .from('bd_config_estabelecimento')
        .select('*')
        .limit(1)
        .single();

      if (configData) {
        setBranding(configData);
        checkStoreStatus(configData.id);
      }

      // 2. Fetch Categories
      const { data: catData } = await supabase
        .from('bd_categorias')
        .select('*')
        .order('id');
      if (catData) setCategories(catData);

      // 3. Fetch Products
      const { data: prodData } = await supabase
        .from('bd_produtos')
        .select('*')
        .eq('status', 'ativo');
      if (prodData) {
        setProducts(prodData.map(p => ({
            id: p.id,
            name: p.nome,
            category: p.categoria,
            price: p.preco,
            description: p.descricao,
            image: p.url_imagem,
            status: p.status
        })));
      }

      const savedCustomer = localStorage.getItem('movieats_visitor');
      if (savedCustomer) setCustomer(JSON.parse(savedCustomer));

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const checkStoreStatus = async (establishmentId: string) => {
    try {
      const { data: schedules } = await supabase
        .from('bd_horarios_funcionamento')
        .select('*')
        .filter('id', 'like', `${establishmentId}%`);

      if (!schedules || schedules.length === 0) {
        setLojaAtiva(true);
        return;
      }

      const now = new Date();
      const currentDay = now.toLocaleDateString('pt-BR', { weekday: 'long' });
      // Normalizar para o formato salvo: "Segunda-feira" etc.
      const capitalizedDay = currentDay.charAt(0).toUpperCase() + currentDay.slice(1);
      
      const todaySchedule = schedules.find(s => s.dia_semana === capitalizedDay);

      if (!todaySchedule || !todaySchedule.esta_aberto) {
        setLojaAtiva(false);
        return;
      }

      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [hStart, mStart] = todaySchedule.abertura.split(':').map(Number);
      const [hEnd, mEnd] = todaySchedule.fechamento.split(':').map(Number);
      
      const startTime = hStart * 60 + mStart;
      const endTime = hEnd * 60 + mEnd;

      if (currentTime >= startTime && currentTime < endTime) {
        setLojaAtiva(true);
      } else {
        setLojaAtiva(false);
      }
    } catch (error) {
      console.error("Erro ao verificar status da loja:", error);
      setLojaAtiva(true);
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => {
    const addOnsTotal = item.selectedAddOns.reduce((sum, ad) => sum + ad.price, 0);
    return acc + ((item.price + addOnsTotal) * item.quantity);
  }, 0);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "TODOS" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenProduct = (product: Product) => {
    if (!lojaAtiva) {
      Toast.fire({ icon: "info", title: "Loja fechada no momento." });
      return;
    }
    setSelectedProduct(product);
    setSelectedAddOns([]);
    setObservation("");
  };

  const toggleAddOn = (addon: AddOn) => {
    setSelectedAddOns(prev => 
      prev.find(a => a.id === addon.id) 
        ? prev.filter(a => a.id !== addon.id) 
        : [...prev, addon]
    );
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const itemUniqueId = `${selectedProduct.id}-${selectedAddOns.map(a => a.id).sort().join(',')}-${observation}`;

    setCart(prev => {
      const existing = prev.find(item => item.uniqueId === itemUniqueId);
      if (existing) {
        return prev.map(item => item.uniqueId === itemUniqueId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        ...selectedProduct, 
        quantity: 1, 
        selectedAddOns, 
        observation,
        uniqueId: itemUniqueId 
      }];
    });

    Toast.fire({
      icon: "success",
      title: `${selectedProduct.name} adicionado!`
    });

    setSelectedProduct(null);
  };

  const updateCartQuantity = (uniqueId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.uniqueId === uniqueId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleFinishOrder = async () => {
    if (!lojaAtiva) {
      Toast.fire({ icon: "error", title: "Impossível finalizar: Loja Fechada." });
      return;
    }

    if (!customer.name || !customer.whatsapp) {
      setIsIdentityModalOpen(true);
      return;
    }

    try {
      Swal.fire({
        title: 'Enviando pedido...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        background: "#141414",
        color: "#fff"
      });

      const { data, error } = await supabase
        .from('bd_pedidos')
        .insert([{
          customer_name: customer.name,
          customer_whatsapp: customer.whatsapp,
          mesa: "MESA 01",
          items: cart,
          total: totalPrice,
          status: 'PENDENTE'
        }])
        .select()
        .single();

      if (error) throw error;

      setActiveOrder(data);
      setIsTracking(true);
      setIsCartOpen(false);
      setCart([]);

      let message = `*PEDIDO #${data.id.toString().substring(0,4)} - ${branding?.nome_loja || 'MOVIEATS'}*\n\n`;
      message += `👤 *Cliente:* ${customer.name}\n`;
      message += `📋 *Itens:*\n`;
      
      cart.forEach(item => {
        const addOnsText = item.selectedAddOns.length > 0 
          ? `\n   _Adicionais: ${item.selectedAddOns.map(a => a.name).join(', ')}_` 
          : "";
        message += `• ${item.quantity}x *${item.name}*${addOnsText}\n`;
      });
      message += `\n💰 *Total: R$ ${totalPrice.toFixed(2)}*`;

      Swal.fire({
        title: "Pedido Recebido!",
        text: "Já registramos na cozinha. Abrir WhatsApp para confirmação?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Sim, abrir",
        cancelButtonText: "Apenas acompanhar aqui",
        background: "#141414",
        color: "#fff",
        confirmButtonColor: "#10b981"
      }).then(result => {
        if (result.isConfirmed) {
          window.open(`https://wa.me/55${customer.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        }
      });

    } catch (err: any) {
      console.error(err);
      Swal.fire({ title: 'Erro', text: 'Falha ao conectar com o servidor.', icon: 'error' });
    }
  };

  const saveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('movieats_visitor', JSON.stringify(customer));
    setIsIdentityModalOpen(false);
    Toast.fire({ icon: "success", title: "Dados salvos!" });
    handleFinishOrder();
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-primary/20 pb-24 md:pb-8 font-sans">
      
      {/* 🚩 Banner de Status */}
      {!lojaAtiva && !isTracking && (
        <div className="bg-red-600/20 border-b border-red-600/30 py-3 px-4 flex items-center justify-center gap-2 sticky top-0 z-[110] backdrop-blur-md">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Loja Fechada no Momento</span>
        </div>
      )}

      {/* 🏠 Header Professional */}
      <header className="relative w-full overflow-hidden">
        {/* Banner de Fundo */}
        <div className="absolute inset-0 h-[300px] w-full overflow-hidden">
           <img 
             src={branding?.url_banner || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1920&h=1080&auto=format&fit=crop"} 
             className="w-full h-full object-cover opacity-30 grayscale"
             alt="Banner"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black" />
        </div>

        <div className="relative px-6 pt-24 pb-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center md:justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
             <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden backdrop-blur-md">
                <img src={branding?.url_logo || ""} className="w-full h-full object-cover" alt="Logo" />
             </div>
             <div>
               <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none italic">
                 {branding?.nome_loja || "Movieats Burgers"}
               </h1>
               <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                 <div className="flex items-center gap-1.5 opacity-60">
                   <MapPin className="w-3.5 h-3.5 text-primary" />
                   <span className="text-[10px] font-bold uppercase tracking-wider max-w-[200px] truncate">
                     {branding?.endereco || "Av. Paulista, 1000 • São Paulo"}
                   </span>
                 </div>
                 <div className="h-4 w-[1px] bg-white/10" />
                 <div className={`flex items-center gap-1.5 ${lojaAtiva ? 'text-emerald-500' : 'text-red-500'}`}>
                   <Circle className={`w-2 h-2 fill-current ${lojaAtiva ? 'animate-pulse' : ''}`} />
                   <span className="text-[10px] font-black uppercase tracking-wider">
                     {lojaAtiva ? 'Loja Aberta - Faça seu pedido' : 'Loja Fechada'}
                   </span>
                 </div>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 backdrop-blur-md shadow-xl">
                <Clock className="w-6 h-6 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 leading-none">Tempo Médio</span>
                  <span className="text-md font-black italic uppercase">35-50 min</span>
                </div>
             </div>
          </div>
        </div>
      </header>
 
      {/* 🔍 Search & Categories Premium */}
      <div className="sticky top-0 z-40 bg-[#000000]/90 backdrop-blur-xl border-b border-white/5">
         <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex flex-col md:flex-row gap-5">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="O que você deseja comer hoje?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/5 rounded-xl h-14 pl-12 pr-4 text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
               </div>
               
               <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar md:pb-0" ref={categoryRef}>
                  <button 
                    onClick={() => setActiveCategory("TODOS")}
                    className={`h-12 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 border
                      ${activeCategory === "TODOS" ? "bg-white text-black border-transparent" : "bg-white/5 text-slate-400 border-white/5 hover:border-white/10 hover:text-white"}
                    `}
                  >
                    Cardápio Geral
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.nome)}
                      className={`h-12 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 border
                        ${activeCategory === cat.nome ? "bg-white text-black border-transparent" : "bg-white/5 text-slate-400 border-white/5 hover:border-white/10 hover:text-white"}
                      `}
                    >
                      {cat.nome}
                    </button>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
               <div 
                 key={product.id} 
                 onClick={() => handleOpenProduct(product)}
                 className={`group relative bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-500 cursor-pointer shadow-premium active:scale-[0.98] ${!lojaAtiva ? 'opacity-50 grayscale' : ''}`}
               >
                  <div className="relative aspect-video overflow-hidden">
                     <img 
                       src={product.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&h=400&auto=format&fit=crop"} 
                       alt={product.name}
                       className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 brightness-90 group-hover:brightness-100"
                     />
                     <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg">
                        <span className="text-sm font-black italic">R$ {product.price.toFixed(2)}</span>
                     </div>
                  </div>
                  
                  <div className="p-6 space-y-3">
                     <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none group-hover:text-primary transition-colors">
                       {product.name}
                     </h3>
                     <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                       {product.description}
                     </p>
                  </div>
               </div>
            ))}
         </div>
      </main>

      {/* 🧾 Carrinho Flutuante */}
      {totalItems > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:bottom-8 z-50">
           <button 
             onClick={() => setIsCartOpen(true)}
             className="w-full md:w-[320px] h-16 bg-white text-black rounded-2xl shadow-2xl flex items-center justify-between px-6 group transition-all animate-in slide-in-from-bottom-5 active:scale-95"
           >
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <ShoppingBag className="w-7 h-7" />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[11px] font-black rounded-lg flex items-center justify-center border-2 border-white animate-bounce">
                       {totalItems}
                    </span>
                 </div>
                 <span className="text-[12px] font-black uppercase tracking-widest">Minha Sacola</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-lg font-black italic">R$ {totalPrice.toFixed(2)}</span>
              </div>
           </button>
        </div>
      )}

      {/* 🛒 Drawer de Itens do Carrinho */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[120] flex justify-end">
           <div className="absolute inset-0 bg-[#000000]/95 backdrop-blur-2xl animate-in fade-in duration-300" onClick={() => setIsCartOpen(false)} />
           
           <div className="relative w-full max-w-lg bg-[#0a0a0a] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">Seu Pedido</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Revise seus itens antes de finalizar</p>
                 </div>
                 <button onClick={() => setIsCartOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                 {cart.map(item => (
                    <div key={item.uniqueId} className="space-y-4 p-5 bg-white/[0.02] rounded-2xl border border-white/5">
                       <div className="flex gap-4">
                          <img src={item.image} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                          <div className="flex-1">
                             <div className="flex justify-between">
                                <h4 className="text-sm font-black uppercase italic">{item.name}</h4>
                                <span className="text-sm font-black text-primary italic">R$ {item.price.toFixed(2)}</span>
                             </div>
                             
                             {item.selectedAddOns.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                   {item.selectedAddOns.map(a => (
                                      <span key={a.id} className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">+{a.name}</span>
                                   ))}
                                </div>
                             )}
                          </div>
                       </div>
                       
                       <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                             <button onClick={() => updateCartQuantity(item.uniqueId, -1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white transition-all"><Minus className="w-4 h-4" /></button>
                             <span className="w-10 text-center text-xs font-black">{item.quantity}</span>
                             <button onClick={() => updateCartQuantity(item.uniqueId, 1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
                          </div>
                          <span className="text-sm font-black italic">R$ {((item.price + item.selectedAddOns.reduce((s, a) => s + a.price, 0)) * item.quantity).toFixed(2)}</span>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="p-8 border-t border-white/5 bg-black/40 space-y-6">
                 <div className="flex justify-between items-center bg-white/[0.03] p-6 rounded-2xl border border-white/5">
                    <span className="text-[12px] font-black uppercase tracking-widest text-slate-500">Total a Pagar</span>
                    <span className="text-3xl font-black text-emerald-500 italic">R$ {totalPrice.toFixed(2)}</span>
                 </div>

                 <button 
                    onClick={handleFinishOrder} 
                    disabled={cart.length === 0 || !lojaAtiva}
                    className={`w-full h-16 rounded-2xl flex items-center justify-center gap-4 font-black text-sm uppercase tracking-widest shadow-2xl transition-all disabled:opacity-30 disabled:grayscale group
                      ${lojaAtiva ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-red-600/20 text-red-500 border border-red-600/30'}
                    `}
                 >
                    {lojaAtiva ? (
                      <>
                        Finalizar via WhatsApp
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                      </>
                    ) : (
                      'Loja Fechada no Momento'
                    )}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* 📱 Modal de Detalhes (Selected Product) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[110] bg-[#000000] md:flex md:items-center md:justify-center md:bg-[#000000]/90 md:backdrop-blur-xl animate-in fade-in duration-300">
           <div className="relative w-full h-full bg-[#0a0a0a] md:max-w-xl md:h-[90vh] md:rounded-3xl md:overflow-hidden md:border md:border-white/10 flex flex-col animate-in slide-in-from-bottom duration-500">
              <div className="relative h-2/5 md:h-[400px]">
                 <img src={selectedProduct.image} className="w-full h-full object-cover" alt="" />
                 <button onClick={() => setSelectedProduct(null)} className="absolute top-6 left-6 w-12 h-12 bg-black/50 backdrop-blur-md rounded-2xl flex items-center justify-center text-white"><ArrowLeft className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar">
                 <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{selectedProduct.name}</h2>
                 <p className="text-sm text-slate-500 leading-relaxed font-medium">{selectedProduct.description}</p>
                 <textarea 
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="Alguma observação? (Ex: Tirar cebola)"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-sm font-semibold focus:outline-none min-h-[120px]"
                 />
              </div>
              <div className="p-6 bg-white/[0.02] border-t border-white/5 backdrop-blur-md flex items-center gap-4">
                 <button onClick={handleAddToCart} className="flex-1 h-16 bg-white text-black rounded-2xl flex items-center justify-center gap-3 font-black text-[13px] uppercase tracking-widest active:scale-95 transition-all">
                    Adicionar Item • R$ {selectedProduct.price.toFixed(2)}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* 👤 Modal Identity */}
      {isIdentityModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
           <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500" onClick={() => setIsIdentityModalOpen(false)} />
           <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl p-10 animate-in zoom-in-95 duration-500">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-center mb-8">Dados do Pedido</h3>
              <form onSubmit={saveIdentity} className="space-y-6">
                 <input 
                   type="text" 
                   value={customer.name}
                   onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                   placeholder="Seu Nome"
                   className="w-full bg-white/[0.05] border border-white/5 rounded-2xl h-14 px-6 text-sm font-bold focus:outline-none"
                   required
                 />
                 <input 
                   type="tel" 
                   value={customer.whatsapp}
                   onChange={(e) => setCustomer(prev => ({ ...prev, whatsapp: e.target.value }))}
                   placeholder="WhatsApp"
                   className="w-full bg-white/[0.05] border border-white/5 rounded-2xl h-14 px-6 text-sm font-bold focus:outline-none"
                   required
                 />
                 <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl mt-8 font-black text-xs uppercase tracking-widest">
                    Continuar Pedido
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
