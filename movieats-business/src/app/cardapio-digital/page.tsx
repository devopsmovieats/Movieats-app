"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShoppingBag, 
  Search, 
  ChevronRight, 
  Plus, 
  Minus, 
  X, 
  Info, 
  Clock, 
  User, 
  Phone,
  CheckCircle2,
  AlertCircle,
  MapPin,
  CircleSmall
} from "lucide-react";
import Swal from "sweetalert2";

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
  image_url: string;
  status: string;
}

interface Category {
  id: number;
  name: string;
  image_url: string;
  status: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function CardapioDigitalPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lojaAtiva, setLojaAtiva] = useState(true); // Controla o status da loja
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", whatsapp: "" });
  
  const categoryRef = useRef<HTMLDivElement>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const savedCategories = localStorage.getItem('movieats_categories');
    const savedProducts = localStorage.getItem('movieats_products');
    const savedCustomer = localStorage.getItem('movieats_visitor');

    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedProducts) setProducts(JSON.parse(savedProducts).filter((p: any) => p.status === "ativo"));
    if (savedCustomer) setCustomer(JSON.parse(savedCustomer));

    // Simular status da loja (poderia vir de uma config global)
    const savedSettings = localStorage.getItem('movieats_system_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setLojaAtiva(settings.status !== "Fechado");
    }
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "TODOS" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    if (!lojaAtiva) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    Toast.fire({
      icon: "success",
      title: `${product.name} adicionado ao carrinho`
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const handleFinishOrder = () => {
    if (!customer.name || !customer.whatsapp) {
      setIsIdentityModalOpen(true);
      return;
    }
    
    // Simulação de fechamento de pedido via WhatsApp
    const message = `Olá, gostaria de fazer um pedido!\n\n*Cliente:* ${customer.name}\n*Zap:* ${customer.whatsapp}\n\n*Itens:*\n${cart.map(i => `- ${i.quantity}x ${i.name} (R$ ${i.price})`).join('\n')}\n\n*Total: R$ ${totalPrice.toFixed(2)}*`;
    const whatsappUrl = `https://wa.me/5500000000000?text=${encodeURIComponent(message)}`;
    
    Swal.fire({
      title: "Confirmar Pedido?",
      text: "Você será redirecionado para o WhatsApp da loja para concluir.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sim, enviar",
      cancelButtonText: "Cancelar",
      background: "#141414",
      color: "#fff",
      confirmButtonColor: "#ff6b00"
    }).then(result => {
      if (result.isConfirmed) {
        window.open(whatsappUrl, '_blank');
      }
    });
  };

  const saveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('movieats_visitor', JSON.stringify(customer));
    setIsIdentityModalOpen(false);
    Toast.fire({ icon: "success", title: "Identificação salva!" });
    handleFinishOrder();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/20 pb-24 md:pb-8">
      
      {/* 🚩 Banner de Status da Loja */}
      {!lojaAtiva && (
        <div className="bg-red-600/10 border-b border-red-600/20 py-3 px-4 flex items-center justify-center gap-2 animate-pulse">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-red-500 text-center">
            LOJA FECHADA - No momento não estamos recebendo pedidos online
          </span>
        </div>
      )}

      {/* 🏠 Header / Branding */}
      <header className="px-6 py-8 border-b border-white/5 bg-white/[0.01]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                <ShoppingBag className="text-primary w-7 h-7" />
             </div>
             <div>
               <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none italic">
                 Movieats <span className="text-primary">Burgers</span>
               </h1>
               <div className="flex items-center gap-2 mt-2 opacity-60">
                 <MapPin className="w-3 h-3 text-primary" />
                 <span className="text-[9px] font-bold uppercase tracking-widest">Av. Paulista, 1000 • SP</span>
               </div>
             </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
             <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${lojaAtiva ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                <CircleSmall className={`w-4 h-4 fill-current ${lojaAtiva ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{lojaAtiva ? "Aberto Agora" : "Fechado"}</span>
             </div>
             <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Entrega: 35-50 min</span>
             </div>
          </div>
        </div>
      </header>

      {/* 🔍 Search & Categories (Sticky) */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 shadow-2xl">
         <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <input 
                 type="text" 
                 placeholder="O que você deseja comer hoje?"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-white/[0.03] border border-white/5 rounded-md py-3 pl-11 pr-4 text-xs font-semibold placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-all"
               />
            </div>
            
            {/* Category Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar md:pb-0" ref={categoryRef}>
               <button 
                 onClick={() => setActiveCategory("TODOS")}
                 className={`px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                   ${activeCategory === "TODOS" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/5 text-slate-400 border-white/5 hover:border-white/10"}
                 `}
               >
                 Todos
               </button>
               {categories.map(cat => (
                 <button 
                   key={cat.id}
                   onClick={() => setActiveCategory(cat.name)}
                   className={`px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                     ${activeCategory === cat.name ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/5 text-slate-400 border-white/5 hover:border-white/10"}
                   `}
                 >
                   {cat.name}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* 🍔 Product Grid */}
      <main className="max-w-[1400px] mx-auto px-6 py-10">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
               <div key={product.id} className="group glass border border-white/5 rounded-md overflow-hidden bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 flex flex-col">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-black/20">
                     <img 
                       src={product.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&h=400&auto=format&fit=crop"} 
                       alt={product.name}
                       className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
                     />
                     {!lojaAtiva && (
                       <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-6">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 border border-white/10 px-4 py-2 rounded-md text-center leading-relaxed">Indisponível Agora</span>
                       </div>
                     )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                     <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                           <h3 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors italic">
                             {product.name}
                           </h3>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                          {product.description || "Descrição não disponível para este item."}
                        </p>
                     </div>
                     
                     <div className="mt-6 flex items-center justify-between gap-4">
                        <span className="text-lg font-black text-white italic">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        
                        {lojaAtiva ? (
                          <button 
                            onClick={() => addToCart(product)}
                            className="bg-primary hover:bg-orange-600 text-white w-10 h-10 rounded-md flex items-center justify-center shadow-lg shadow-primary/10 transition-all active:scale-90"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        ) : (
                          <div className="bg-white/5 text-slate-600 w-10 h-10 rounded-md flex items-center justify-center cursor-not-allowed">
                            <Plus className="w-5 h-5 opacity-20" />
                          </div>
                        )}
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* Empty State */}
         {filteredProducts.length === 0 && (
            <div className="py-24 text-center">
               <div className="inline-flex p-6 bg-white/5 rounded-full mb-6 text-slate-300 opacity-20">
                  <ShoppingBag className="w-16 h-16" />
               </div>
               <h3 className="text-lg font-black uppercase tracking-widest text-slate-500 italic">Ups! Nenhum item encontrado</h3>
               <p className="text-[10px] text-slate-600 mt-2 font-black uppercase">Tente mudar a categoria ou refinar sua busca.</p>
            </div>
         )}
      </main>

      {/* 🛒 Floating Cart Button (Mobile) */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:bottom-8 z-50">
           <button 
             onClick={() => setIsCartOpen(true)}
             className="w-full md:w-auto md:px-8 h-14 bg-primary text-white rounded-md shadow-[0_15px_30px_-5px_rgba(255,107,0,0.5)] flex items-center justify-between md:gap-6 group transition-all animate-in slide-in-from-bottom-5 duration-500 active:scale-95"
           >
              <div className="flex items-center gap-3 ml-6 md:ml-0">
                 <div className="relative">
                    <ShoppingBag className="w-6 h-6" />
                    <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-white text-primary text-[10px] font-black rounded-full flex items-center justify-center border-2 border-primary">
                       {totalItems}
                    </span>
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-[0.2em] hidden md:block">Ver Meu Carrinho</span>
              </div>
              <div className="flex items-center gap-4 bg-black/10 h-full px-6 font-black italic">
                 <span>R$ {totalPrice.toFixed(2)}</span>
                 <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </div>
           </button>
        </div>
      )}

      {/* 👜 Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsCartOpen(false)} />
           
           {/* Content */}
           <div className="relative w-full max-w-md bg-[#141414] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                 <div className="flex items-center gap-3">
                    <ShoppingBag className="text-primary w-5 h-5" />
                    <h3 className="text-[12px] font-black uppercase tracking-widest italic">Sacola de Pedidos</h3>
                 </div>
                 <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-md hover:bg-white/5 text-slate-400 transition-all">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 {cart.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                       <div className="w-16 h-16 rounded-md overflow-hidden bg-black/20 shrink-0 border border-white/5">
                          <img src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&h=150&auto=format&fit=crop"} alt="" className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 space-y-1">
                          <h4 className="text-[10px] font-black uppercase tracking-tight line-clamp-1">{item.name}</h4>
                          <span className="text-[10px] font-black text-primary italic">R$ {item.price.toFixed(2)}</span>
                          
                          <div className="flex items-center gap-4 mt-2">
                             <div className="flex items-center bg-white/5 rounded-md border border-white/10 px-1 py-1">
                                <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-white transition-all"><Minus className="w-3 h-3" /></button>
                                <span className="w-8 text-center text-[10px] font-black">{item.quantity}</span>
                                <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-white transition-all"><Plus className="w-3 h-3" /></button>
                             </div>
                             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Subtotal: R$ {(item.quantity * item.price).toFixed(2)}</span>
                          </div>
                       </div>
                    </div>
                 ))}

                 {cart.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                       <ShoppingBag className="w-20 h-20 mb-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-center">Sua sacola está vazia.<br/>Comece a adicionar delícias!</span>
                    </div>
                 )}
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.01] space-y-4">
                 <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Subtotal</span>
                    <span className="text-sm font-bold">R$ {totalPrice.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Taxa de Entrega</span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Grátis</span>
                 </div>
                 <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] italic">Total do Pedido</span>
                    <span className="text-2xl font-black text-primary italic">R$ {totalPrice.toFixed(2)}</span>
                 </div>

                 <button 
                   onClick={handleFinishOrder} 
                   disabled={cart.length === 0}
                   className="w-full h-14 bg-primary text-white rounded-md mt-6 flex items-center justify-center gap-3 font-black text-[12px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-orange-600 transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed group"
                 >
                    Finalizar Pedido
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* 🆔 Identity Modal */}
      {isIdentityModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
           <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsIdentityModalOpen(false)} />
           <div className="relative w-full max-w-sm bg-[#141414] border border-white/10 rounded-md shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] p-8 animate-in zoom-in-95 fade-in slide-in-from-bottom-10 duration-500">
              <div className="text-center space-y-2 mb-8">
                 <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <User className="text-primary w-7 h-7" />
                 </div>
                 <h3 className="text-lg font-black uppercase tracking-tight italic text-white leading-none">Quem está pedindo?</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Precisamos apenas do seu nome e zap!</p>
              </div>

              <form onSubmit={saveIdentity} className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Seu Nome</label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                       <input 
                         type="text" 
                         value={customer.name}
                         onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                         placeholder="Ex: João Silva"
                         className="w-full bg-white/[0.03] border border-white/5 rounded-md h-12 pl-12 pr-4 text-xs font-semibold focus:outline-none focus:border-primary/50 transition-all"
                         required
                       />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">WhatsApp</label>
                    <div className="relative">
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                       <input 
                         type="tel" 
                         value={customer.whatsapp}
                         onChange={(e) => setCustomer(prev => ({ ...prev, whatsapp: e.target.value }))}
                         placeholder="(11) 99999-9999"
                         className="w-full bg-white/[0.03] border border-white/5 rounded-md h-12 pl-12 pr-4 text-xs font-semibold focus:outline-none focus:border-primary/50 transition-all font-black tracking-widest"
                         required
                       />
                    </div>
                 </div>

                 <button type="submit" className="w-full h-12 bg-primary text-white rounded-md mt-6 font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-2 group">
                    Salvar e Continuar
                    <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
