"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Briefcase, 
  Plus, 
  Search, 
  Trash2, 
  Phone, 
  Building2, 
  User, 
  Tag,
  ExternalLink,
  X
} from "lucide-react";
import Swal from "sweetalert2";

interface Supplier {
  id: string;
  company: string;
  seller: string;
  whatsapp: string;
  category: string;
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

export default function FornecedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<string[]>(["Bebidas", "Carnes", "Hortifruti", "Laticínios", "Embalagens"]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [userRole, setUserRole] = useState<string>("ADMIN");
  
  const [newSupplier, setNewSupplier] = useState({
    company: "",
    seller: "",
    whatsapp: "",
    category: "Bebidas"
  });

  useEffect(() => {
    const savedSuppliers = localStorage.getItem("movieats_suppliers");
    const savedCategories = localStorage.getItem("movieats_supplier_categories");
    const userSaved = localStorage.getItem("movieats_user");
    
    if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
    if (savedCategories) setCategories(JSON.parse(savedCategories));

    if (userSaved) {
      const user = JSON.parse(userSaved);
      if (user.role) setUserRole(user.role);
    }
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.company || !newSupplier.seller) return;

    const supplier: Supplier = {
      id: Math.random().toString(36).substr(2, 9),
      ...newSupplier
    };

    const newList = [...suppliers, supplier];
    setSuppliers(newList);
    localStorage.setItem("movieats_suppliers", JSON.stringify(newList));
    setNewSupplier({ ...newSupplier, company: "", seller: "", whatsapp: "" });
    Toast.fire({ icon: "success", title: "Fornecedor cadastrado!", iconColor: "#ea580c" });
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Confirmar Exclusão?",
      text: "Esta ação não pode ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: "var(--card)",
      color: "var(--foreground)",
      customClass: { container: "rounded-md", popup: "rounded-md" }
    }).then((result) => {
      if (result.isConfirmed) {
        const newList = suppliers.filter(s => s.id !== id);
        setSuppliers(newList);
        localStorage.setItem("movieats_suppliers", JSON.stringify(newList));
        Toast.fire({ icon: "success", title: "Fornecedor removido!", iconColor: "#ef4444" });
      }
    });
  };

  const handleAddCategory = () => {
    if (!newCategoryName) return;
    const newList = [...categories, newCategoryName];
    setCategories(newList);
    localStorage.setItem("movieats_supplier_categories", JSON.stringify(newList));
    setNewCategoryName("");
    setIsCategoryModalOpen(false);
    Toast.fire({ icon: "success", title: "Categoria adicionada!", iconColor: "#ea580c" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-5 pb-10">
        
        {/* Header Compacto */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm animate-in fade-in duration-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600/10 rounded-md">
              <Briefcase className="text-orange-600 w-5 h-5" />
            </div>
            <div>
               <h2 className="text-xl font-headline font-black text-slate-900 dark:text-white uppercase tracking-tight">Fornecedores</h2>
               <p className="text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mt-0.5">Gestão de Parceiros & Distribuição</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Formulário Compacto */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-5 shadow-sm sticky top-24 transition-all">
              <h3 className="text-sm font-headline font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-zinc-800 pb-3">Novo Cadastro</h3>
              
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Empresa</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-600/60" />
                    <input 
                      type="text" 
                      placeholder="NOME DA EMPRESA"
                      value={newSupplier.company}
                      onChange={(e) => setNewSupplier({...newSupplier, company: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-3 pl-10 pr-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all uppercase placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Vendedor</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-600/60" />
                    <input 
                      type="text" 
                      placeholder="NOME DO CONTATO"
                      value={newSupplier.seller}
                      onChange={(e) => setNewSupplier({...newSupplier, seller: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-3 pl-10 pr-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all uppercase placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-600/60" />
                    <input 
                      type="text" 
                      placeholder="DDD + NÚMERO"
                      value={newSupplier.whatsapp}
                      onChange={(e) => setNewSupplier({...newSupplier, whatsapp: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-3 pl-10 pr-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all uppercase placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-600/60" />
                      <select 
                        value={newSupplier.category}
                        onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-3 pl-10 pr-8 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all uppercase appearance-none cursor-pointer"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="p-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-all shadow-md group cursor-pointer"
                    >
                      <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                <button type="submit" className="w-full mt-4 flex items-center justify-center gap-3 bg-orange-600 text-white rounded-md py-4 hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 text-[10px] font-black uppercase tracking-[0.2em] active:scale-[0.98] cursor-pointer">
                  <Plus className="w-4 h-4" /> Cadastrar Fornecedor
                </button>
              </form>
            </div>
          </div>

          {/* Listagem Compacta */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md overflow-hidden shadow-sm h-full">
              <div className="py-4 px-6 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-800/20 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Lista de Parceiros</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <input type="text" placeholder="BUSCAR..." className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-md py-2 pl-9 pr-4 text-[9px] font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 w-48 transition-all shadow-inner uppercase" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-800/10">
                      <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Empresa</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Vendedor</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((s) => (
                      <tr key={s.id} className="border-b border-slate-50/50 dark:border-zinc-800/30 group hover:bg-slate-50/30 dark:hover:bg-zinc-800/20 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-orange-600 transition-colors">{s.company}</span>
                            <span className="text-[8px] text-slate-500 dark:text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{s.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest opacity-80">{s.seller}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-center gap-3">
                              <a 
                                href={`https://wa.me/55${s.whatsapp}`} 
                                target="_blank"
                                className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-emerald-600 rounded-md hover:bg-emerald-600 hover:text-white transition-all shadow-sm cursor-pointer group/btn"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              {userRole !== "GERENTE" && (
                                <button 
                                  onClick={() => handleDelete(s.id)}
                                  className="p-2 text-slate-300 hover:text-red-500 dark:text-zinc-700 dark:hover:text-red-500 transition-all cursor-pointer scale-90"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Modal de Nova Categoria */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md w-full max-w-sm p-6 shadow-2xl scale-in duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Nova Categoria</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nome da Categoria</label>
                  <input 
                    type="text" 
                    placeholder="EX: HORTIFRUTI"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value.toUpperCase())}
                    autoFocus
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-3 px-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 uppercase transition-all"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-md transition-all border border-slate-200 dark:border-zinc-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddCategory}
                    className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-all shadow-lg shadow-orange-600/30 cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}

    </DashboardLayout>
  );
}
