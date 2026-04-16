"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Users, 
  Search, 
  MessageCircle, 
  Cake, 
  Plus, 
  Calendar,
  X,
  Phone,
  User,
  Check,
  TrendingUp,
  ChevronRight,
  Pencil,
  Trash2
} from "lucide-react";
import Swal from "sweetalert2";

interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  lastOrder: string;
  totalSpent: number;
  birthDate: string; // YYYY-MM-DD
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

const initialCustomers: Customer[] = [
  { id: "1", name: "João Silva", whatsapp: "5511999999999", lastOrder: "2024-04-05", totalSpent: 850.50, birthDate: "1990-04-10", street: "Rua das Flores", number: "123", neighborhood: "Centro", city: "São Paulo", state: "SP" },
  { id: "2", name: "Maria Oliveira", whatsapp: "5511988888888", lastOrder: "2024-04-01", totalSpent: 640.00, birthDate: "1985-05-15" },
  { id: "3", name: "Carlos Souza", whatsapp: "5511977777777", lastOrder: "2024-03-20", totalSpent: 420.20, birthDate: "1992-04-20" },
  { id: "4", name: "Ana Beatriz", whatsapp: "5511966666666", lastOrder: "2024-04-09", totalSpent: 1250.00, birthDate: "1995-12-10" },
];

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterMonth, setFilterMonth] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newCustomer, setNewCustomer] = useState({
    id: "",
    name: "",
    whatsapp: "",
    birthDate: "",
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: ""
  });

  // Data de hoje formatada como MM-DD
  const [todayMD, setTodayMD] = useState("");
  const [currentMonth, setCurrentMonth] = useState(0);

  useEffect(() => {
    const now = new Date();
    setTodayMD(now.toISOString().split('T')[0].substring(5));
    setCurrentMonth(now.getMonth() + 1);

    const saved = localStorage.getItem("movieats_customers");
    if (saved) {
      try {
        setCustomers(JSON.parse(saved));
      } catch (e) {
        setCustomers(initialCustomers);
      }
    }
  }, []);

  const handleCepBlur = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setNewCustomer(prev => ({
          ...prev,
          street: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf
        }));
      }
    } catch (e) {
      console.error("Erro ao buscar CEP:", e);
    }
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    
    let updated;
    if (isEditing) {
      updated = customers.map(c => c.id === newCustomer.id ? { ...c, ...newCustomer } : c);
    } else {
      const customer: Customer = {
        ...newCustomer,
        id: Math.random().toString(36).substr(2, 9),
        lastOrder: "Nenhum",
        totalSpent: 0
      };
      updated = [...customers, customer];
    }
    
    setCustomers(updated);
    localStorage.setItem("movieats_customers", JSON.stringify(updated));
    handleCloseModal();
  };

  const handleEdit = (customer: Customer) => {
    setIsEditing(true);
    setNewCustomer({
      id: customer.id,
      name: customer.name,
      whatsapp: customer.whatsapp,
      birthDate: customer.birthDate,
      cep: customer.cep || "",
      street: customer.street || "",
      number: customer.number || "",
      neighborhood: customer.neighborhood || "",
      city: customer.city || "",
      state: customer.state || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter esta ação!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff6b00",
      cancelButtonColor: "#141414",
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
      background: "#0f0f0f",
      color: "#fff"
    });

    if (result.isConfirmed) {
      const updated = customers.filter(c => c.id !== id);
      setCustomers(updated);
      localStorage.setItem("movieats_customers", JSON.stringify(updated));
      Swal.fire({
        title: "Deletado!",
        text: "O cliente foi removido com sucesso.",
        icon: "success",
        background: "#0f0f0f",
        color: "#fff"
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setNewCustomer({ 
      id: "",
      name: "", 
      whatsapp: "", 
      birthDate: "",
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: ""
    });
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.whatsapp.includes(searchTerm);
    if (!filterMonth) return matchesSearch;
    
    const birthMonth = parseInt(c.birthDate.split('-')[1]);
    return matchesSearch && birthMonth === currentMonth;
  });

  const isBirthdayToday = (birthDate: string) => {
    if (!birthDate) return false;
    return birthDate.substring(5) === todayMD;
  };

  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Gestão de Clientes */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="text-primary w-5 h-5" />
              </div>
              <h2 className="text-2xl font-headline font-black text-white tracking-tight uppercase leading-none">
                Gestão de Clientes
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              Base de consumidores e monitoramento de fidelização.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => setFilterMonth(!filterMonth)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer
                 ${filterMonth ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}
               `}
             >
               <Cake className={`w-3.5 h-3.5 ${filterMonth ? 'animate-bounce' : ''}`} />
               Aniversariantes do Mês
             </button>
             <button 
               onClick={() => { setIsEditing(false); setShowModal(true); }}
               className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/20 cursor-pointer"
             >
               <Plus className="w-3.5 h-3.5" />
               Novo Cliente
             </button>
          </div>
        </div>

        {/* Busca */}
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou WhatsApp..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/20 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
          />
        </div>

        {/* Tabela de Clientes */}
        <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
           <div className="overflow-x-auto">
              <table className="w-full text-left uppercase">
                 <thead>
                    <tr className="bg-white/[0.02]">
                       <th className="px-6 py-4 text-[9px] font-black text-white/30 tracking-[0.2em]">Cliente</th>
                       <th className="px-6 py-4 text-[9px] font-black text-white/30 tracking-[0.2em]">WhatsApp</th>
                       <th className="px-6 py-4 text-[9px] font-black text-white/30 tracking-[0.2em]">Aniversário</th>
                       <th className="px-6 py-4 text-[9px] font-black text-white/30 tracking-[0.2em]">Último Pedido</th>
                       <th className="px-6 py-4 text-[9px] font-black text-white/30 tracking-[0.2em]">Total Gasto</th>
                       <th className="px-6 py-4 text-[9px] font-black text-white/30 tracking-[0.2em]">Ações</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                                 <User className="w-3.5 h-3.5 text-white/20" />
                              </div>
                              <div className="flex flex-col">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-white tracking-tight">{customer.name}</span>
                                    {isBirthdayToday(customer.birthDate) && (
                                       <div className="flex items-center gap-1 bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[8px] font-black animate-pulse">
                                          <Cake className="w-2.5 h-2.5" />
                                          HOJE!
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[10px] font-bold text-white/50">{customer.whatsapp}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2 text-[10px] font-bold text-white/40">
                              <Calendar className="w-3 h-3" />
                              {customer.birthDate ? new Date(customer.birthDate).toLocaleDateString('pt-BR') : '--/--/--'}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold text-white/40">
                           {customer.lastOrder}
                        </td>
                        <td className="px-6 py-4 text-[11px] font-black text-emerald-500">
                           {formatCurrency(customer.totalSpent)}
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <a 
                                href={`https://api.whatsapp.com/send?phone=${customer.whatsapp}`} 
                                target="_blank"
                                className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 cursor-pointer"
                                title="Enviar WhatsApp"
                              >
                                 <MessageCircle className="w-4 h-4" />
                              </a>
                              <button 
                                onClick={() => handleEdit(customer)}
                                className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 cursor-pointer"
                                title="Editar Cliente"
                              >
                                 <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(customer.id)}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-500/20 cursor-pointer"
                                title="Deletar Cliente"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           
           {filteredCustomers.length === 0 && (
             <div className="p-20 flex flex-col items-center justify-center gap-4 opacity-20">
                <Users className="w-12 h-12" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Nenhum cliente encontrado</span>
             </div>
           )}
        </div>

        {/* Modal de Cadastro/Edição */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={handleCloseModal} />
             <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">{isEditing ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h3>
                   <button onClick={handleCloseModal} className="text-white/20 hover:text-white transition-colors cursor-pointer">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                
                <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Nome Completo</label>
                         <input 
                           required
                           type="text" 
                           placeholder="Ex: João Silva"
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                           value={newCustomer.name}
                           onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                         />
                      </div>
                      
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">WhatsApp (com DDD)</label>
                         <input 
                           required
                           type="text" 
                           placeholder="Ex: 5511999999999"
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                           value={newCustomer.whatsapp}
                           onChange={(e) => setNewCustomer({...newCustomer, whatsapp: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1 space-y-1.5">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Nascimento</label>
                         <input 
                           required
                           type="date" 
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all uppercase"
                           value={newCustomer.birthDate}
                           onChange={(e) => setNewCustomer({...newCustomer, birthDate: e.target.value})}
                         />
                      </div>

                      <div className="md:col-span-1 space-y-1.5">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">CEP</label>
                         <input 
                           type="text" 
                           placeholder="00000-000"
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                           value={newCustomer.cep}
                           onBlur={(e) => handleCepBlur(e.target.value)}
                           onChange={(e) => setNewCustomer({...newCustomer, cep: e.target.value})}
                         />
                      </div>

                      <div className="md:col-span-1 space-y-1.5">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">UF</label>
                         <input 
                           type="text" 
                           placeholder="SP"
                           maxLength={2}
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all uppercase"
                           value={newCustomer.state}
                           onChange={(e) => setNewCustomer({...newCustomer, state: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3 space-y-1.5">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Rua</label>
                         <input 
                           type="text" 
                           placeholder="Rua..."
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                           value={newCustomer.street}
                           onChange={(e) => setNewCustomer({...newCustomer, street: e.target.value})}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Nº</label>
                         <input 
                           type="text" 
                           placeholder="123"
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                           value={newCustomer.number}
                           onChange={(e) => setNewCustomer({...newCustomer, number: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Bairro</label>
                         <input 
                           type="text" 
                           placeholder="Bairro..."
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                           value={newCustomer.neighborhood}
                           onChange={(e) => setNewCustomer({...newCustomer, neighborhood: e.target.value})}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Cidade</label>
                         <input 
                           type="text" 
                           placeholder="Cidade..."
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                           value={newCustomer.city}
                           onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                         />
                      </div>
                   </div>

                   <button 
                     type="submit"
                     className="w-full bg-white text-black py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all mt-4 cursor-pointer"
                   >
                     {isEditing ? 'Salvar Alterações' : 'Salvar Cliente'}
                   </button>
                </form>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
