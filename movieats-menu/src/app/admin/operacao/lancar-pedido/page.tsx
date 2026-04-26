"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Search, 
  ShoppingCart, 
  User, 
  MapPin, 
  Utensils, 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  CircleDollarSign,
  QrCode,
  Tag,
  ChevronRight,
  Bike
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image_url: string;
}

interface CartItem extends Product {
  quantity: number;
}

const initialCategories = ["🍔 Hambúrgueres", "🍟 Acompanhamentos", "🥤 Bebidas", "🍰 Sobremesas", "🥗 Saladas"];

const initialProducts: Product[] = [
  { id: 1, name: "Smash Burger Duo", category: "🍔 Hambúrgueres", price: 38.90, image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150&h=150&auto=format&fit=crop" },
  { id: 2, name: "Batata Rústica", category: "🍟 Acompanhamentos", price: 18.00, image_url: "https://images.unsplash.com/photo-1573015084245-7da883204507?q=80&w=150&h=150&auto=format&fit=crop" },
  { id: 3, name: "Coca-Cola Zero", category: "🥤 Bebidas", price: 7.50, image_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=150&h=150&auto=format&fit=crop" },
  { id: 4, name: "Pizza Calabresa", category: "🍕 Pizzas", price: 45.90, image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150&h=150&auto=format&fit=crop" },
  { id: 5, name: "Suco de Laranja", category: "🥤 Bebidas", price: 12.00, image_url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=150&h=150&auto=format&fit=crop" }
];

export default function LancarPedidoPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState("🍔 Hambúrgueres");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<"Mesa" | "Balcão" | "Entrega">("Balcão");
  const [paymentMethod, setPaymentMethod] = useState<"Dinheiro" | "PIX" | "Cartão" | null>(null);

  // Lógica para carregar categorias e produtos reais se disponíveis
  useEffect(() => {
    const savedProducts = localStorage.getItem("movieats_products");
    const savedCategories = localStorage.getItem("movieats_categories");
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCategories) {
      const cats = JSON.parse(savedCategories);
      setCategories(cats.map((c: any) => c.name));
      if (cats.length > 0) setSelectedCategory(cats[0].name);
    }
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const filteredProducts = products.filter(p => 
    p.category === selectedCategory && 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-100px)] gap-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 -mt-2">
        
        {/* Lado Esquerdo: Checkout / Carrinho (Compacto) */}
        <div className="w-[360px] flex flex-col gap-3">
          <div className="glass border border-white/5 rounded-xl flex flex-col h-full overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
            
            {/* Header Checkout */}
            <div className="p-4 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="text-primary w-4 h-4" />
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Carrinho de Venda</h2>
              </div>

              {/* Cliente Search */}
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Consumidor Final..." 
                  className="w-full bg-black/20 border border-white/5 rounded-lg py-2 pl-9 pr-3 text-[10px] text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                />
              </div>
            </div>

            {/* Lista de Itens (Scroll Denso) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 p-2 rounded-lg group hover:border-primary/20 transition-all">
                    <img src={item.image_url} alt={item.name} className="w-8 h-8 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[9px] font-black text-white uppercase truncate tracking-tight leading-none">{item.name}</h4>
                      <span className="text-[8px] font-bold text-primary">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 rounded-md p-1 border border-white/5 scale-90 origin-right">
                      <button onClick={() => updateQuantity(item.id, -1)} className="text-muted-foreground hover:text-white cursor-pointer"><Minus className="w-2.5 h-2.5" /></button>
                      <span className="text-[10px] font-black text-white w-3 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-muted-foreground hover:text-white cursor-pointer"><Plus className="w-2.5 h-2.5" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-1 px-1.5 text-white/10 hover:text-red-500 transition-colors cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 gap-2">
                   <ShoppingCart className="w-8 h-8" />
                   <span className="text-[8px] font-black uppercase tracking-[0.2em]">Carrinho Vazio</span>
                </div>
              )}
            </div>

            {/* Configurações do Pedido (Compacto) */}
            <div className="p-4 bg-white/[0.01] border-t border-white/5 space-y-4">
              {/* Tipo de Pedido */}
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "Balcão", icon: Package },
                    { id: "Mesa", icon: Utensils },
                    { id: "Entrega", icon: Bike }
                  ].map((type) => (
                    <button 
                      key={type.id}
                      onClick={() => setOrderType(type.id as any)}
                      className={`flex flex-col items-center gap-1.5 py-2 rounded-lg border transition-all cursor-pointer
                        ${orderType === type.id ? 'bg-primary/10 border-primary text-primary' : 'bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/5'}
                      `}
                    >
                      <type.icon className="w-3 h-3" />
                      <span className="text-[8px] font-black uppercase tracking-widest">{type.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campos Dinâmicos (Compacto) */}
              {orderType === "Mesa" && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  <select className="w-full bg-black/40 border border-white/5 rounded-lg py-2 px-3 text-[10px] text-white font-bold outline-none focus:border-primary/50">
                    <option>Selecione a Mesa</option>
                    {[1,2,3,4,5,6,7,8].map(m => <option key={m}>Mesa {m.toString().padStart(2, '0')}</option>)}
                  </select>
                </div>
              )}

              {/* Pagamento e Total (Compacto) */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total</span>
                    <span className="text-xl font-black text-primary tracking-tighter leading-none">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "Dinheiro", icon: CircleDollarSign },
                      { id: "PIX", icon: QrCode },
                      { id: "Cartão", icon: CreditCard }
                    ].map((method) => (
                      <button 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`flex flex-col items-center gap-1.5 py-2 rounded-lg border transition-all cursor-pointer
                          ${paymentMethod === method.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/10' : 'bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/5'}
                        `}
                      >
                        <method.icon className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase tracking-widest">{method.id}</span>
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      const newOrder = {
                        id: Math.floor(1000 + Math.random() * 9000).toString(),
                        clientName: "Consumidor Final",
                        itemsSummary: cart.map(item => `${item.quantity}x ${item.name}`).join(", "),
                        status: "Pendente",
                        createdAt: Date.now(),
                        pago: true,
                        tipo: orderType,
                        total: subtotal
                      };
                      const saved = localStorage.getItem("movieats_orders");
                      const current = saved ? JSON.parse(saved) : [];
                      localStorage.setItem("movieats_orders", JSON.stringify([...current, newOrder]));
                      
                      setCart([]);
                      setPaymentMethod(null);
                      alert("Pedido Finalizado com Sucesso!");
                    }}
                    className="w-full bg-primary hover:bg-orange-600 text-white py-3 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
                    disabled={cart.length === 0 || !paymentMethod}
                  >
                    Finalizar Pedido
                  </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Vitrine de Produtos (Compacta) */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Top Bar Vitrine (Compacto) */}
          <div className="glass border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer
                    ${selectedCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="w-48 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-lg py-2 pl-9 pr-3 text-[10px] text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          {/* Grid de Produtos (Scroll Compacto) */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">
            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {filteredProducts.map((product) => (
                <button 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group relative flex flex-col bg-[#141414] border border-white/5 rounded-xl p-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 text-left cursor-pointer overflow-hidden"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-white/5">
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-10 transition-opacity" />
                  </div>
                  
                  <div className="space-y-0.5">
                    <h3 className="text-[9px] font-black text-white uppercase tracking-tight line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-primary tracking-tighter">
                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="p-0.5 px-1 bg-primary/10 rounded">
                        <Plus className="w-2.5 h-2.5 text-primary" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full h-64 flex flex-col items-center justify-center opacity-20 gap-4">
                  <ShoppingBag className="w-16 h-16" />
                  <span className="text-xs font-black uppercase tracking-[0.3em]">Nenhum produto nesta categoria</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
      
      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,107,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,107,0,0.3); }
      `}</style>
    </DashboardLayout>
  );
}

import { ShoppingBag, PlusCircle } from "lucide-react";
