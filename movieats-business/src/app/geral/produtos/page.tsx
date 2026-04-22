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
  Search,
  Box,
  CheckCircle2,
  XCircle,
  Download,
  ChevronDown,
  Upload,
  Loader2,
  Tag,
  FolderOpen
} from "lucide-react";
import Swal from "sweetalert2";
import { getPublicUrl } from "@/lib/utils";

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

interface Product {
  id: string | number;
  name: string;
  categoria_id: string;
  preco: number;
  order_index: number;
  descricao: string;
  image_url: string;
  active: boolean;
  removable_ingredients: string[];
}

interface Category {
  id: string;
  name: string;
}

const initialProducts: Product[] = [
  { 
    id: 1, 
    name: "Smash Burger Duo", 
    categoria_id: "cat_1", 
    preco: 38.90, 
    order_index: 1, 
    descricao: "Pão brioche, dois blends de 80g, queijo cheddar e maionese da casa.", 
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150&h=150&auto=format&fit=crop", 
    active: true,
    removable_ingredients: ["Cebola", "Picles", "Maionese"]
  },
  { 
    id: 2, 
    name: "Batata Rústica", 
    categoria_id: "cat_2", 
    preco: 18.00, 
    order_index: 2, 
    descricao: "Batatas fritas com casca, temperadas com páprica e alecrim.", 
    image_url: "https://images.unsplash.com/photo-1573015084245-7da883204507?q=80&w=150&h=150&auto=format&fit=crop", 
    active: true,
    removable_ingredients: ["Páprica", "Alecrim"]
  }
];

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState("");
  const [ingredientInput, setIngredientInput] = useState("");
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Carregar sessão, Categorias e Produtos ao montar
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setEstablishmentId(session.user.id);
      } else {
        // Fallback para localStorage
        const userSaved = localStorage.getItem("movieats_user");
        if (userSaved) {
          try {
            const user = JSON.parse(userSaved);
            if (user.id) setEstablishmentId(user.id);
          } catch (e) {}
        }
      }
    };
    getSession();

    const userSaved = localStorage.getItem("movieats_user");
    if (userSaved) {
      try {
        const user = JSON.parse(userSaved);
        if (user.role) setUserRole(user.role);
      } catch (e) {}
    }
  }, []);

  const fetchCategories = async () => {
    if (!establishmentId) return;
    const { data, error } = await supabase
      .from('bd_categorias')
      .select('id, name')
      .eq('establishment_id', establishmentId)
      .eq('status', 'active')
      .order('order_index', { ascending: true });

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchProducts = async () => {
    if (!establishmentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bd_produtos')
        .select('*')
        .eq('establishment_id', establishmentId)
        .order('order_index', { ascending: true });

      if (!error && data) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (establishmentId) {
      fetchCategories();
      fetchProducts();
    }
  }, [establishmentId]);

  // Remoção do salvamento automático em localStorage, agora via Supabase nas ações

  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    const catName = categories.find(c => c.id === prod.categoria_id)?.name || "";
    const matchesCategory = categoryFilter === "todas" || catName === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingProduct({
      id: 0,
      name: "",
      categoria_id: categories[0]?.id || "",
      preco: 0,
      order_index: products.length + 1,
      descricao: "",
      image_url: "",
      active: true,
      removable_ingredients: []
    });
    setIngredientInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct({ ...product, removable_ingredients: [...(product.removable_ingredients || [])] });
    setIngredientInput("");
    setIsModalOpen(true);
  };

  const handleAddIngredient = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ingredientInput.trim() || !editingProduct) return;
    
    if (editingProduct.removable_ingredients.includes(ingredientInput.trim())) {
      setIngredientInput("");
      return;
    }

    setEditingProduct({
      ...editingProduct,
      removable_ingredients: [...editingProduct.removable_ingredients, ingredientInput.trim()]
    });
    setIngredientInput("");
  };

  const handleRemoveIngredient = (ingredient: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      removable_ingredients: editingProduct.removable_ingredients.filter(i => i !== ingredient)
    });
  };

  const handleSelectOne = (id: any) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds(new Set());
    } else {
      // @ts-ignore
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleDelete = (product: Product) => {
    Swal.fire({
      title: "Remover Produto?",
      text: `Deseja excluir "${product.name}"?`,
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
        const { error } = await supabase
          .from('bd_produtos')
          .delete()
          .eq('id', product.id);

        if (!error) {
          setProducts(prev => prev.filter(p => p.id !== product.id));
          Toast.fire({ icon: "success", title: "Produto excluído com sucesso" });
        } else {
          Toast.fire({ icon: "error", title: "Erro ao excluir produto" });
        }
      }
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    // Garantia de establishment_id
    let currentEstId = establishmentId;
    if (!currentEstId) {
      const { data: { session } } = await supabase.auth.getSession();
      currentEstId = session?.user?.id || null;
      if (currentEstId) setEstablishmentId(currentEstId);
    }

    if (!currentEstId) {
      Toast.fire({ icon: "error", title: "Sessão inválida. Faça login novamente." });
      return;
    }

    setIsSaving(true);

    try {
      let finalImageUrl = editingProduct.image_url;

      // Upload R2 se houver nova imagem
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        if (currentEstId) formData.append('establishment_id', currentEstId);

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Falha no upload da imagem');
        
        const { url } = await uploadRes.json();
        finalImageUrl = url;
      }

      const productData = {
        name: editingProduct.name,
        categoria_id: editingProduct.categoria_id,
        preco: editingProduct.preco,
        descricao: editingProduct.descricao,
        order_index: editingProduct.order_index,
        active: editingProduct.active,
        image_url: finalImageUrl,
        removable_ingredients: editingProduct.removable_ingredients,
        establishment_id: currentEstId
      };

      if (editingProduct.id === 0) {
        const { error } = await supabase.from('bd_produtos').insert([productData]);
        if (error) throw error;
        Toast.fire({ icon: "success", title: "Produto criado com sucesso" });
      } else {
        const { error } = await supabase
          .from('bd_produtos')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
        Toast.fire({ icon: "success", title: "Produto atualizado com sucesso" });
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      Toast.fire({ icon: "error", title: err.message || "Erro ao salvar produto" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    // @ts-ignore
    const productsToExport = products.filter(p => selectedIds.has(p.id));
    
    if (productsToExport.length === 0) {
      Toast.fire({
        icon: "info",
        title: "Selecione produtos para exportar"
      });
      return;
    }
    
    // Header do CSV
    const csvContent = [
      ["ID", "Nome", "Categoria", "Preço", "Ordem", "Status", "Descrição"],
      ...productsToExport.map(p => {
        const catName = categories.find(c => c.id === p.categoria_id)?.name || "Sem Categoria";
        return [p.id, p.name, catName, p.preco, p.order_index, p.active ? "Ativo" : "Inativo", p.descricao];
      })
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `produtos_movieats_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Toast.fire({
      icon: "success",
      title: `${productsToExport.length} produtos exportados com sucesso!`
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
      "Processando dados...",
      "Validando estoque...",
      "Sincronizando produtos...",
      "Otimizando cardápio...",
      "Finalizando..."
    ];

    let currentPhraseIndex = 0;
    const intervalTime = 3000; 
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
      // Simulação de novos produtos
      const newItems: Product[] = [
        { id: Date.now() + 1, name: "Pizza Calabresa", categoria_id: "", preco: 45.90, order_index: products.length + 1, descricao: "Molho de tomate, mussarela e calabresa.", image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150&h=150&auto=format&fit=crop", active: true, removable_ingredients: [] },
        { id: Date.now() + 2, name: "Suco de Laranja", categoria_id: "", preco: 12.00, order_index: products.length + 2, descricao: "Suco natural 500ml.", image_url: "https://images.unsplash.com/photo-1621506821199-a996ee0fef8d?q=80&w=150&h=150&auto=format&fit=crop", active: true, removable_ingredients: [] },
      ];

      setProducts(prev => {
        const newState = [...prev, ...newItems];
        localStorage.setItem('movieats_products', JSON.stringify(newState));
        return newState;
      });

      setIsImporting(false);
      if (importFileRef.current) importFileRef.current.value = "";

      Swal.fire({
        title: "Importação Finalizada",
        text: `${newItems.length} produtos importados com sucesso!`,
        icon: "success",
        background: "#1a1a1a",
        color: "#fff",
        confirmButtonColor: "#ff6b00",
        timer: 3000,
        customClass: { popup: "rounded-[8px]" }
      });
    }, intervalTime + 200);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Toast.fire({
        icon: "error",
        title: "Tamanho excedido (Máx 2MB)"
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEditingProduct(prev => prev ? { ...prev, image_url: base64String } : null);
      Toast.fire({ icon: "success", title: "Imagem selecionada com sucesso" });
    };
    reader.readAsDataURL(file);
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-white/10 rounded-lg">
                <Box className="text-white w-5 h-5" />
              </div>
              <h2 className="text-2xl font-headline font-black text-white tracking-tight leading-none">
                Produtos
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              Gerencie os itens do seu cardápio digital.
            </p>
          </div>

          {userRole !== "ATENDENTE" && (
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2.5 px-5 py-2.5 bg-white hover:bg-orange-600 text-slate-900 hover:text-white rounded-lg font-bold text-[13px] transition-all shadow-lg shadow-black/20 active:scale-95 group cursor-pointer"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              Novo Produto
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
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-3 pl-11 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-4 focus:ring-white/5 transition-all font-medium"
            />
          </div>

          {/* Category Filter */}
          <div className="relative group/dropdown">
            <button 
              onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)}
              className="flex items-center bg-white/[0.03] border border-white/5 rounded-lg py-3 pl-20 pr-10 text-xs text-white font-bold focus:outline-none focus:border-white/20 transition-all cursor-pointer relative min-w-[200px] text-left"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-white/10 pr-3 pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
                <span className="text-[9px] font-bold text-white opacity-40 uppercase tracking-wider">Cat:</span>
              </div>
              {categoryFilter === "todas" ? "Todas" : categoryFilter}
              <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-40 pointer-events-none transition-transform ${isCategoryFilterOpen ? 'rotate-180 opacity-100' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isCategoryFilterOpen && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setIsCategoryFilterOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-full bg-[#1f2937] border border-white/10 rounded-[8px] shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col py-1 max-h-60 overflow-y-auto">
                    <button 
                      onClick={() => { setCategoryFilter("todas"); setIsCategoryFilterOpen(false); }} 
                      className={`w-full text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer
                        ${categoryFilter === "todas" ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                      `}
                    >
                      Todas
                    </button>
                    {categories.map((cat) => (
                      <button 
                        key={cat.id} 
                        onClick={() => { setCategoryFilter(cat.name); setIsCategoryFilterOpen(false); }} 
                        className={`w-full text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer
                          ${categoryFilter === cat.name ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                        `}
                      >
                        {cat.name}
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
              <input type="file" ref={importFileRef} onChange={handleFileImport} accept=".csv, .xlsx" className="hidden" />
              <button 
                onClick={handleImportClick}
                className="flex items-center gap-2 px-5 py-3 glass border-white/10 hover:border-white/30 hover:bg-white/5 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider transition-all cursor-pointer active:scale-95 group"
              >
                <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                Importar
              </button>

              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-3 glass border-white/10 hover:border-white/30 hover:bg-white/5 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider transition-all cursor-pointer active:scale-95 group"
              >
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                {selectedIds.size > 0 ? `Exportar (${selectedIds.size})` : "Exportar"}
              </button>
            </div>
          )}

          <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block" />

          <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] font-bold text-white opacity-40 uppercase tracking-wider">
            Total de itens: <span className="text-white ml-1 opacity-100">{products.length}</span>
          </div>
        </div>

        {/* Products Table or Empty State */}
        {products.length > 0 ? (
          <div className="glass border border-white/5 rounded-[8px] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-5 w-10">
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 cursor-pointer accent-primary" 
                      />
                    </div>
                  </th>
                  <th className="px-6 py-5 text-[11px] font-bold text-white opacity-40 tracking-wider">Imagem</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-white opacity-40 tracking-wider">Produto</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-white opacity-40 tracking-wider">Categoria</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-white opacity-40 tracking-wider text-center">Preço</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-white opacity-40 tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                    <tr key={product.id} className={`hover:bg-white/[0.02] transition-colors group ${selectedIds.has(product.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(product.id)}
                          onChange={() => handleSelectOne(product.id)}
                          className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 cursor-pointer accent-primary" 
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg border border-white/5 overflow-hidden mx-auto shadow-inner bg-black/20 group-hover:border-primary/30 transition-colors">
                        <img 
                          src={product.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&h=150&auto=format&fit=crop"} 
                          alt={product.name} 
                          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-110" 
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white group-hover:text-primary transition-colors uppercase tracking-tight">
                          {product.name}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-50 mt-0.5">ID: #{product.id.toString().padStart(4, '0')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-white/50 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md uppercase tracking-wide">
                        {categories.find(c => c.id === product.categoria_id)?.name || "Sem Categoria"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-white tracking-tighter">
                        R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {userRole !== "ATENDENTE" ? (
                        <div className="flex items-center justify-end gap-5">
                          <button 
                            onClick={() => openEditModal(product)} 
                            className="text-muted-foreground hover:text-blue-400 transition-all duration-300 cursor-pointer"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product)} 
                            className="text-muted-foreground hover:text-red-400 transition-all duration-300 cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-30 italic">Somente Leitura</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-40">Nenhum produto encontrado.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
          /* ESTADO VAZIO LIMPO E CENTRALIZADO */
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#1f2937]/50 border border-white/5 rounded-2xl animate-in fade-in zoom-in duration-700 shadow-2xl py-20 px-4 text-center">
            <FolderOpen size={80} className="text-white opacity-10 mb-8" />
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">Sua vitrine de produtos está vazia</h2>
            <p className="text-muted-foreground text-sm font-medium max-w-sm">
              Clique no botão acima para adicionar seu primeiro produto e organizar seu cardápio.
            </p>
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
          
          {/* Modal Container - Estilo Login (Suave e Moderno) */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1f2937] border border-white/5 rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.9)] animate-in zoom-in-95 fade-in slide-in-from-bottom-10 duration-700 custom-scrollbar">
            
            {/* Modal Header Premium */}
            <div className="px-8 py-6 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
              <div className="flex flex-col">
                <h3 className="text-base font-headline font-bold text-white uppercase tracking-tight leading-loose">
                  {editingProduct?.id ? `Editar Produto` : "Novo Produto"}
                </h3>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Gestão de Cardápio Digital</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all cursor-pointer group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-8 pt-6 space-y-6">
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-white/50 ml-1 block">Imagem do Produto</label>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full h-24 border-2 border-dashed border-white/5 hover:border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-2 bg-white/[0.02] cursor-pointer group transition-all relative overflow-hidden"
                >
                  {editingProduct?.image_url && (
                    <img 
                      src={editingProduct.image_url} 
                      className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity" 
                      alt="" 
                    />
                  )}
                  <div className="p-2 bg-white/5 rounded-full group-hover:scale-110 transition-all">
                    <ImageIcon className="w-5 h-5 text-white/30 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-white transition-colors">Upload da Imagem</span>
                    <span className="text-[8px] text-muted-foreground/30 font-bold uppercase">PNG ou JPG • Máx 4MB</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna 1: Nome e Categoria */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-white/50 ml-1 block">Nome do Produto</label>
                    <input 
                      type="text" 
                      value={editingProduct?.name || ""} 
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)} 
                      placeholder="Ex: Smash Burger" 
                      className="w-full h-12 bg-white/[0.05] border border-white/5 rounded-lg py-3 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-white/50 ml-1 block">Categoria</label>
                    <div className="relative">
                      <select 
                        value={editingProduct?.categoria_id || ""}
                        onChange={(e) => setEditingProduct(prev => prev ? { ...prev, categoria_id: e.target.value } : null)}
                        className="w-full bg-white/[0.05] border border-white/5 rounded-lg h-12 px-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 appearance-none font-bold uppercase tracking-tighter cursor-pointer"
                        required
                      >
                        <option value="" disabled className="bg-[#1f2937]">Selecione uma categoria</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-[#1f2937]">{cat.name.toUpperCase()}</option>
                        ))}
                        {categories.length === 0 && <option value="" className="bg-[#1f2937]">SEM CATEGORIAS DISPONÍVEIS</option>}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Preço e Ordem */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-white/50 ml-1 block">Preço (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={editingProduct?.preco || ""} 
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, preco: parseFloat(e.target.value) || 0 } : null)} 
                      placeholder="Ex: 34.90" 
                      className="w-full h-12 bg-white/[0.05] border border-white/5 rounded-lg py-3 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-black text-primary" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-white/50 ml-1 block">Ordem</label>
                    <input 
                      type="number" 
                      value={editingProduct?.order_index || ""} 
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, order_index: parseInt(e.target.value) || 0 } : null)} 
                      placeholder="Ex: 1" 
                      className="w-full h-12 bg-white/[0.05] border border-white/5 rounded-lg py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-black text-center" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-white/50 ml-1 block">Descrição</label>
                <textarea 
                  value={editingProduct?.descricao || ""} 
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, descricao: e.target.value } : null)} 
                  placeholder="Descreva brevemente o produto..." 
                  className="w-full bg-white/[0.05] border border-white/5 rounded-lg p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium min-h-[100px] resize-none leading-relaxed" 
                  required 
                />
              </div>

              {/* Ingredientes Removíveis */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-white/50 ml-1 block">
                    Ingredientes (Para retirada)
                  </label>
                  <span className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-widest">
                    Enter para adicionar
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddIngredient();
                        }
                      }}
                      placeholder="Ex: Cebola, Picles, Tomate..."
                      className="w-full h-11 bg-white/[0.05] border border-white/5 rounded-lg pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddIngredient}
                    className="w-9 h-9 flex items-center justify-center bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 rounded-lg transition-all active:scale-90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Lista de Tags */}
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-black/20 border border-white/5 rounded-lg">
                  {editingProduct?.removable_ingredients && editingProduct.removable_ingredients.length > 0 ? (
                    editingProduct.removable_ingredients.map((ingredient, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 border border-primary/20 rounded-md group hover:bg-primary/20 transition-all animate-in zoom-in-90 duration-200"
                      >
                        <span className="text-[10px] font-black text-primary uppercase tracking-tight">{ingredient}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveIngredient(ingredient)}
                          className="text-primary/40 hover:text-primary transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="w-full flex items-center justify-center py-1">
                      <span className="text-[9px] text-white/10 font-black uppercase tracking-widest">Nenhum item para retirada</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-white/[0.03]">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all border border-white/5 active:scale-95 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_10px_20px_rgba(234,88,12,0.2)] active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  {editingProduct?.id ? "Salvar Produto" : "Criar Produto"}
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
              <div className="w-20 h-20 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
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
    </DashboardLayout>
  );
}
