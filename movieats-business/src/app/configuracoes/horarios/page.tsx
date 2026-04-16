"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Clock, 
  Save, 
  Calendar,
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import Swal from "sweetalert2";

interface DaySchedule {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
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

const initialSchedule: DaySchedule[] = [
  { day: "Segunda", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Terça", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Quarta", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Quinta", isOpen: true, openTime: "18:00", closeTime: "23:00" },
  { day: "Sexta", isOpen: true, openTime: "18:00", closeTime: "00:00" },
  { day: "Sábado", isOpen: true, openTime: "18:00", closeTime: "00:00" },
  { day: "Domingo", isOpen: true, openTime: "18:00", closeTime: "23:00" },
];

export default function HorariosPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);

  useEffect(() => {
    const saved = localStorage.getItem("movieats_schedule");
    if (saved) {
      setSchedule(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("movieats_schedule", JSON.stringify(schedule));
    Toast.fire({
      icon: "success",
      title: "Horários salvos com sucesso!",
      iconColor: "#ea580c"
    });
  };

  const updateSchedule = (index: number, field: keyof DaySchedule, value: any) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto min-h-full pb-20">
        
        {/* Header Sticky */}
        <div className="sticky -top-8 z-50 py-8 bg-slate-50 dark:bg-background border-b border-border -mx-8 px-8 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-orange-600/10 rounded-md shadow-sm">
                  <Clock className="text-orange-600 w-5 h-5" />
                </div>
                <h2 className="text-2xl font-headline font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                  Horários de Atendimento
                </h2>
              </div>
              <p className="text-slate-500 dark:text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Operação & Disponibilidade</p>
            </div>
            <button 
              onClick={handleSave}
              className="group flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 cursor-pointer outline-none active:scale-95"
            >
              <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Salvar Programação
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          
          <div className="bg-white dark:bg-card border border-border rounded-md overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border bg-slate-50 dark:bg-muted/30 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-[10px] font-black text-slate-950 dark:text-foreground uppercase tracking-widest">Programação Semanal</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-slate-50 dark:bg-muted/20">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.25em]">Dia da Semana</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.25em] text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.25em]">Abertura</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.25em]">Fechamento</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item, index) => (
                    <tr key={item.day} className="border-b border-border group hover:bg-slate-50 dark:hover:bg-muted/10 transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.day}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button 
                          onClick={() => updateSchedule(index, "isOpen", !item.isOpen)}
                          className={`inline-flex items-center gap-2 transition-all group outline-none ${item.isOpen ? 'text-emerald-500' : 'text-red-500 opacity-50'}`}
                        >
                          {item.isOpen ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                          <span className="text-[10px] font-black uppercase tracking-widest min-w-[50px]">{item.isOpen ? 'Aberto' : 'Fechado'}</span>
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <input 
                          type="time" 
                          disabled={!item.isOpen}
                          value={item.openTime}
                          onChange={(e) => updateSchedule(index, "openTime", e.target.value)}
                          className={`bg-slate-50 dark:bg-muted border border-border rounded-md px-4 py-2 text-sm font-bold text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all ${!item.isOpen && 'opacity-20'}`}
                        />
                      </td>
                      <td className="px-8 py-6">
                        <input 
                          type="time" 
                          disabled={!item.isOpen}
                          value={item.closeTime}
                          onChange={(e) => updateSchedule(index, "closeTime", e.target.value)}
                          className={`bg-slate-50 dark:bg-muted border border-border rounded-md px-4 py-2 text-sm font-bold text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all ${!item.isOpen && 'opacity-20'}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-orange-600/5 border border-orange-600/10 rounded-md p-6 flex items-start gap-4">
             <div className="p-2 bg-orange-600/10 rounded-md">
                <AlertCircle className="w-5 h-5 text-orange-600" />
             </div>
             <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Avisos importantes</h4>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground/60 font-bold uppercase leading-relaxed max-w-2xl">
                  Os horários configurados aqui controlam automaticamente a visibilidade da sua loja no aplicativo. 
                  Certifique-se de manter a programação atualizada para evitar cancelamentos.
                </p>
             </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
