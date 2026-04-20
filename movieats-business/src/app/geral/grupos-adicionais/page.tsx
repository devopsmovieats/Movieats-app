"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  ChevronRight,
  Search,
  List,
  CheckCircle2,
  XCircle,
  Download,
  ChevronDown,
  Upload,
  Loader2,
  PlusCircle,
  MinusCircle,
  DollarSign,
  FolderOpen
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
  },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  }
});

interface AddonItem {
  id: string;
  name: string;
  price: number;
}

interface AddonGroup {
  id: number;
  name: string;
  type: "unica" | "multipla";
  minChoices: number;
  maxChoices: number;
  status: "ativo" | "inativo";
  items: AddonItem[];
}

const initialGroups: AddonGroup[] = [
  {
    id: 1,
    name: "Adicionais de Burger",
    type: "multipla",
    minChoices: 0,
    maxChoices: 5,
    status: "ativo",
    items: [
      { id: "1-1", name: "Bacon Crocante", price: 4.50 },
      { id: "1-2", name: "Queijo Cheddar", price: 3.00 },
      { id: "1-3", name: "Ovo Frito", price: 2.50 }
    ]
  },
  {
    id: 2,
    name: "Tamanho da Bebida",
    type: "unica",
    minChoices: 1,
    maxChoices: 1,
    status: "ativo",
    items: [
      { id: "2-1", name: "Pequeno (300ml)", price: 0 },
      { id: "2-2", name: "Médio (500ml)", price: 2.00 },
      { id: "2-3", name: "Grande (700ml)", price: 4.50 }
    ]
  }
];

export default function GruposAdicionaisPage() {
  const [groups, setGroups] = useState<AddonGroup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AddonGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState("");
  
  // States para novos itens dentro do modal
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const importFileRef = useRef<HTMLInputElement>(null);

  // Carregar dados
  useEffect(() => {
    const saved = localStorage.getItem('movieats_addons_groups');
    if (saved) {
      try {
        setGroups(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar grupos", e);
        setGroups(initialGroups);
      }
    } else {
      setGroups(initialGroups);
      localStorage.setItem('movieats_addons_groups', JSON.stringify(initialGroups));
    }
  }, []);

  // Salvar dados
  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem('movieats_addons_groups', JSON.stringify(groups));
    }
  }, [groups]);

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingGroup({
      id: 0,
      name: "",
      type: "multipla",
      minChoices: 0,
      maxChoices: 1,
      status: "ativo",
      items: []
    });
    setNewItemName("");
    setNewItemPrice("");
    setIsModalOpen(true);
  };

  const openEditModal = (group: AddonGroup) => {
    setEditingGroup({ ...group, items: [...group.items] });
    setNewItemName("");
    setNewItemPrice("");
    setIsModalOpen(true);
  };

  const addItemToGroup = () => {
    if (!newItemName) return;
    const price = parseFloat(newItemPrice) || 0;
    const item: AddonItem = {
      id: `item-${Date.now()}`,
      name: newItemName,
      price: price
    };
    setEditingGroup(prev => prev ? { ...prev, items: [...prev.items, item] } : null);
    setNewItemName("");
    setNewItemPrice("");
    Toast.fire({
      icon: "success",
      title: "Item adicionado ao grupo"
    });
  };

  const removeItemFromGroup = (itemId: string) => {
    setEditingGroup(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== itemId) } : null);
    Toast.fire({
      icon: "success",
      title: "Item removido"
    });
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    if (editingGroup.minChoices > editingGroup.maxChoices) {
      Toast.fire({
        icon: "error",
        title: "O Mínimo não pode ser maior que o Máximo"
      });
      return;
    }

    if (editingGroup.id === 0) {
      const newGroup = { ...editingGroup, id: Date.now() };
      setGroups(prev => [...prev, newGroup]);
      Toast.fire({ icon: "success", title: "Grupo criado com sucesso" });
    } else {
      setGroups(prev => prev.map(g => g.id === editingGroup.id ? editingGroup : g));
      Toast.fire({ icon: "success", title: "Alterações salvas com sucesso" });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (group: AddonGroup) => {
    Swal.fire({
      title: "Remover Grupo?",
      text: `Deseja excluir "${group.name}"?`,
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
        title: "text-base font-black uppercase tracking-tight",
        icon: "scale-75 mb-0"
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setGroups(prev => prev.filter(g => g.id !== group.id));
        Toast.fire({ icon: "success", title: "Grupo excluído" });
      }
    });
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredGroups.length && filteredGroups.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredGroups.map(g => g.id)));
  };

  const handleExport = () => {
    const groupsToExport = groups.filter(g => selectedIds.has(g.id));
    
    if (groupsToExport.length === 0) {
      Toast.fire({ icon: "info", title: "Selecione grupos para exportar" });
      return;
    }
    
    const csvContent = [
      ["ID", "Nome", "Tipo", "Mínimo", "Máximo", "Status", "Total de Itens"],
      ...groupsToExport.map(g => [g.id, g.name, g.type, g.minChoices, g.maxChoices, g.status, g.items.length])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `adicionais_movieats_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Toast.fire({
      icon: "success",
      title: `${groupsToExport.length} grupos exportados com sucesso!`
    });
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportStatus("Iniciando...");

    const phrases = ["Lendo CSV...", "Validando regras...", "Sincronizando...", "Otimizando...", "Concluído!"];
    let currentPhraseIndex = 0;
    
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const phraseInterval = setInterval(() => {
      if (currentPhraseIndex < phrases.length - 1) {
        currentPhraseIndex++;
        setImportStatus(phrases[currentPhraseIndex]);
      } else {
        clearInterval(phraseInterval);
      }
    }, 600);
    
    setTimeout(() => {
      const newItems: AddonGroup[] = [
        { 
          id: Date.now(), 
          name: "Molhos Especiais", 
          type: "multipla", 
          minChoices: 0, 
          maxChoices: 3, 
          status: "ativo", 
          items: [{ id: "m1", name: "Barbecue", price: 2.00 }, { id: "m2", name: "Maionese Verde", price: 2.00 }] 
        }
      ];

      setGroups(prev => [...prev, ...newItems]);
      setIsImporting(false);
      if (importFileRef.current) importFileRef.current.value = "";

      Swal.fire({
        title: "Sucesso!",
        text: "Grupos importados com sucesso!",
        icon: "success",
        background: "#1a1a1a",
        color: "#fff",
        confirmButtonColor: "#ff6b00"
      });
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <List className="text-primary w-5 h-5" />
              </div>
              <h2 className="text-2xl font-headline font-black text-white tracking-tight uppercase leading-none">
                Grupos de Adicionais
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              Configure complementos e opções para seus produtos.
            </p>
          </div>

          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-[8px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 group cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
            + Novo Grupo
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass border border-white/5 rounded-[8px] p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full max-w-xs group cursor-text">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar grupo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-3 pl-11 pr-4 text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-all font-medium"
            />
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <input type="file" ref={importFileRef} onChange={handleFileImport} accept=".csv, .xlsx" className="hidden" />
            <button 
              onClick={handleImportClick}
              className="flex items-center gap-2 px-5 py-3 glass border-white/10 hover:border-primary/30 hover:bg-white/5 rounded-lg text-[10px] font-black text-white hover:text-primary uppercase tracking-[0.15em] transition-all cursor-pointer group active:scale-95"
            >
              <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              Importar
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-3 glass border-white/10 hover:border-primary/30 hover:bg-primary/5 rounded-lg text-[10px] font-black text-white hover:text-primary uppercase tracking-[0.15em] transition-all cursor-pointer group active:scale-95"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              {selectedIds.size > 0 ? `Exportar (${selectedIds.size})` : "Exportar"}
            </button>
          </div>

          <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block" />

          <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Grupos: <span className="text-white ml-1">{groups.length}</span>
          </div>
        </div>

        {/* Groups Table or Empty State */}
        {filteredGroups.length > 0 ? (
          <div className="glass border border-white/5 rounded-[8px] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-6 py-5 w-10">
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={filteredGroups.length > 0 && selectedIds.size === filteredGroups.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 cursor-pointer accent-primary" 
                        />
                      </div>
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Nome do Grupo</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tipo</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Itens</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredGroups.map((group) => (
                    <tr key={group.id} className={`hover:bg-white/[0.02] transition-colors group ${selectedIds.has(group.id) ? 'bg-primary/5' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(group.id)}
                            onChange={() => handleSelectOne(group.id)}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary cursor-pointer accent-primary" 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white group-hover:text-primary transition-colors tracking-tight uppercase">
                            {group.name}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-50 mt-0.5">ID: #{group.id.toString().padStart(4, '0')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${group.type === 'unica' ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]'}`} />
                          <span className="text-[10px] font-black text-white uppercase tracking-wider">{group.type === 'unica' ? 'Seleção Única' : 'Múltipla Escolha'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[32px] h-7 bg-white/5 border border-white/10 rounded-lg text-[11px] font-black text-white/60">
                          {group.items.length}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                            group.status === "ativo" 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                              : "bg-red-500/10 border-red-500/20 text-red-500"
                          }`}>
                            {group.status === "ativo" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span className="text-[9px] font-black uppercase tracking-widest">{group.status}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(group)}
                            className="p-2.5 rounded-lg bg-white/5 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-white/5 hover:border-primary/20 transition-all cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(group)}
                            className="p-2.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 border border-white/5 hover:border-red-500/20 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ESTADO VAZIO LIMPO E CENTRALIZADO */
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#1f2937]/50 border border-white/5 rounded-2xl animate-in fade-in zoom-in duration-700 shadow-2xl py-20 px-4 text-center">
            <FolderOpen size={80} className="text-white opacity-10 mb-8" />
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">Sua vitrine de adicionais está vazia</h2>
            <p className="text-muted-foreground text-sm font-medium max-w-sm">
              Clique no botão acima para adicionar seu primeiro adicional e organizar seu cardápio.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Cadastro Avançado */}
      {isModalOpen && editingGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-[#1f2937] border border-white/5 rounded-[8px] shadow-2xl animate-in zoom-in-95 fade-in slide-in-from-bottom-10 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <List className="text-primary w-4 h-4" />
                </div>
                <h3 className="text-[12px] font-headline font-black text-white uppercase tracking-tight">
                  {editingGroup.id ? `Editar: ${editingGroup.name}` : "Novo Grupo de Adicionais"}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <form onSubmit={handleSaveGroup} className="space-y-6">
                
                {/* Configurações do Grupo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/50 ml-1 block">Nome do Grupo</label>
                    <input 
                      type="text" 
                      value={editingGroup.name}
                      onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                      placeholder="Ex: Adicionais de Burger"
                      className="w-full bg-white/[0.05] border border-white/5 rounded-lg h-12 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/50 ml-1 block">Tipo de Escolha</label>
                    <div className="relative">
                      <select 
                        value={editingGroup.type}
                        onChange={(e) => setEditingGroup({ ...editingGroup, type: e.target.value as any, minChoices: e.target.value === 'unica' ? 1 : 0, maxChoices: e.target.value === 'unica' ? 1 : editingGroup.maxChoices })}
                        className="w-full bg-white/[0.05] border border-white/5 rounded-lg h-12 px-4 text-sm text-white appearance-none font-bold uppercase tracking-tighter cursor-pointer"
                      >
                        <option value="unica">SELEÇÃO ÚNICA</option>
                        <option value="multipla">MÚLTIPLA ESCOLHA</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/50 ml-1 block">Mínimo</label>
                    <input 
                      type="number" 
                      value={editingGroup.minChoices}
                      disabled={editingGroup.type === 'unica'}
                      onChange={(e) => setEditingGroup({ ...editingGroup, minChoices: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/[0.05] border border-white/5 rounded-lg h-12 px-4 text-sm text-white focus:outline-none disabled:opacity-30 font-black text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/50 ml-1 block">Máximo</label>
                    <input 
                      type="number" 
                      value={editingGroup.maxChoices}
                      disabled={editingGroup.type === 'unica'}
                      onChange={(e) => setEditingGroup({ ...editingGroup, maxChoices: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/[0.05] border border-white/5 rounded-lg h-12 px-4 text-sm text-white focus:outline-none disabled:opacity-30 font-black text-center"
                    />
                  </div>
                </div>

                {/* Switch de Status do Grupo */}
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">Status do Grupo</span>
                    <span className="text-[9px] text-white/40 font-medium uppercase italic">Habilita/Desabilita todas as opções</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={editingGroup.status === "ativo"} 
                      onChange={() => setEditingGroup({ ...editingGroup, status: editingGroup.status === "ativo" ? "inativo" : "ativo" })}
                    />
                    <div className="w-10 h-5.5 bg-white/5 border border-white/10 rounded-full peer peer-checked:bg-emerald-500/20 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:bg-emerald-500" />
                  </label>
                </div>

                {/* Sub-Gerenciamento de Itens */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.2em]">Adicionais do Grupo</h4>
                    <span className="text-[9px] font-bold text-white/40 uppercase">{editingGroup.items.length} itens cadastrados</span>
                  </div>

                  {/* Input de Novo Item */}
                  <div className="flex gap-2 items-end bg-white/[0.01] p-3 rounded-xl border border-dashed border-white/10 group hover:border-orange-500/30 transition-all">
                    <div className="flex-1 space-y-2">
                       <input 
                        type="text" 
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Nome do adicional (ex: Bacon extra)"
                        className="w-full bg-transparent border-b border-white/10 h-10 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
                      />
                    </div>
                    <div className="w-24 space-y-2">
                       <input 
                        type="number" 
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        placeholder="Preço R$"
                        className="w-full bg-transparent border-b border-white/10 h-10 text-sm text-orange-500 font-black focus:outline-none focus:border-orange-500/50 text-right"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={addItemToGroup}
                      className="p-2.5 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white rounded-lg transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Lista de Itens */}
                  <div className="space-y-2 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
                    {editingGroup.items.length === 0 ? (
                      <div className="py-8 text-center border border-white/5 rounded-lg bg-black/20">
                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic font-medium">Nenhum item adicionado</span>
                      </div>
                    ) : (
                      editingGroup.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-lg group hover:bg-white/[0.05] transition-all">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white uppercase tracking-tight">{item.name}</span>
                            <span className="text-[10px] font-bold text-orange-500">+ R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeItemFromGroup(item.id)}
                            className="p-2 text-white/20 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Footer Fixado */}
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl border border-white/5 transition-all cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 h-12 bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-95"
                  >
                    {editingGroup.id ? "Salvar Grupo" : "Criar Grupo"}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>

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
