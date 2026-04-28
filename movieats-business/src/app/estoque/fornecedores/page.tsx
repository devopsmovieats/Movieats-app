"use client";
// VERSION: 7.0 - SYNC SUPABASE FORNECEDORES CONCLUIDO


import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Briefcase, 
  Plus, 
  Search, 
  Trash2, 
  Pencil,
  Phone,
  Mail,
  X,
  ChevronDown,
  Download,
  Loader2
} from "lucide-react";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabase";

interface Supplier {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  category: string;
  category_id: string;
  status: 'ativo' | 'inativo';
}

interface Category {
  id: string;
  nome: string;
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
  },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  }
});

const formatDocument = (val: string) => {
  let v = val.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }
  return v.slice(0, 18);
};

const formatPhone = (val: string) => {
  let v = val.replace(/\D/g, "");
  if (v.length <= 10) {
    v = v.replace(/(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    v = v.replace(/(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
  }
  return v.slice(0, 15);
};

export default function FornecedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchFornecedores = async () => {
      try {
        const { data, error } = await supabase
          .from("bd_fornecedores")
          .select(`
            *,
            bd_fornecedores_categorias (
              nome
            )
          `)
          .order("created_at", { ascending: false });
          
        if (data && !error) {
          setSuppliers(data.map((p: any) => ({
            id: p.id,
            name: p.nome,
            document: p.documento || "",
            phone: p.telefone || "",
            email: p.email || "",
            category: p.bd_fornecedores_categorias?.nome || p.categoria || "Outros",
            category_id: p.categoria_id || "",
            status: p.status || 'ativo'
          })));
        }
      } catch (e) {}
    };
    fetchFornecedores();
  }, []);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const { data, error } = await supabase
          .from("bd_fornecedores_categorias")
          .select("id, nome")
          .order("nome");
          
        if (data && !error) {
          setCategories(data);
        }
      } catch (e) {}
    };
    fetchCategorias();
  }, []);

  const handleAddCategory = () => {
    Swal.fire({
      title: 'Nova Categoria',
      input: 'text',
      inputPlaceholder: 'Nome da categoria',
      showCancelButton: true,
      confirmButtonText: 'Adicionar',
      cancelButtonText: 'Cancelar',
      background: "#141414",
      color: "#fff",
      confirmButtonColor: "#ea580c",
      customClass: { popup: "rounded-xl border border-white/5 shadow-2xl" },
      showLoaderOnConfirm: true,
      preConfirm: async (newCat) => {
        const trimmed = newCat.trim();
        if (!trimmed) return Swal.showValidationMessage("Nome inválido");
        if (categories.some(c => c.nome === trimmed)) return trimmed;

        const { data, error } = await supabase
          .from("bd_fornecedores_categorias")
          .insert([{ nome: trimmed }])
          .select()
          .single();
          
        if (error && error.code !== '23505') {
          return Swal.showValidationMessage(`Erro: ${error.message}`);
        }
        return data || trimmed;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const newCat = result.value;
        if (typeof newCat === 'object') {
          setCategories(prev => [...prev, newCat].sort((a, b) => a.nome.localeCompare(b.nome)));
          if (editingSupplier) {
            setEditingSupplier({ ...editingSupplier, category_id: newCat.id, category: newCat.nome });
          }
        }
        Toast.fire({ icon: "success", title: "Categoria adicionada!" });
      }
    });
  };

  const handleEditCategory = () => {
    if (!editingSupplier?.category_id) return;
    const currentCat = categories.find(c => c.id === editingSupplier.category_id);
    
    Swal.fire({
      title: 'Editar Categoria',
      input: 'text',
      inputValue: currentCat?.nome || "",
      showCancelButton: true,
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      background: "#141414",
      color: "#fff",
      confirmButtonColor: "#ea580c",
      customClass: { popup: "rounded-xl border border-white/5 shadow-2xl" },
      showLoaderOnConfirm: true,
      preConfirm: async (newName) => {
        const trimmed = newName.trim();
        if (!trimmed) return Swal.showValidationMessage("Nome inválido");
        
        // Verificar se já existe outra categoria com esse nome
        if (categories.some(c => c.nome.toLowerCase() === trimmed.toLowerCase() && c.id !== editingSupplier.category_id)) {
          return Swal.showValidationMessage("Já existe uma categoria com este nome.");
        }
        
        const { error } = await supabase
          .from("bd_fornecedores_categorias")
          .update({ nome: trimmed })
          .eq("id", editingSupplier.category_id);
          
        if (error) return Swal.showValidationMessage(`Erro: ${error.message}`);
        return trimmed;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const newName = result.value;
        setCategories(prev => prev.map(c => c.id === editingSupplier.category_id ? { ...c, nome: newName } : c));
        setEditingSupplier({ ...editingSupplier, category: newName });
        Toast.fire({ icon: "success", title: "Categoria atualizada!" });
      }
    });
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.document.includes(searchQuery) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "todos" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredSuppliers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const openAddModal = () => {
    setEditingSupplier({
      id: "",
      name: "",
      document: "",
      phone: "",
      email: "",
      category: "",
      category_id: "",
      status: 'ativo'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier({ ...supplier });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier?.name) return;

    setIsSaving(true);
    
    try {
      const payload = {
        nome: editingSupplier.name,
        documento: editingSupplier.document,
        telefone: editingSupplier.phone,
        email: editingSupplier.email,
        categoria: editingSupplier.category,
        categoria_id: editingSupplier.category_id || null,
        status: editingSupplier.status
      };

      if (!editingSupplier.id) {
        const { data, error } = await supabase
          .from("bd_fornecedores")
          .insert([payload])
          .select()
          .single();
          
        if (error) throw error;
        
        const newSup: Supplier = {
          ...editingSupplier,
          id: data.id
        };
        setSuppliers([newSup, ...suppliers]);
        Toast.fire({ icon: "success", title: "Fornecedor cadastrado!" });
      } else {
        const { error } = await supabase
          .from("bd_fornecedores")
          .update(payload)
          .eq("id", editingSupplier.id);
          
        if (error) throw error;
        
        setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? editingSupplier : s));
        Toast.fire({ icon: "success", title: "Fornecedor atualizado!" });
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro:", error);
      Toast.fire({ icon: "error", title: "Erro ao salvar" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Remover Fornecedor?",
      text: "Esta ação não pode ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
      background: "#141414",
      color: "#fff",
      confirmButtonColor: "#ff4b4b",
      customClass: { popup: "rounded-xl border border-white/5" }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { error } = await supabase.from("bd_fornecedores").delete().eq("id", id);
        if (error) {
          Toast.fire({ icon: "error", title: "Erro ao excluir" });
        } else {
          setSuppliers(suppliers.filter(s => s.id !== id));
          Toast.fire({ icon: "success", title: "Fornecedor removido!" });
        }
      }
    });
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedSuppliers.length && paginatedSuppliers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedSuppliers.map(s => s.id)));
    }
  };

  const handleExportChoice = () => {
    const suppliersToExport = suppliers.filter(s => selectedIds.has(s.id));
    if (suppliersToExport.length === 0) {
      Toast.fire({ icon: "warning", title: "Selecione fornecedor para exportar" });
      return;
    }

    Swal.fire({
      title: 'Exportar Fornecedores',
      text: 'Escolha o formato de exportação:',
      icon: 'info',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Exportar para PDF',
      denyButtonText: 'Exportar para Excel',
      cancelButtonText: 'Cancelar',
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#ff6b00",
      denyButtonColor: "#10b981",
      cancelButtonColor: "#2a2a2a",
      customClass: {
        popup: "rounded-[8px] border border-white/5 shadow-2xl p-4",
        confirmButton: "rounded-lg font-black uppercase text-[10px] px-6 py-3 tracking-widest cursor-pointer",
        denyButton: "rounded-lg font-black uppercase text-[10px] px-6 py-3 tracking-widest cursor-pointer",
        cancelButton: "rounded-lg font-black uppercase text-[10px] px-6 py-3 tracking-widest cursor-pointer mt-2 w-full sm:w-auto sm:mt-0",
        title: "text-base font-black leading-tight mb-2 uppercase tracking-tight",
        htmlContainer: "text-[11px] text-muted-foreground mb-4",
      }
    }).then((result) => {
      if (result.isConfirmed) {
        handleExportPDF(suppliersToExport);
      } else if (result.isDenied) {
        handleExportCSV(suppliersToExport);
      }
    });
  };

  const handleExportPDF = (suppliersToExport: Supplier[]) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Relatório de Fornecedores", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    const subtitle = statusFilter !== "todos" ? `Filtro Status: ${statusFilter}` : "Filtro: Todos os Fornecedores";
    doc.text(subtitle, 14, 30);

    const tableColumn = ["Nome", "Tipo", "CNPJ/CPF", "Telefone", "E-mail", "Status"];
    const tableRows = suppliersToExport.map(s => [
      s.name, 
      s.category || "-",
      s.document || "-", 
      s.phone || "-", 
      s.email || "-", 
      s.status === 'ativo' ? 'Ativo' : 'Inativo'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [255, 107, 0], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let userName = "Administrador";
    const userStr = localStorage.getItem('movieats_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.nome) userName = user.nome;
      } catch (e) {}
    }

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      const footerText = `Emitido por: ${userName} — ${formattedDate} às ${formattedTime}`;
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }

    doc.save(`fornecedores_movieats_${new Date().getTime()}.pdf`);
    Toast.fire({ icon: "success", title: "PDF exportado com sucesso!" });
  };

  const handleExportCSV = (suppliersToExport: Supplier[]) => {
    const csvContent = [
      ["ID", "Nome", "Tipo", "CNPJ/CPF", "Telefone", "E-mail", "Status"],
      ...suppliersToExport.map(s => [
        s.id, 
        s.name, 
        s.category || "-",
        s.document, 
        s.phone, 
        s.email, 
        s.status === 'ativo' ? 'ATIVO' : 'INATIVO'
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fornecedores_movieats_${new Date().getTime()}.csv`;
    link.click();
    
    Toast.fire({ icon: "success", title: "Excel exportado com sucesso!" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-6 mb-2">
              <Briefcase className="text-white w-6 h-6" />
              <h2 className="text-3xl font-headline font-black text-white tracking-tight leading-none ml-2">
                Fornecedores
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-medium ml-1">
              Gerencie seus parceiros de distribuição e contatos comerciais.
            </p>
          </div>

          <button 
            onClick={openAddModal}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-white hover:bg-orange-600 text-slate-900 hover:text-white rounded-lg font-bold text-[13px] transition-all shadow-lg shadow-black/20 active:scale-95 group cursor-pointer"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            Novo Fornecedor
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass border border-white/5 rounded-[8px] p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full max-w-xs group cursor-text">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-40 group-focus-within:opacity-100 transition-opacity" />
            <input 
              type="text" 
              placeholder="Buscar fornecedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-3 pl-11 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-4 focus:ring-white/5 transition-all font-medium"
            />
          </div>

          <div className="relative w-full md:w-[160px]">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-white/20 focus:ring-4 focus:ring-white/5 transition-all font-medium appearance-none cursor-pointer"
            >
              <option value="todos" className="bg-[#1a1a1a]">Todos Status</option>
              <option value="ativo" className="bg-[#1a1a1a]">Ativos</option>
              <option value="inativo" className="bg-[#1a1a1a]">Inativos</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-40 pointer-events-none" />
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportChoice}
              className="flex items-center gap-2 px-5 py-3 glass border-white/10 hover:border-white/30 hover:bg-white/5 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider transition-all cursor-pointer active:scale-95 group"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              {selectedIds.size > 0 ? `Exportar (${selectedIds.size})` : "Exportar"}
            </button>
          </div>
        </div>

        {/* Suppliers Table */}
        {filteredSuppliers.length > 0 ? (
          <div className="glass border border-white/5 rounded-[8px] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-6 py-5 w-10 text-center">
                      <input 
                        type="checkbox" 
                        checked={paginatedSuppliers.length > 0 && selectedIds.size === paginatedSuppliers.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 cursor-pointer accent-primary" 
                      />
                    </th>
                    <th className="px-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-[0.1em] uppercase">Nome</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-[0.1em] uppercase">CNPJ/CPF</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-[0.1em] uppercase">Telefone</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-[0.1em] uppercase">E-mail</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-[0.1em] uppercase text-center">Status</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-[0.1em] uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedSuppliers.map((supplier) => (
                    <tr 
                      key={supplier.id} 
                      className={`hover:bg-white/[0.02] transition-colors group ${selectedIds.has(supplier.id) ? 'bg-primary/5' : ''}`}
                    >
                      <td className="px-6 py-4 align-middle text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(supplier.id)}
                          onChange={() => handleSelectOne(supplier.id)}
                          className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 cursor-pointer accent-primary" 
                        />
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="text-[15px] font-bold text-white group-hover:text-primary transition-colors tracking-tight">
                          {supplier.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="text-[12px] font-medium text-white/70 tracking-wide">
                          {supplier.document || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="text-[12px] font-medium text-white/70 tracking-wide">
                          {supplier.phone || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="text-[12px] font-medium text-white/70 tracking-wide">
                          {supplier.email || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border ${supplier.status === 'ativo' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'}`}>
                          {supplier.status === 'ativo' ? 'ATIVO' : 'INATIVO'}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-5">
                          <button 
                            onClick={() => openEditModal(supplier)} 
                            className="text-muted-foreground hover:text-blue-400 transition-all duration-300 cursor-pointer"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(supplier.id)} 
                            className="text-muted-foreground hover:text-red-400 transition-all duration-300 cursor-pointer"
                            title="Excluir"
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

            {/* Paginação */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-5 px-6 border-t border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1} 
                  className="text-[11px] font-black uppercase tracking-[0.2em] transition-colors cursor-pointer !text-white disabled:opacity-20 disabled:cursor-not-allowed hover:text-primary"
                >
                  Anterior
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i + 1)} 
                      className={`w-8 h-8 flex items-center justify-center text-[12px] font-black transition-all cursor-pointer ${currentPage === i + 1 ? "text-primary" : "!text-white opacity-40 hover:opacity-100"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  className="text-[11px] font-black uppercase tracking-[0.2em] transition-colors cursor-pointer !text-white disabled:opacity-20 disabled:cursor-not-allowed hover:text-primary"
                >
                  Próximo
                </button>
              </div>
              
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                Exibindo <span className="text-white">{startIndex + 1}</span>-<span className="text-white">{Math.min(startIndex + itemsPerPage, totalItems)}</span> de <span className="text-white">{totalItems}</span> fornecedores
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#1f2937]/50 border border-white/5 rounded-2xl animate-in fade-in zoom-in duration-700 shadow-2xl py-20 px-4 text-center">
            <Briefcase size={80} className="text-white opacity-10 mb-8" />
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">Nenhum fornecedor encontrado</h2>
            <p className="text-muted-foreground text-sm font-medium max-w-sm">
              Sua lista de parceiros está vazia. Cadastre o seu primeiro fornecedor.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Cadastro "Clean" */}
      {isModalOpen && editingSupplier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-[#111827] border border-white/5 rounded-[32px] shadow-2xl animate-in zoom-in-95 fade-in slide-in-from-bottom-10 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-8 py-6 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
              <div className="flex flex-col">
                <h3 className="text-base font-headline font-bold text-white uppercase tracking-tight leading-loose">
                  {editingSupplier.id ? "Editar Fornecedor" : "Novo Fornecedor"}
                </h3>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Gestão de Parceiro</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all cursor-pointer group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-white/50 ml-1 block">Nome do Fornecedor</label>
                    <input 
                      type="text" 
                      value={editingSupplier.name}
                      onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                      placeholder="Nome Fantasia ou Razão Social"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl h-12 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-white/50 ml-1 block">CNPJ ou CPF</label>
                    <input 
                      type="text" 
                      value={editingSupplier.document}
                      onChange={(e) => setEditingSupplier({ ...editingSupplier, document: formatDocument(e.target.value) })}
                      placeholder="00.000.000/0000-00"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl h-12 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-white/50 ml-1 block">Telefone / WhatsApp</label>
                    <input 
                      type="text" 
                      value={editingSupplier.phone}
                      onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: formatPhone(e.target.value) })}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl h-12 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-white/50 ml-1 block">E-mail</label>
                    <input 
                      type="email" 
                      value={editingSupplier.email}
                      onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                      placeholder="contato@empresa.com"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl h-12 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-white/50 ml-1 block">Tipo de Fornecedor</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select 
                          value={editingSupplier.category_id}
                          onChange={(e) => {
                            const cat = categories.find(c => c.id === e.target.value);
                            setEditingSupplier({ ...editingSupplier, category_id: e.target.value, category: cat?.nome || "" });
                          }}
                          className="w-full bg-white/[0.05] border border-white/10 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#1a1a1a]">Selecionar Tipo...</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-[#1a1a1a]">{cat.nome}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-40 pointer-events-none" />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={handleEditCategory}
                          className={`h-12 w-12 flex items-center justify-center bg-white/[0.05] border border-white/10 rounded-xl text-white transition-all cursor-pointer ${!editingSupplier.category_id ? 'opacity-20 cursor-not-allowed' : 'hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/30'}`}
                          title="Editar Categoria Selecionada"
                          disabled={!editingSupplier.category_id}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={handleAddCategory}
                          className="h-12 w-12 flex items-center justify-center bg-white/[0.05] border border-white/10 rounded-xl text-white hover:bg-orange-500/20 hover:text-orange-500 hover:border-orange-500/30 transition-all cursor-pointer"
                          title="Adicionar Novo Tipo"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between h-14 px-5 bg-white/[0.03] border border-white/10 rounded-2xl transition-all hover:bg-white/[0.05]">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white tracking-tight">Fornecedor Ativo</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase opacity-50">Visibilidade no sistema</span>
                  </div>
                  <div 
                    className="relative w-12 h-6.5 cursor-pointer"
                    onClick={() => setEditingSupplier({ ...editingSupplier, status: editingSupplier.status === 'ativo' ? 'inativo' : 'ativo' })}
                  >
                    <div className={`w-12 h-6.5 rounded-full transition-all duration-500 border border-white/10 ${editingSupplier.status === 'ativo' ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-white/10'}`} />
                    <div className={`absolute top-1 left-1 w-4.5 h-4.5 bg-white rounded-full transition-all duration-500 shadow-xl ${editingSupplier.status === 'ativo' ? 'translate-x-5.5' : 'translate-x-0'}`} />
                  </div>
                </div>

              </div>

              <div className="px-8 py-6 border-t border-white/[0.03] flex gap-4 bg-white/[0.01]">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-[11px] uppercase tracking-[0.2em] rounded-xl transition-all border border-white/5 active:scale-95 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 h-12 bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl shadow-sm transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SALVANDO...</span>
                    </div>
                  ) : (editingSupplier.id ? "SALVAR ALTERAÇÕES" : "CADASTRAR FORNECEDOR")}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
