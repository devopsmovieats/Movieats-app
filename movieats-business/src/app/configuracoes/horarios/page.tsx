"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Clock, 
  AlertCircle,
  Loader2
} from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";

interface DaySchedule {
  dia_semana: string;
  esta_fechado: boolean;
  hora_abertura: string;
  hora_fechamento: string;
}

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "#0f172a",
  color: "#fff",
  customClass: {
    popup: "rounded-md border border-slate-700"
  }
});

const daysOfWeek = [
  "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"
];

export default function HorariosPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("bd_horarios_funcionamento")
        .select("*")
        .filter("id", "like", `${user.id}%`);

      if (error) throw error;

      if (data && data.length > 0) {
        // Ordenar para garantir a ordem dos dias
        const sorted = daysOfWeek.map(day => {
          const found = data.find((d: any) => d.dia_semana === day);
          return found || { dia_semana: day, esta_fechado: true, hora_abertura: "", hora_fechamento: "" };
        });
        setSchedule(sorted);
      } else {
        // Inicializar se não houver dados
        setSchedule(daysOfWeek.map(day => ({
          dia_semana: day,
          esta_fechado: true,
          hora_abertura: "",
          hora_fechamento: ""
        })));
      }
    } catch (err) {
      console.error("Erro ao carregar horários:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const upsertData = schedule.map(item => ({
        id: `${user.id}_${item.dia_semana}`,
        dia_semana: item.dia_semana,
        esta_fechado: item.esta_fechado,
        hora_abertura: item.hora_abertura,
        hora_fechamento: item.hora_fechamento
      }));

      const { error } = await supabase
        .from("bd_horarios_funcionamento")
        .upsert(upsertData, { onConflict: "id" });

      if (error) throw error;

      Toast.fire({
        icon: "success",
        title: "Horários salvos com sucesso!",
        iconColor: "#ea580c"
      });
    } catch (err) {
      console.error("Erro ao salvar horários:", err);
      Toast.fire({ icon: "error", title: "Erro ao salvar no banco." });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSchedule = (index: number, field: keyof DaySchedule, value: any) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-900 -m-8 p-10 animate-in fade-in duration-500">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Clock className="text-orange-600 w-5 h-5" />
              <h1 className="text-xl font-bold text-white tracking-tight uppercase">Horários de Funcionamento</h1>
            </div>
            
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-white hover:bg-orange-600 text-black hover:text-white rounded-md font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer border-none"
            >
              {isSaving ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
            </button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-700">
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dia da Semana</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Abertura</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fechamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {schedule.map((item, index) => (
                    <tr key={item.dia_semana} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-white uppercase tracking-tight">{item.dia_semana}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={!item.esta_fechado}
                            onChange={() => updateSchedule(index, "esta_fechado", !item.esta_fechado)}
                          />
                          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                          <span className="ms-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest min-w-[50px]">
                            {item.esta_fechado ? 'Fechado' : 'Aberto'}
                          </span>
                        </label>
                      </td>
                      <td className="px-8 py-6">
                        <input 
                          type="time" 
                          disabled={item.esta_fechado}
                          value={item.hora_abertura}
                          onChange={(e) => updateSchedule(index, "hora_abertura", e.target.value)}
                          className={`bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-sm text-gray-400 focus:outline-none focus:border-orange-600 transition-all ${item.esta_fechado && 'opacity-20'}`}
                        />
                      </td>
                      <td className="px-8 py-6">
                        <input 
                          type="time" 
                          disabled={item.esta_fechado}
                          value={item.hora_fechamento}
                          onChange={(e) => updateSchedule(index, "hora_fechamento", e.target.value)}
                          className={`bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-sm text-gray-400 focus:outline-none focus:border-orange-600 transition-all ${item.esta_fechado && 'opacity-20'}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-orange-600/10 border border-orange-600/20 rounded-xl p-6 flex items-start gap-4">
             <div className="p-3 bg-orange-600/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-1">Avisos importantes</h4>
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-2xl">
                  Os horários definidos aqui serão exibidos no seu catálogo e influenciarão o status de Loja Aberta/Fechada.
                </p>
             </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
