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
  FolderOpen,
  Camera,
  Tag
} from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  nome: string;
  preco: number;
  grupo_id?: string;
}

interface AddonGroup {
  id: string | number;
  nome_grupo: string;
  tipo_escolha: "unica" | "multipla";
  qtd_minima: number;
  qtd_maxima: number;
  active: boolean;
  items?: AddonItem[];
}



export default function GruposAdicionaisPage() {
  const [groups, setGroups] = useState<AddonGroup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AddonGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());
  const [currentEstId, setCurrentEstId] = useState<string | null>(null);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Limite fixo: 6 grupos por página conforme solicitado
  
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  // Buscar ID do estabelecimento (Padronizado com Produtos)
  useEffect(() => {
    const getEst = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setCurrentEstId(session.user.id);
      } else {
        // Fallback para localStorage
        const userSaved = localStorage.getItem("movieats_user");
        if (userSaved) {
          try {
            const user = JSON.parse(userSaved);
            if (user.id) setCurrentEstId(user.id);
          } catch (e) {}
        }
      }
    };
    getEst();
  }, []);

  // Carregar dados do Supabase
  const fetchGroups = async () => {
    if (!currentEstId || !supabase) return;
    
    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from('bd_grupos_adicionais')
        .select('*')
        .eq('establishment_id', currentEstId)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      // Buscar complementos para cada grupo
      const groupsWithItems = await Promise.all((groupsData || []).map(async (group: any) => {
        const { data: itemsData } = await supabase
          .from('bd_complementos')
          .select('*')
          .eq('grupo_id', group.id)
          .order('name', { ascending: true });
        
        return {
          ...group,
          items: (itemsData || []).map((i: any) => ({
            ...i,
            nome: i.name // Mapeia name do banco para nome da interface
          }))
        };
      }));

      setGroups(groupsWithItems);
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
      Toast.fire({ icon: "error", title: "Erro ao carregar dados" });
    }
  };

  useEffect(() => {
    if (currentEstId) {
      fetchGroups();
    }
  }, [currentEstId]);

  const filteredGroups = groups.filter(g => 
    g.nome_grupo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cálculo de Paginação
  const totalItems = filteredGroups.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startIndex, startIndex + itemsPerPage);

  // Resetar página ao filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const openAddModal = () => {
    setEditingGroup({
      id: 0,
      nome_grupo: "",
      tipo_escolha: "multipla",
      qtd_minima: 0,
      qtd_maxima: 1,
      active: true,
      items: []
    });
    setNewItemName("");
    setNewItemPrice("");
    setIsModalOpen(true);
  };

  const openEditModal = (group: AddonGroup) => {
    setEditingGroup({ ...group, items: [...(group.items || [])] });
    setNewItemName("");
    setNewItemPrice("");
    setIsModalOpen(true);
  };

  const addItemToGroup = () => {
    if (!newItemName || !editingGroup) return;
    const price = parseFloat(newItemPrice) || 0;
    const item: AddonItem = {
      id: `temp-${Date.now()}`,
      nome: newItemName,
      preco: price
    };
    setEditingGroup({ ...editingGroup, items: [...(editingGroup.items || []), item] });
    setNewItemName("");
    setNewItemPrice("");
    Toast.fire({ icon: "success", title: "Item adicionado" });
  };

  const removeItemFromGroup = (itemId: string) => {
    if (!editingGroup) return;
    setEditingGroup({ ...editingGroup, items: (editingGroup.items || []).filter(i => i.id !== itemId) });
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Garantia de establishment_id antes de salvar
    let activeEstId = currentEstId;
    if (!activeEstId) {
      const { data: { session } } = await supabase.auth.getSession();
      activeEstId = session?.user?.id || null;
      
      if (!activeEstId) {
        const userSaved = localStorage.getItem("movieats_user");
        if (userSaved) {
          try {
            const user = JSON.parse(userSaved);
            activeEstId = user.id || null;
          } catch (e) {}
        }
      }
      
      if (activeEstId) setCurrentEstId(activeEstId);
    }

    if (!editingGroup || !activeEstId || !supabase) {
      if (!supabase) {
        Toast.fire({ icon: "error", title: "Erro de Configuração", text: "Cliente Supabase não inicializado." });
      } else if (!activeEstId) {
        Toast.fire({ icon: "error", title: "Sessão Inválida", text: "ID do estabelecimento não encontrado. Faça login novamente." });
      }
      return;
    }

    if (editingGroup.qtd_minima > editingGroup.qtd_maxima) {
      Toast.fire({ icon: "error", title: "Mínimo maior que o Máximo" });
      return;
    }

    setIsSaving(true);

    try {
      // Tipagem forçada conforme solicitado
      const groupData = {
        nome_grupo: String(editingGroup.nome_grupo),
        tipo_escolha: String(editingGroup.tipo_escolha),
        qtd_minima: Number(editingGroup.qtd_minima),
        qtd_maxima: Number(editingGroup.qtd_maxima),
        active: Boolean(editingGroup.active),
        establishment_id: activeEstId
      };

      let groupId = editingGroup.id;

      // Verificação de ID mais abrangente conforme solicitado
      if (!editingGroup.id || editingGroup.id === 0 || editingGroup.id === '0') {
        // Fluxo de Criação Sequencial
        const { data: newGroup, error: groupError } = await supabase
          .from('bd_grupos_adicionais')
          .insert([groupData])
          .select()
          .single();
        
        if (groupError) throw groupError;
        if (!newGroup) throw new Error("O banco não retornou o grupo criado após o insert.");
        
        groupId = newGroup.id;
      } else {
        // Fluxo de Atualização
        const { error: groupError } = await supabase
          .from('bd_grupos_adicionais')
          .update(groupData)
          .eq('id', editingGroup.id);
        
        if (groupError) throw groupError;
      }

      // Sincronizar itens (complementos)
      const { error: deleteError } = await supabase
        .from('bd_complementos')
        .delete()
        .eq('grupo_id', groupId);
        
      if (deleteError) throw deleteError;

      // Inserção dos itens vinculados ao groupId
      if (editingGroup.items && editingGroup.items.length > 0) {
        const itemsData = editingGroup.items.map(item => ({
          name: String(item.nome),
          preco: Number(item.preco),
          grupo_id: groupId,
          establishment_id: activeEstId,
          active: true
        }));

        const { error: itemsError } = await supabase
          .from('bd_complementos')
          .insert(itemsData);
        
        if (itemsError) throw itemsError;
      }

      Toast.fire({ icon: "success", title: "Grupo salvo com sucesso!" });
      setIsModalOpen(false);
      fetchGroups();
    } catch (error: any) {
      console.error('ERRO TÉCNICO:', error);
      Toast.fire({ 
        icon: "error", 
        title: "Erro ao salvar",
        text: error.message || "Erro desconhecido"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (group: AddonGroup) => {
    const result = await Swal.fire({
      title: "Remover Grupo?",
      text: `Deseja excluir "${group.nome_grupo}" e seus itens?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
      background: "#141414",
      color: "#fff",
      confirmButtonColor: "#ff4b4b",
      customClass: { popup: "rounded-xl border border-white/5" }
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('bd_grupos_adicionais')
          .delete()
          .eq('id', group.id);
        
        if (error) throw error;
        Toast.fire({ icon: "success", title: "Grupo removido com sucesso!" });
        fetchGroups();
      } catch (error: any) {
        Toast.fire({ 
          icon: "error", 
          title: "Erro ao excluir",
          text: error.message 
        });
      }
    }
  };

  const handleSelectOne = (id: any) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredGroups.length && filteredGroups.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredGroups.map(g => g.id)));
  };

  const handleExportChoice = () => {
    const groupsToExport = groups.filter(g => selectedIds.has(g.id));
    if (groupsToExport.length === 0) {
      Toast.fire({ icon: "warning", title: "Selecione grupo para exportar" });
      return;
    }

    Swal.fire({
      title: 'Exportar Grupos',
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
        handleExportPDF(groupsToExport);
      } else if (result.isDenied) {
        handleExportCSV(groupsToExport);
      }
    });
  };

  const handleExportPDF = (groupsToExport: AddonGroup[]) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Relatório de Grupos de Adicionais", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    const subtitle = searchQuery ? `Filtro: ${searchQuery}` : "Filtro: Todos os Grupos";
    doc.text(subtitle, 14, 30);

    const tableColumn = ["Nome do Grupo", "Quantidade de Itens", "Status"];
    const tableRows = groupsToExport.map(g => [
      g.nome_grupo,
      g.items ? g.items.length.toString() : "0",
      g.active ? 'Ativo' : 'Inativo'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [255, 107, 0], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`grupos_movieats_${new Date().getTime()}.pdf`);
    Toast.fire({ icon: "success", title: "PDF exportado com sucesso!" });
  };

  const handleExportCSV = (groupsToExport: AddonGroup[]) => {
    const csvContent = [
      ["ID", "Nome", "Tipo", "Mínimo", "Máximo", "Status", "Itens"],
      ...groupsToExport.map(g => [
        g.id, 
        g.nome_grupo, 
        g.tipo_escolha === 'unica' ? 'ÚNICA' : 'MÚLTIPLA', 
        g.qtd_minima, 
        g.qtd_maxima, 
        g.active ? 'ATIVO' : 'INATIVO',
        (g.items || []).map(i => `${i.nome} (R$ ${i.preco})`).join(" | ")
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `grupos_adicionais_${new Date().getTime()}.csv`;
    link.click();
    
    Toast.fire({ icon: "success", title: "Excel exportado com sucesso!" });
  };



  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-6 mb-2">
              <List className="text-white w-6 h-6" />
              <h2 className="text-3xl font-headline font-black text-white tracking-tight leading-none ml-2">
                Grupos de Adicionais
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-medium ml-1">
              Gerencie os grupos de complementos e adicionais dos seus produtos.
            </p>
          </div>

          <button 
            onClick={openAddModal}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-white hover:bg-orange-600 text-slate-900 hover:text-white rounded-lg font-bold text-[13px] transition-all shadow-lg shadow-black/20 active:scale-95 group cursor-pointer"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            Novo Grupo
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass border border-white/5 rounded-[8px] p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full max-w-xs group cursor-text">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-40 group-focus-within:opacity-100 transition-opacity" />
            <input 
              type="text" 
              placeholder="Buscar grupo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-3 pl-11 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-4 focus:ring-white/5 transition-all font-medium"
            />
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
                    <th className="px-6 py-5 w-10 text-center">
                      <input 
                        type="checkbox" 
                        checked={filteredGroups.length > 0 && selectedIds.size === filteredGroups.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 cursor-pointer accent-primary" 
                      />
                    </th>
                    <th className="px-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-[0.1em] uppercase">Grupo</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-[0.1em] uppercase">Tipo</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-[0.1em] uppercase">Adicionais</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-[0.1em] uppercase">Preço</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-[0.1em] text-center uppercase">Status</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-[#FFFFFF] tracking-[0.1em] text-right uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedGroups.map((group) => (
                    <tr 
                      key={group.id} 
                      className={`hover:bg-white/[0.02] transition-colors group ${selectedIds.has(group.id) ? 'bg-primary/5' : ''}`}
                    >
                      <td className="px-6 py-4 align-middle text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(group.id)}
                          onChange={() => handleSelectOne(group.id)}
                          className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 cursor-pointer accent-primary" 
                        />
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-col">
                          <span className="text-[15px] font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">
                            {group.nome_grupo}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">
                            #{group.id.toString().substring(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-medium text-white/50 uppercase tracking-widest">{group.tipo_escolha === 'unica' ? 'Seleção Única' : 'Múltipla Escolha'}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md self-start uppercase tracking-wider ${group.qtd_minima > 0 ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                            {group.qtd_minima > 0 ? 'Obrigatório' : 'Opcional'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        {group.items && group.items.length > 0 ? (
                          <div className="flex flex-col gap-1.5 py-1">
                            {group.items.map((item, idx) => (
                              <div key={item.id || idx} className="h-4 flex items-center whitespace-nowrap">
                                <span className="text-[11px] text-gray-400/70 font-medium uppercase tracking-tight">
                                  • {item.nome}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400/30 italic font-medium">Nenhum item</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-middle">
                        {group.items && group.items.length > 0 ? (
                          <div className="flex flex-col gap-1.5 py-1">
                            {group.items.map((item, idx) => (
                              <div key={item.id || idx} className="h-4 flex items-center whitespace-nowrap">
                                <span className="text-[11px] text-white font-medium">
                                  R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400/30 italic font-medium">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border ${group.active ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'}`}>
                          {group.active ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-5">
                          <button 
                            onClick={() => openEditModal(group)} 
                            className="text-muted-foreground hover:text-blue-400 transition-all duration-300 cursor-pointer"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(group)} 
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

          {/* Paginação Estrita - Fixa conforme padrão portal */}
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
              Exibindo <span className="text-white">{startIndex + 1}</span>-<span className="text-white">{Math.min(startIndex + itemsPerPage, totalItems)}</span> de <span className="text-white">{totalItems}</span> grupos
            </div>
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
          <div className="relative w-full max-w-4xl bg-[#111827] border border-white/5 rounded-[32px] shadow-2xl animate-in zoom-in-95 fade-in slide-in-from-bottom-10 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-8 py-6 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
              <div className="flex flex-col">
                <h3 className="text-base font-headline font-bold text-white uppercase tracking-tight leading-loose">
                  {editingGroup.id ? `Editar: ${editingGroup.nome_grupo}` : "Novo Grupo de Adicionais"}
                </h3>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Configuração de Complementos</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all cursor-pointer group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  
                  {/* Coluna Esquerda: Definições do Grupo */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-white/50 ml-1 block">Nome do Grupo</label>
                      <input 
                        type="text" 
                        value={editingGroup.nome_grupo}
                        onChange={(e) => setEditingGroup({ ...editingGroup, nome_grupo: e.target.value })}
                        placeholder="Ex: Adicionais de Burger"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl h-12 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-white/50 ml-1 block">Tipo de Escolha</label>
                      <div className="relative">
                        <select 
                          value={editingGroup.tipo_escolha}
                          onChange={(e) => setEditingGroup({ ...editingGroup, tipo_escolha: e.target.value as any, qtd_minima: e.target.value === 'unica' ? 1 : 0, qtd_maxima: e.target.value === 'unica' ? 1 : editingGroup.qtd_maxima })}
                          className="w-full bg-[#1f2937] border border-white/10 rounded-xl h-12 px-4 text-sm text-white appearance-none font-bold uppercase tracking-tighter cursor-pointer focus:outline-none focus:border-orange-500/50"
                        >
                          <option value="unica" className="bg-[#1f2937]">SELEÇÃO ÚNICA</option>
                          <option value="multipla" className="bg-[#1f2937]">MÚLTIPLA ESCOLHA</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-white/50 ml-1 block">Qtd Mínima</label>
                        <input 
                          type="number" 
                          value={editingGroup.qtd_minima}
                          disabled={editingGroup.tipo_escolha === 'unica'}
                          onChange={(e) => setEditingGroup({ ...editingGroup, qtd_minima: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white/[0.05] border border-white/10 rounded-xl h-12 px-4 text-sm text-white focus:outline-none disabled:opacity-30 font-black text-center"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-white/50 ml-1 block">Qtd Máxima</label>
                        <input 
                          type="number" 
                          value={editingGroup.qtd_maxima}
                          disabled={editingGroup.tipo_escolha === 'unica'}
                          onChange={(e) => setEditingGroup({ ...editingGroup, qtd_maxima: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white/[0.05] border border-white/10 rounded-xl h-12 px-4 text-sm text-white focus:outline-none disabled:opacity-30 font-black text-center"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between h-14 px-5 bg-white/[0.03] border border-white/10 rounded-2xl transition-all hover:bg-white/[0.05]">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white tracking-tight">Grupo Disponível</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase opacity-50">Habilita no Cardápio</span>
                      </div>
                      <div 
                        className="relative w-12 h-6.5 cursor-pointer"
                        onClick={() => setEditingGroup({ ...editingGroup, active: !editingGroup.active })}
                      >
                        <div className={`w-12 h-6.5 rounded-full transition-all duration-500 border border-white/10 ${editingGroup.active ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-white/10'}`} />
                        <div className={`absolute top-1 left-1 w-4.5 h-4.5 bg-white rounded-full transition-all duration-500 shadow-xl ${editingGroup.active ? 'translate-x-5.5' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>

                  {/* Coluna Direita: Itens do Grupo */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[13px] font-bold text-white/50 ml-1 block">Adicionar Itens (Adicionais)</label>
                        <span className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-widest">{editingGroup.items?.length || 0} cadastrados</span>
                      </div>
                      
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                           <input 
                            type="text" 
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="Nome (ex: Bacon)"
                            className="w-full bg-white/[0.05] border border-white/10 h-11 px-4 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                          />
                        </div>
                        <div className="w-28 space-y-2">
                           <input 
                            type="number" 
                            value={newItemPrice}
                            onChange={(e) => setNewItemPrice(e.target.value)}
                            placeholder="R$ 0,00"
                            className="w-full bg-white/[0.05] border border-white/10 h-11 px-4 rounded-xl text-sm text-orange-500 font-black focus:outline-none focus:border-orange-500/50 text-right"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={addItemToGroup}
                          className="w-11 h-11 flex items-center justify-center bg-orange-600/10 hover:bg-[#FF8C00] text-orange-500 hover:text-white border border-orange-600/20 rounded-xl transition-all duration-200 active:scale-90"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-2 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar min-h-[100px]">
                        {(!editingGroup.items || editingGroup.items.length === 0) ? (
                          <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-black/20">
                            <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Nenhum item adicionado</span>
                          </div>
                        ) : (
                          editingGroup.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-xl group hover:bg-white/[0.05] transition-all">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-white uppercase tracking-tight">{item.nome}</span>
                                <span className="text-[10px] font-black text-orange-500">+ R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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
                  ) : (editingGroup.id ? "Salvar Alterações" : "CRIAR GRUPO")}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}


    </DashboardLayout>
  );
}
