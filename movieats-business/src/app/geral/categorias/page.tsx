// FILE: CATEGORIAS - VERSION 6.0
"use client";

import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
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
  Tag,
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  ChevronDown,
  Loader2,
  FolderOpen,
  Camera
} from "lucide-react";
import Swal from "sweetalert2";
import { getPublicUrl } from "@/lib/utils";

// ID Fixo para teste - Villa Gourmet
// const FIXED_ESTABLISHMENT_ID = '17db3a9f-f6c1-434d-8f4a-e40cd67035f2';

// Configuração do Toast elegante conforme o padrão Movieats
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  background: "#1f2937",
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
  descricao: string;
  order: number;
  status: "ativo" | "inativo";
  image_url: string;
}

const initialCategories: Category[] = [
  { 
    id: 1, 
    name: "Hambúrgueres Artesanais", 
    descricao: "Nossos melhores burguers feitos na brasa.",
    order: 1, 
    status: "ativo", 
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150&h=150&auto=format&fit=crop" 
  },
  { 
    id: 2, 
    name: "Pizzas Gourmet", 
    descricao: "Pizzas artesanais com massa de fermentação lenta.",
    order: 2, 
    status: "ativo", 
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150&h=150&auto=format&fit=crop" 
  },
  { 
    id: 3, 
    name: "Bebidas e Coquetéis", 
    descricao: "Sucos naturais, refrigerantes e drinks exclusivos.",
    order: 3, 
    status: "ativo", 
    image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=150&h=150&auto=format&fit=crop" 
  },
];

export default function CategoriasPage() {
  console.log("URL BASE CATEGORIAS (Build/Runtime):", process.env.NEXT_PUBLIC_R2_PUBLIC_URL);
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Limite fixo: 6 categorias por página conforme solicitado
  
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
          descricao: cat.descricao || "",
          order: cat.order || 0,
          status: cat.status === 'active' ? 'ativo' : 'inativo',
          image_url: cat.image_url || ""
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
    setSelectedFile(null);
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setSelectedFile(null);
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  const handleSelectOne = (id: string | number) => {
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
      setSelectedIds(new Set(filteredCategories.map(cat => cat.id)));
    }
  };

  const handleToggleStatus = async (category: Category) => {
    const newStatus = category.status === "ativo" ? "inactive" : "active";
    
    try {
      const { error } = await supabase
        .from('bd_categorias')
        .update({ status: newStatus })
        .eq('id', category.id);

      if (error) throw error;

      Toast.fire({
        icon: "success",
        title: `Status atualizado para ${newStatus === 'active' ? 'Ativo' : 'Inativo'}`
      });
      fetchCategories();
    } catch (error) {
      console.error("Erro ao mudar status:", error);
      Toast.fire({
        icon: "error",
        title: "Erro ao atualizar status"
      });
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
      background: "#1f2937",
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
          // Limpeza física no R2 (SaaS Compliance)
          if (category.image_url && (category.image_url.includes('cdn.movieats.com.br') || category.image_url.includes('softcloudba.com'))) {
            await fetch('/api/upload', {
              method: 'DELETE',
              body: JSON.stringify({ url: category.image_url })
            }).catch(err => console.error("Erro silencioso ao deletar R2:", err));
          }

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

  const handleExport = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // @ts-ignore
    const selectedRows = Array.from(selectedIds);
    if (selectedRows.length === 0) {
      Toast.fire({
        icon: "warning",
        title: "Selecione categoria para exportar"
      });
      return;
    }

    const categoriesToExport = categories.filter(cat => selectedIds.has(cat.id));
    
    if (categoriesToExport.length === 0) {
      Toast.fire({
        icon: "info",
        title: "Aviso",
        text: "Nenhuma categoria correspondente encontrada para exportação."
      });
      return;
    }

    try {
      Toast.fire({
        icon: "info",
        title: "Exportando...",
        text: "Preparando dados.",
        timer: 1500
      });

      const dataToExport = categoriesToExport.map(cat => ({
        "ID": cat.id,
        "NOME": cat.name,
        "DESCRIÇÃO": cat.descricao,
        "ORDEM": cat.order,
        "STATUS": cat.status === 'ativo' ? 'Ativo' : 'Inativo',
        "IMAGEM": cat.image_url
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Categorias");

      const timestamp = new Date().getTime();
      XLSX.writeFile(workbook, `relatorio_categorias_${timestamp}.xlsx`);
      
      Toast.fire({
        icon: "success",
        title: "Sucesso",
        text: "Categoria exportada com sucesso."
      });
    } catch (error) {
      console.error("Falha na exportação:", error);
      Toast.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível concluir a exportação."
      });
    }
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx')) {
      Toast.fire({
        icon: "error",
        title: "Arquivo Inválido. Selecione um arquivo .xlsx"
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportStatus("Lendo arquivo...");

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          throw new Error("O arquivo está vazio ou não possui dados válidos.");
        }

        setImportStatus("Sincronizando com Supabase...");
        setImportProgress(50);

        // Mapeamento Excel -> Supabase
        const categoriesToUpsert = data.map((row: any) => {
          // Mapeia visibilidade para o status do banco
          let statusValue = 'active';
          const vis = String(row["VISIBILIDADE"] || "").toLowerCase();
          if (vis === 'inativo' || vis === 'inactive') {
            statusValue = 'inactive';
          }

          return {
            id: row["ID"] || undefined, // Se não tiver ID (novo), o Supabase gera ou ignora se for autoincrement
            name: row["NOME"] || "Sem Nome",
            descricao: row["DESCRIÇÃO"] || "",
            order: parseInt(row["ORDEM"]) || 0,
            status: statusValue,
            image_url: row["URL DA IMAGEM"] || "",
            establishment_id: establishmentId
          };
        });

        // Executa Upsert no Supabase
        const { error } = await supabase
          .from('bd_categorias')
          .upsert(categoriesToUpsert, { onConflict: 'id' });

        if (error) throw error;

        setImportProgress(100);
        setImportStatus("Finalizado!");
        
        Toast.fire({
          icon: "success",
          title: "Importação Concluída",
          text: "Dados importados e sincronizados com o Supabase com sucesso!"
        });

        // Recarrega lista
        fetchCategories();
      } catch (err: any) {
        console.error("Erro na importação:", err);
        Toast.fire({
          icon: "error",
          title: "Erro na Importação",
          text: err.message || "Ocorreu um erro ao processar o arquivo."
        });
      } finally {
        setIsImporting(false);
        if (importFileRef.current) importFileRef.current.value = "";
      }
    };

    reader.onerror = () => {
      setIsImporting(false);
      Toast.fire({
        icon: "error",
        title: "Erro de Leitura",
        text: "Não foi possível ler o arquivo selecionado."
      });
    };

    reader.readAsBinaryString(file);
  };


  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setIsSaving(true);

    try {
      let finalImageUrl = editingCategory.image_url;

      // Se houver um novo arquivo selecionado, faz o upload para o R2 primeiro
      if (selectedFile) {
        setImportStatus("Fazendo upload da imagem...");

        // Substituição ao Alterar: Deleta o arquivo antigo do R2 antes de subir o novo
        if (editingCategory.image_url && (editingCategory.image_url.includes('cdn.movieats.com.br') || editingCategory.image_url.includes('softcloudba.com'))) {
          await fetch('/api/upload', {
            method: 'DELETE',
            body: JSON.stringify({ url: editingCategory.image_url })
          }).catch(err => console.error("Erro ao limpar arquivo antigo:", err));
        }
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (establishmentId) {
          formData.append('establishment_id', establishmentId);
        }

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const contentType = uploadResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Erro no upload');
          } else {
            throw new Error("Erro: Limite de 4MB excedido para este servidor.");
          }
        }

        const data = await uploadResponse.json();
        finalImageUrl = data.url;
      }

      // Log específico solicitado para audição de URL
      console.log('URL para o banco:', finalImageUrl);

      const categoryData = {
        name: editingCategory.name,
        descricao: editingCategory.descricao,
        order: editingCategory.order,
        status: editingCategory.status === 'ativo' ? 'active' : 'inactive',
        image_url: finalImageUrl,
        establishment_id: establishmentId
      };

      if (editingCategory.id && editingCategory.id !== 0) {
        // Editar: Aguarda resposta do Supabase
        const { error } = await supabase
          .from('bd_categorias')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        Toast.fire({ icon: "success", title: "Alterações salvas com sucesso" });
      } else {
        // Adicionar: Aguarda resposta do Supabase com ID Curto (6 chars)
        const shortId = generateShortId();
        const { error } = await supabase
          .from('bd_categorias')
          .insert([{ ...categoryData, id: shortId }]);

        if (error) throw error;
        Toast.fire({ icon: "success", title: "Categoria criada com sucesso" });
      }

      // LIMPEZA DE ESTADOS: Somente após sucesso confirmado pelo Supabase (não deu catch)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl("");
      setIsModalOpen(false);
      
      // Atualiza lista local
      await fetchCategories();
    } catch (error: any) {
      console.error("Erro crítico no fluxo de salvamento:", error);
      Toast.fire({ 
        icon: "error", 
        title: "Erro ao gravar categoria",
        text: error.message 
      });
    } finally {
      setIsSaving(false);
    }
  };



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limite estrito de 4MB para evitar erro 413 da Vercel
    const MAX_SIZE = 4194304; 
    if (file.size > MAX_SIZE) {
      Toast.fire({
        icon: "warning",
        title: "Erro: Limite de 4MB excedido para este servidor."
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Gerar Preview Local IMEDIATO
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setSelectedFile(file);

    console.log("Preview local gerado:", localUrl);
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-5 mb-2">
              <Tag className="text-white w-6 h-6 opacity-80" />
              <h2 className="text-3xl font-headline font-black text-white tracking-tight leading-none">
                Categorias
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-medium ml-1">
              Gerencie as categorias de produtos do seu cardápio digital.
            </p>
          </div>

          {userRole !== "ATENDENTE" && (
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2.5 px-5 py-2.5 bg-white hover:bg-[#ff6b00] text-slate-900 hover:text-white rounded-lg font-bold text-sm transition-all shadow-sm border border-white/5 active:scale-95 group cursor-pointer"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              Nova Categoria
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="glass border border-white/5 rounded-[8px] p-4 flex flex-col md:flex-row gap-4 items-center">
          {/* Search Field */}
          <div className="relative w-full max-w-xs group cursor-text">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-40 group-focus-within:opacity-100 transition-opacity" />
            <input 
              type="text" 
              placeholder="Buscar categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-3 pl-11 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-4 focus:ring-white/5 transition-all font-medium"
            />
          </div>

          {/* Status Filter Custom Dropdown */}
          <div className="relative group/dropdown">
            <button 
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              className="flex items-center bg-white/[0.03] border border-white/5 rounded-lg py-3 pl-20 pr-10 text-xs text-white font-bold focus:outline-none focus:border-white/20 transition-all cursor-pointer relative min-w-[160px] text-left"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-white/10 pr-3 pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
                <span className="text-[9px] font-bold text-white opacity-40 uppercase tracking-wider">Status:</span>
              </div>
              
              {statusFilter === "todos" ? "Todos" : statusFilter === "ativo" ? "Ativo" : "Inativo"}
              
              <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-40 pointer-events-none transition-transform ${isStatusFilterOpen ? 'rotate-180 opacity-100' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isStatusFilterOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[60]" 
                  onClick={() => setIsStatusFilterOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-full bg-[#1f2937] border border-white/10 rounded-[8px] shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                          ${statusFilter === option.value ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}
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
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-3 glass border-white/10 hover:border-primary/30 hover:bg-primary/5 rounded-lg text-[10px] font-black text-white hover:text-primary uppercase tracking-[0.15em] transition-all cursor-pointer active:scale-95 group"
              >
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                {selectedIds.size > 0 ? `Exportar (${selectedIds.size})` : "Exportar"}
              </button>
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
                    <th className="px-6 py-5 text-[11px] font-black text-[#FFFFFF] tracking-[0.1em] text-center uppercase">Ordem</th>
                    <th className="px-6 py-5 text-[11px] font-black text-[#FFFFFF] tracking-[0.1em] uppercase">Nome da Categoria</th>
                    <th className="px-6 py-5 text-[11px] font-black text-[#FFFFFF] tracking-[0.1em] uppercase">Descrição Detalhada</th>
                    <th className="px-6 py-5 text-[11px] font-black text-[#FFFFFF] tracking-[0.1em] text-center uppercase">Status</th>
                    <th className="px-6 py-5 text-[11px] font-black text-[#FFFFFF] tracking-[0.1em] text-right uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((category) => (
                    <tr 
                      key={category.id} 
                      className="category-row bg-transparent hover:bg-white/[0.02] border-b border-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(category.id)}
                            onChange={() => handleSelectOne(category.id)}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 cursor-pointer accent-primary" 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className="text-[11px] font-bold text-white/60">
                            {category.order}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-white group-hover:text-primary transition-colors tracking-tight uppercase">
                          {category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg text-muted-foreground font-medium line-clamp-1 max-w-[500px]">
                          {category.descricao || "Sem descrição disponível"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${category.status === 'ativo' ? 'text-[#22c55e]' : 'text-zinc-600'}`}>
                            {category.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-5">
                          <button 
                            onClick={() => openEditModal(category)} 
                            className="text-muted-foreground hover:text-blue-400 transition-all duration-300 cursor-pointer"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(category)} 
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

            {/* Paginação Estrita - Fixa conforme solicitado */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-5 px-6 border-t border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1} 
                    className="text-[11px] font-black uppercase tracking-[0.2em] transition-colors cursor-pointer text-[#FFFFFF] disabled:opacity-20 disabled:cursor-not-allowed hover:text-primary"
                  >
                    Anterior
                  </button>
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setCurrentPage(i + 1)} 
                        className={`w-8 h-8 flex items-center justify-center text-[12px] font-black transition-all cursor-pointer ${currentPage === i + 1 ? "text-primary" : "text-[#FFFFFF] opacity-40 hover:opacity-100"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages || totalPages === 0} 
                    className="text-[11px] font-black uppercase tracking-[0.2em] transition-colors cursor-pointer text-[#FFFFFF] disabled:opacity-20 disabled:cursor-not-allowed hover:text-primary"
                  >
                    Próximo
                  </button>
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Exibindo <span className="text-white">{startIndex + 1}</span>-<span className="text-white">{Math.min(startIndex + itemsPerPage, categories.length)}</span> de <span className="text-white">{categories.length}</span> categorias
                </div>
              </div>
          </div>
        ) : (
          /* ESTADO VAZIO LIMPO E CENTRALIZADO */
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#1f2937]/50 border border-white/5 rounded-2xl animate-in fade-in zoom-in duration-700 shadow-2xl py-20 px-4 text-center">
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

      {/* Modal de Cadastro/Edição Estilo Login (Premium) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
          {/* Backdrop Blur Premium */}
          <div 
            className="absolute inset-0 bg-[#111827]/90 backdrop-blur-xl animate-in fade-in duration-500"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Container - Equilibrado e Profissional */}
          <div className="relative w-full max-w-2xl bg-[#111827]/95 backdrop-blur-[15px] border border-white/5 rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.9)] animate-in zoom-in-95 fade-in slide-in-from-bottom-10 duration-700 overflow-hidden">
            
            {/* Modal Header Premium */}
            <div className="px-8 py-5 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
              <div className="flex flex-col">
                <h3 className="text-base font-headline font-bold text-white uppercase tracking-tight leading-none mb-1">
                  {editingCategory?.id ? `Editar Categoria` : "Nova Categoria"}
                </h3>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Ajuste de visibilidade e conteúdo</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Layout Lateral Equilibrado */}
            <form onSubmit={handleSaveCategory} className="p-8 pt-6 space-y-6">
              
              <div className="space-y-6">
                {/* Nome da Categoria */}
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-white/40 ml-1 block uppercase tracking-widest">Nome da Categoria</label>
                  <input 
                    type="text" 
                    value={editingCategory?.name || ""}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : { id: 0, name: e.target.value, descricao: "", order: categories.length + 1, status: "ativo", image_url: "" })}
                    placeholder="Ex: Hambúrgueres"
                    className="w-full h-12 bg-white/[0.05] border border-white/5 rounded-xl px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all font-medium"
                    required
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-white/40 ml-1 block uppercase tracking-widest">Descrição Detalhada</label>
                  <textarea 
                    value={editingCategory?.descricao || ""}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, descricao: e.target.value } : { id: 0, name: "", descricao: e.target.value, order: categories.length + 1, status: "ativo", image_url: "" })}
                    placeholder="Descreva o que há nesta categoria..."
                    className="w-full h-28 bg-white/[0.05] border border-white/5 rounded-xl py-4 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all font-medium resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ordem */}
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-white/40 ml-1 block uppercase tracking-widest">Ordem de Exibição</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editingCategory?.order || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setEditingCategory(prev => prev ? { ...prev, order: isNaN(val) ? 0 : val } : { id: 0, name: "", descricao: "", order: isNaN(val) ? 0 : val, status: "ativo", image_url: "" });
                      }}
                      className="w-full h-12 bg-white/[0.05] border border-white/5 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                      required
                    />
                  </div>

                  {/* Visibilidade */}
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-white/40 ml-1 block uppercase tracking-widest">Status de Visibilidade</label>
                    <div className="flex items-center gap-4 h-12 px-5 bg-white/[0.03] border border-white/5 rounded-xl">
                      <div 
                        className="relative w-11 h-6 cursor-pointer"
                        onClick={() => {
                          setEditingCategory(prev => {
                            if (!prev) return null;
                            return { ...prev, status: prev.status === 'ativo' ? 'inativo' : 'ativo' };
                          });
                        }}
                      >
                        <div className={`w-11 h-6 rounded-full transition-all duration-300 border border-white/5 ${editingCategory?.status === 'ativo' ? 'bg-[#22c55e]' : 'bg-white/10'}`} />
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg ${editingCategory?.status === 'ativo' ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${editingCategory?.status === 'ativo' ? 'text-[#22c55e]' : 'text-white/20'}`}>
                        {editingCategory?.status === 'ativo' ? 'Categoria Ativa' : 'Categoria Oculta'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação Premium */}
              <div className="flex gap-4 pt-6 border-t border-white/[0.03]">
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
                  className="flex-1 px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_10px_20px_rgba(234,88,12,0.2)] active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    editingCategory?.id ? "Atualizar Categoria" : "Salvar Categoria"
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
