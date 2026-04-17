// FILE: CATEGORIAS - VERSION 6.0
"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  ChevronRight,
  ChevronLeft,
  Search,
  Layers,
  CheckCircle2,
  XCircle,
  Download,
  ChevronDown,
  Upload,
  Loader2,
  FolderOpen
} from "lucide-react";
import Swal from "sweetalert2";

// ID Fixo para teste - Villa Gourmet
// const FIXED_ESTABLISHMENT_ID = '17db3a9f-f6c1-434d-8f4a-e40cd67035f2';

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
  },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  }
});

// Gerador de ID curto Elite (6 caracteres aleatórios)
const generateShortId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

interface Category {
  id: string | number;
  name: string;
  order: number;
  status: "ativo" | "inativo";
  image: string;
}

const initialCategories: Category[] = [
  { 
    id: 1, 
    name: "Hambúrgueres Artesanais", 
    order: 1, 
    status: "ativo", 
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150&h=150&auto=format&fit=crop" 
  },
  { 
    id: 2, 
    name: "Pizzas Gourmet", 
    order: 2, 
    status: "ativo", 
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150&h=150&auto=format&fit=crop" 
  },
  { 
    id: 3, 
    name: "Bebidas e Coquetéis", 
    order: 3, 
    status: "ativo", 
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=150&h=150&auto=format&fit=crop" 
  },
];

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Limite fixo conforme regra de negócio
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    if (!establishmentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bd_categorias')
        .select('*')
        .eq('establishment_id', establishmentId)
        .order('order', { ascending: true });

      if (error) throw error;

      if (data) {
        const formatted = data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          order: cat.order || 0,
          status: cat.status === 'active' ? 'ativo' : 'inativo',
          image: cat.image_url || ""
        }));
        setCategories(formatted);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setEstablishmentId(session.user.id);
      } else {
        // Fallback para login de teste se não houver sessão ativa
        // Em produção, isso redirecionaria para o login
        console.warn("Nenhuma sessão ativa encontrada.");
      }
    };
    getSession();

    // Captura role se existir no local
    const userSaved = localStorage.getItem("movieats_user");
    if (userSaved) {
      const user = JSON.parse(userSaved);
      if (user.role) setUserRole(user.role);
    }
  }, []);

  useEffect(() => {
    if (establishmentId) {
      fetchCategories();
    }
  }, [establishmentId]);

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "todos" || cat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Cálculo de Paginação
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  // Resetar página ao filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const openAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredCategories.length && filteredCategories.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCategories.map(cat => cat.id as number)));
    }
  };

  const handleDelete = (category: Category) => {
    Swal.fire({
      title: "Remover Categoria?",
      text: `Deseja excluir "${category.name}"?`,
      icon: "warning",
      width: "400px",
      showCancelButton: true,
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#ff6b00",
      cancelButtonColor: "#2a2a2a",
      iconColor: "#ff6b00",
      customClass: {
        popup: "rounded-[8px] border border-white/5 shadow-2xl p-4",
        confirmButton: "rounded-lg font-black uppercase text-[10px] px-6 py-3 tracking-widest cursor-pointer",
        cancelButton: "rounded-lg font-black uppercase text-[10px] px-6 py-3 tracking-widest cursor-pointer",
        title: "text-base font-black leading-tight mb-2 uppercase tracking-tight",
        htmlContainer: "text-[11px] text-muted-foreground mb-4",
        icon: "scale-75 mb-0"
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase
            .from('bd_categorias')
            .delete()
            .eq('id', category.id);

          if (error) throw error;

          fetchCategories();
          Toast.fire({
            icon: "success",
            title: "Categoria excluída com sucesso"
          });
        } catch (error) {
          Toast.fire({
            icon: "error",
            title: "Erro ao excluir categoria"
          });
        }
      }
    });
  };

  const handleExport = () => {
    const categoriesToExport = categories.filter(cat => selectedIds.has(cat.id));
    
    if (categoriesToExport.length === 0) {
      Toast.fire({
        icon: "info",
        title: "Selecione categorias para exportar"
      });
      return;
    }
    
    // Header do CSV
    const csvContent = [
      ["ID", "Nome", "Ordem", "Status"],
      ...categoriesToExport.map(cat => [cat.id, cat.name, cat.order, cat.status])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `categorias_movieats_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Toast.fire({
      icon: "success",
      title: `${categoriesToExport.length} categorias exportadas com sucesso!`
    });
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx')) {
      Toast.fire({
        icon: "error",
        title: "Arquivo Inválido. Selecione .csv ou .xlsx"
      });
      return;
    }

    // Inicia simulação de importação "Elite"
    setIsImporting(true);
    setImportProgress(0);
    setImportStatus("Iniciando...");

    const phrases = [
      "Lendo arquivo...",
      "Validando estrutura...",
      "Processando categorias...",
      "Sincronizando banco de dados...",
      "Finalizando..."
    ];

    let currentPhraseIndex = 0;
    const intervalTime = 3000; // total 3s
    const steps = 100;
    const stepTime = intervalTime / steps;

    const progressInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, stepTime);

    const phraseInterval = setInterval(() => {
      if (currentPhraseIndex < phrases.length - 1) {
        currentPhraseIndex++;
        setImportStatus(phrases[currentPhraseIndex]);
      } else {
        clearInterval(phraseInterval);
      }
    }, 600);
    
    setTimeout(() => {
      // Simulação de novas categorias vindas da planilha
      const newItems: Category[] = [
        { id: Date.now() + 1, name: "Sobremesas Geladas", order: categories.length + 1, status: "ativo", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=150&h=150&auto=format&fit=crop" },
        { id: Date.now() + 2, name: "Massas Italianas", order: categories.length + 2, status: "ativo", image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=150&h=150&auto=format&fit=crop" },
        { id: Date.now() + 3, name: "Pratos Saudáveis", order: categories.length + 3, status: "inativo", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&h=150&auto=format&fit=crop" },
      ];

      setCategories(prev => [...prev, ...newItems]);
      setIsImporting(false);
      
      // Limpa o input para permitir importar o mesmo arquivo novamente se necessário
      if (importFileRef.current) importFileRef.current.value = "";

      Swal.fire({
        title: "Importação Finalizada",
        text: `${newItems.length} categorias importadas com sucesso!`,
        icon: "success",
        background: "#1a1a1a",
        color: "#fff",
        confirmButtonColor: "#ff6b00",
        timer: 3000,
        customClass: { popup: "rounded-[8px]" }
      });
    }, intervalTime + 200);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setIsSaving(true);

    try {
      const categoryData = {
        name: editingCategory.name,
        order: editingCategory.order,
        status: editingCategory.status === 'ativo' ? 'active' : 'inactive',
        image_url: editingCategory.image,
        establishment_id: establishmentId
      };

      if (editingCategory.id && editingCategory.id !== 0) {
        // Editar
        const { error } = await supabase
          .from('bd_categorias')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        Toast.fire({ icon: "success", title: "Alterações salvas com sucesso" });
      } else {
        // Adicionar com ID Curto (6 chars)
        const shortId = generateShortId();
        const { error } = await supabase
          .from('bd_categorias')
          .insert([{ ...categoryData, id: shortId }]);

        if (error) throw error;
        Toast.fire({ icon: "success", title: "Categoria criada com sucesso" });
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      Toast.fire({ icon: "error", title: "Erro ao salvar categoria" });
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      throw error;
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Toast.fire({
        icon: "error",
        title: "Tamanho excedido (Máx 2MB)"
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      // Mostrar loading manual se desejar, mas vamos fazer direto
      const publicUrl = await uploadImage(file);
      
      setEditingCategory(prev => prev ? { ...prev, image: publicUrl } : { 
        id: 0, 
        name: "", 
        order: categories.length + 1, 
        status: "ativo" as const, 
        image: publicUrl 
      });

      Toast.fire({
        icon: "success",
        title: "Imagem enviada com sucesso"
      });
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Erro ao enviar imagem"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layers className="text-primary w-5 h-5" />
              </div>
              <h2 className="text-2xl font-headline font-black text-white tracking-tight uppercase leading-none">
                Categorias
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              Gerencie os grupos de produtos do seu cardápio digital.
            </p>
          </div>

          {userRole !== "ATENDENTE" && (
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-orange-600 text-white rounded-[8px] font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95 group cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
              Adicionar Nova Categoria
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="glass border border-white/5 rounded-[8px] p-4 flex flex-col md:flex-row gap-4 items-center">
          {/* Search Field */}
          <div className="relative w-full max-w-xs group cursor-text">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-3 pl-11 pr-4 text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
            />
          </div>

          {/* Status Filter Custom Dropdown */}
          <div className="relative group/dropdown">
            <button 
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              className="flex items-center bg-white/[0.03] border border-white/5 rounded-lg py-3 pl-20 pr-10 text-xs text-white font-bold focus:outline-none focus:border-primary/50 transition-all cursor-pointer uppercase tracking-tight relative min-w-[160px] text-left"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-white/10 pr-3 pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,107,0,0.5)]" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Status:</span>
              </div>
              
              {statusFilter === "todos" ? "Todos" : statusFilter === "ativo" ? "Ativo" : "Inativo"}
              
              <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none transition-transform ${isStatusFilterOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isStatusFilterOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[60]" 
                  onClick={() => setIsStatusFilterOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-[8px] shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col py-1">
                    {[
                      { value: "todos", label: "Todos" },
                      { value: "ativo", label: "Ativo" },
                      { value: "inativo", label: "Inativo" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setStatusFilter(option.value);
                          setIsStatusFilterOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer
                          ${statusFilter === option.value ? 'bg-primary/10 text-primary' : 'text-white hover:bg-[#ff6b00] hover:text-white'}
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Import/Export Actions */}
          {userRole !== "ATENDENTE" && (
            <div className="flex items-center gap-3">
              {/* Hidden Import Input */}
              <input 
                type="file" 
                ref={importFileRef}
                onChange={handleFileImport}
                accept=".csv, .xlsx"
                className="hidden"
              />
              
              <button 
                onClick={handleImportClick}
                className="flex items-center gap-2 px-5 py-3 glass border-white/10 hover:border-primary/30 hover:bg-white/5 rounded-lg text-[10px] font-black text-white hover:text-primary uppercase tracking-[0.15em] transition-all cursor-pointer active:scale-95 group"
              >
                <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                Importar
              </button>

              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-3 glass border-white/10 hover:border-primary/30 hover:bg-primary/5 rounded-lg text-[10px] font-black text-white hover:text-primary uppercase tracking-[0.15em] transition-all cursor-pointer active:scale-95 group"
              >
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                {selectedIds.size > 0 ? `Exportar (${selectedIds.size})` : "Exportar"}
              </button>
            </div>
          )}

          <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block" />

          <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Total de itens: <span className="text-white ml-1">{categories.length}</span>
          </div>
        </div>

        {/* EXTERMÍNIO DA TABELA VAZIA - SUBSTITUIÇÃO FORÇADA NUCLEAR */}
        {categories.length > 0 ? (
          <div className="glass border border-white/5 rounded-[8px] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-6 py-5 w-10">
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={filteredCategories.length > 0 && selectedIds.size === filteredCategories.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 cursor-pointer accent-primary" 
                        />
                      </div>
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Imagem</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Nome da Categoria</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Ordem</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((category) => (
                    <tr 
                      key={category.id} 
                      className="category-row bg-transparent hover:bg-white/[0.02] border-b border-white/5 transition-colors"
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(category.id as number)}
                            onChange={() => handleSelectOne(category.id as number)}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 cursor-pointer accent-primary" 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="w-12 h-12 rounded-full border-2 border-white/5 overflow-hidden shadow-inner group-hover:border-primary/30 transition-colors mx-auto bg-white/5 flex items-center justify-center">
                          {category.image ? (
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-110" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-white/10" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white group-hover:text-primary transition-colors tracking-tight uppercase">
                            {category.name}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-bold mt-0.5 uppercase tracking-widest opacity-50">ID: #{category.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-white/5 border border-white/10 rounded-lg text-[11px] font-black text-white/60">
                          {category.order}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${category.status === "ativo" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}>
                            {category.status === "ativo" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span className="text-[9px] font-black uppercase tracking-widest">{category.status}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(category)} className="p-2.5 rounded-lg bg-white/5 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-white/5 hover:border-primary/20 transition-all duration-300 cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(category)} className="p-2.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 border border-white/5 hover:border-red-500/20 transition-all duration-300 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação Estrita */}
            {categories.length > itemsPerPage && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-5 px-6 border-t border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer disabled:text-zinc-600 disabled:cursor-not-allowed hover:text-primary">
                    Anterior
                  </button>
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-black transition-all cursor-pointer border ${currentPage === i + 1 ? "bg-primary border-primary text-white" : "bg-transparent border-white/10 text-white hover:border-white/30"}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer disabled:text-zinc-600 disabled:cursor-not-allowed hover:text-primary">
                    Próximo
                  </button>
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Exibindo <span className="text-white">{startIndex + 1}</span>-<span className="text-white">{Math.min(startIndex + itemsPerPage, categories.length)}</span> de <span className="text-white">{categories.length}</span> categorias
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ESTADO VAZIO LIMPO E CENTRALIZADO */
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#141414]/50 border border-white/5 rounded-2xl animate-in fade-in zoom-in duration-700 shadow-2xl py-20 px-4 text-center">
            <FolderOpen size={80} className="text-white opacity-10 mb-8" />
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">Sua vitrine está vazia</h2>
            <p className="text-muted-foreground text-sm font-medium max-w-sm">
              Clique no botão acima para adicionar sua primeira categoria e organizar seu cardápio.
            </p>
          </div>
        )}

        {/* Loading State fora da tabela se necessário */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4 opacity-50" />
            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Sincronizando com Supabase...</span>
          </div>
        )}

      </div>

      {/* Modal de Cadastro/Edição Padronizado (max-w-2xl) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-xl animate-in fade-in duration-500"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Container - Ultra Compacto e Moderno */}
          <div className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] animate-in zoom-in-95 fade-in slide-in-from-bottom-10 duration-500 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  {editingCategory?.id ? <Pencil className="text-primary w-3.5 h-3.5" /> : <Plus className="text-primary w-3.5 h-3.5" />}
                </div>
                <h3 className="text-[11px] font-headline font-black text-white uppercase tracking-tight leading-none">
                  {editingCategory?.id ? `Editar: ${editingCategory.name}` : "Nova Categoria"}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body - Mais Compacto (Side-by-Side Upload) */}
            <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
              
              <div className="flex gap-5 items-start">
                {/* Upload Lateral Compacto */}
                <div className="w-24 shrink-0">
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 mb-1.5 block">Ícone</label>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-white/5 hover:border-primary/30 rounded-xl flex flex-col items-center justify-center bg-white/[0.02] cursor-pointer group transition-all relative overflow-hidden"
                  >
                    {editingCategory?.image ? (
                      <div className="relative w-full h-full">
                        <img src={editingCategory.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <ImageIcon className="w-5 h-5 text-white/10 group-hover:text-primary transition-colors" />
                        <span className="text-[7px] font-black text-white/20 uppercase tracking-tighter group-hover:text-white">Upload</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Campos Principais em Grid Compacto */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 block">Nome da Categoria</label>
                    <input 
                      type="text" 
                      value={editingCategory?.name || ""}
                      onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : { id: 0, name: e.target.value, order: categories.length + 1, status: "ativo", image: "" })}
                      placeholder="Ex: Pizzas Gourmet"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-lg h-9 px-3 text-[11px] text-white placeholder:text-muted-foreground/20 focus:outline-none focus:border-primary/50 transition-all font-medium"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 block">Ordem</label>
                      <input 
                        type="number" 
                        value={editingCategory?.order || ""}
                        onChange={(e) => setEditingCategory(prev => prev ? { ...prev, order: parseInt(e.target.value) || 0 } : { id: 0, name: "", order: parseInt(e.target.value) || 0, status: "ativo", image: "" })}
                        placeholder="0"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-lg h-9 px-3 text-[11px] text-white focus:outline-none focus:border-primary/50 transition-all font-black text-center"
                        required
                      />
                    </div>
                    {/* Switch de Status embutido no grid para economizar espaço */}
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 block">Visibilidade</label>
                      <div 
                        onClick={() => {
                          if (editingCategory) {
                            const newStatus = editingCategory.status === "ativo" ? "inativo" : "ativo";
                            setEditingCategory({ ...editingCategory, status: newStatus });
                          }
                        }}
                        className={`w-full h-9 rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${editingCategory?.status === 'ativo' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-white/20'}`}
                      >
                        {editingCategory?.status === 'ativo' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span className="text-[9px] font-black uppercase tracking-widest">{editingCategory?.status || 'ativo'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação Final - Compactos e Modernos */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 h-9 bg-white/5 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-all border border-white/5 active:scale-95 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 h-9 bg-primary hover:bg-orange-600 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      {editingCategory?.id ? "Salvar Alterações" : "Criar Categoria"}
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Loading Overlay Importação "Elite" */}
      {isImporting && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-8 w-full max-w-[400px] px-6">
            <div className="relative">
              {/* Outer Ring */}
              <div className="w-20 h-20 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
              {/* Icon in Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="flex flex-col items-center text-center gap-2">
                <h3 className="text-white font-black text-[16px] uppercase tracking-[0.2em]">
                  {importStatus}
                </h3>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Operação em progresso • {importProgress}%
                </p>
              </div>

              {/* Progress Bar Container */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_15px_rgba(255,107,0,0.5)]"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
            
            <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em] mt-2">
              DNA ELITE • MOVIEATS
            </span>
          </div>
        </div>
      )}



      <style jsx global>{`
        .category-row {
          cursor: pointer !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          transition: background 0.2s !important;
        }
        .category-row:hover {
          background: rgba(255, 255, 255, 0.03) !important;
        }
      `}</style>

    </DashboardLayout>
  );
}
