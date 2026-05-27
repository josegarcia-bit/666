/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  FileSpreadsheet, 
  TrendingUp, 
  Users, 
  RotateCw, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Share2, 
  Trash2, 
  HelpCircle,
  ExternalLink,
  Table
} from 'lucide-react';
import { TeacherEvaluation, Teacher, SubjectItem, EvaluationCriterion } from '../types';

interface DashboardProps {
  evaluations: TeacherEvaluation[];
  teachers: Teacher[];
  subjects: SubjectItem[];
  criteria: EvaluationCriterion[];
  appsScriptUrl: string;
  onSyncSingle: (id: string) => Promise<boolean>;
  onClearEvaluations: () => void;
}

export default function Dashboard({ 
  evaluations, 
  teachers, 
  subjects, 
  criteria, 
  appsScriptUrl, 
  onSyncSingle,
  onClearEvaluations 
}: DashboardProps) {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'kpi' | 'sheet-live'>('kpi');

  // Math metrics
  const totalEvals = evaluations.length;
  const syncedEvals = evaluations.filter(e => e.synced).length;
  const pendingEvals = totalEvals - syncedEvals;

  const getGlobalAverage = () => {
    if (totalEvals === 0) return 0;
    let grandSum = 0;
    let grandCount = 0;
    evaluations.forEach(ev => {
      ev.responses.forEach(r => {
        grandSum += r.score;
        grandCount++;
      });
    });
    return grandCount > 0 ? Number((grandSum / grandCount).toFixed(1)) : 0;
  };

  const getCategoryAverages = () => {
    const categoryMap: Record<string, { sum: number; count: number }> = {};
    evaluations.forEach(ev => {
      ev.responses.forEach(r => {
        const crit = criteria.find(c => c.id === r.criterionId);
        if (crit) {
          if (!categoryMap[crit.category]) {
            categoryMap[crit.category] = { sum: 0, count: 0 };
          }
          categoryMap[crit.category].sum += r.score;
          categoryMap[crit.category].count += 1;
        }
      });
    });

    return Object.entries(categoryMap).map(([category, info]) => ({
      category,
      avg: Number((info.sum / info.count).toFixed(2))
    }));
  };

  const getTeacherRankings = () => {
    const teacherMap: Record<string, { sum: number; count: number; name: string; dept: string }> = {};
    evaluations.forEach(ev => {
      const avgScore = ev.responses.reduce((sum, r) => sum + r.score, 0) / ev.responses.length;
      if (!teacherMap[ev.teacherId]) {
        teacherMap[ev.teacherId] = { sum: 0, count: 0, name: ev.teacherName, dept: '' };
        const original = teachers.find(t => t.id === ev.teacherId);
        if (original) {
          teacherMap[ev.teacherId].dept = original.department;
        }
      }
      teacherMap[ev.teacherId].sum += avgScore;
      teacherMap[ev.teacherId].count += 1;
    });

    return Object.entries(teacherMap).map(([id, info]) => ({
      id,
      name: info.name,
      dept: info.dept,
      avg: Number((info.sum / info.count).toFixed(1)),
      count: info.count
    })).sort((a, b) => b.avg - a.avg);
  };

  const handleSyncClick = async (id: string) => {
    setSyncingId(id);
    await onSyncSingle(id);
    setSyncingId(null);
  };

  const getOverallProgressColor = (avg: number) => {
    if (avg >= 4.5) return 'bg-emerald-500';
    if (avg >= 3.8) return 'bg-blue-500';
    if (avg >= 3.0) return 'bg-indigo-500';
    if (avg >= 2.0) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const categoryAverages = getCategoryAverages();
  const teacherRankings = getTeacherRankings();

  // Exportar CSV
  const exportToCSV = () => {
    if (evaluations.length === 0) return;
    
    // Header
    const headers = ["ID", "Fecha", "Ciclo", "Docente", "Asignatura", "Evaluador", "Rol", "Comentarios", "Fortalezas", "Mejoras"];
    const qHeaders = criteria.map(c => c.question.replace(/,/g, ' '));
    const allHeaders = [...headers, ...qHeaders, "Promedio"].join(",");

    // Rows
    const rows = evaluations.map(ev => {
      const baseInfo = [
        ev.id,
        new Date(ev.date).toLocaleDateString(),
        ev.period,
        `"${ev.teacherName.replace(/"/g, '""')}"`,
        `"${ev.subjectName.replace(/"/g, '""')}"`,
        `"${ev.evaluatorName.replace(/"/g, '""')}"`,
        ev.evaluatorRole,
        `"${(ev.generalComments || '').replace(/"/g, '""')}"`,
        `"${(ev.strengths || '').replace(/"/g, '""')}"`,
        `"${(ev.areasToImprove || '').replace(/"/g, '""')}"`
      ];

      const responsesMap = new Map(ev.responses.map(r => [r.criterionId, r.score]));
      const qScores = criteria.map(c => responsesMap.get(c.id) || 0);
      const avg = qScores.reduce((a, b) => a + b, 0) / qScores.length;

      return [...baseInfo, ...qScores, avg.toFixed(1)].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [allHeaders, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Evaluaciones_Docentes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Resumen Superior */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl border border-zinc-200/85 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider font-mono">Evaluaciones</span>
            <h3 className="text-3xl font-black font-mono text-zinc-900 tracking-tight mt-1">{totalEvals}</h3>
            <span className="text-[10px] text-zinc-500 font-medium">Registros totales en memoria</span>
          </div>
          <div className="bg-indigo-50 text-indigo-655 p-2.5 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl border border-zinc-200/85 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider font-mono">Promedio Global</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <h3 className="text-3xl font-black font-mono text-zinc-900 tracking-tight">{getGlobalAverage()}</h3>
              <span className="text-xs text-zinc-450 font-bold">/ 5.0</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">Nivel de desempeño escolar</span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl border border-zinc-200/85 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider font-mono">Sincronizado</span>
            <h3 className="text-3xl font-black font-mono text-zinc-900 tracking-tight mt-1">
              {syncedEvals} <span className="text-xs text-zinc-400 font-medium font-sans">de {totalEvals}</span>
            </h3>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Guardado en Sheets</span>
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl border border-zinc-200/85 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider font-mono">Pendientes</span>
            <h3 className="text-3xl font-black font-mono text-zinc-900 tracking-tight mt-1">{pendingEvals}</h3>
            {pendingEvals > 0 ? (
              <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 font-mono">
                <AlertCircle className="w-3 h-3" />
                <span>Requiere envío manual</span>
              </span>
            ) : (
              <span className="text-[10px] text-zinc-500 font-medium">Todo al corriente</span>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${pendingEvals > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-zinc-50 text-zinc-450'}`}>
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {totalEvals === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-zinc-200 p-12 text-center max-w-lg mx-auto">
          <FileSpreadsheet className="w-12 h-12 text-zinc-350 mx-auto mb-4" />
          <h3 className="text-base font-bold text-zinc-800 font-display">No hay evaluaciones registradas</h3>
          <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Completa tu primera evaluación para previsualizar los gráficos de rendimiento escolar, promedio por categoría y la hoja de cálculo interactiva.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs: KPI Analytics vs Google Sheet Simulator */}
          <div className="flex border-b border-zinc-200">
            <button
              onClick={() => setActiveTab('kpi')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition-all cursor-pointer font-display ${
                activeTab === 'kpi' 
                  ? 'border-indigo-600 text-indigo-700 font-extrabold' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              Métricas y Rendimiento
            </button>
            <button
              onClick={() => setActiveTab('sheet-live')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition-all flex items-center gap-1.5 cursor-pointer font-display ${
                activeTab === 'sheet-live' 
                  ? 'border-emerald-600 text-emerald-700 font-extrabold' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              <Table className="w-4 h-4 text-emerald-600" />
              <span>Vista Hoja de Cálculo (Live)</span>
            </button>
          </div>

          {activeTab === 'kpi' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Desempeño por Categorías */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-1 font-display">Puntos Críticos por Categoría</h4>
                <p className="text-[11px] text-zinc-500 mb-5 leading-relaxed">Promedio obtenido de cada una de las 4 directrices institucionales.</p>

                <div className="space-y-4 font-sans">
                  {categoryAverages.map(cat => (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-700 font-semibold">{cat.category}</span>
                        <span className="font-extrabold text-zinc-900 font-mono">{cat.avg} / 5.0</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getOverallProgressColor(cat.avg)} transition-all`}
                          style={{ width: `${(cat.avg / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ranking de Docentes */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-1 font-display">Desempeño Docente Registrado</h4>
                <p className="text-[11px] text-zinc-500 mb-5 leading-relaxed">Listado ordenado por promedio global de evaluaciones.</p>

                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 font-sans">
                  {teacherRankings.map((tr, index) => (
                    <div key={tr.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-150/60 hover:bg-zinc-100/40 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="bg-white border border-zinc-200 text-center font-bold text-zinc-700 w-6 h-6 rounded-lg text-xs flex items-center justify-center shrink-0 font-mono">
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-zinc-800 leading-snug">{tr.name}</h5>
                          <span className="text-[10px] text-zinc-450 block">{tr.dept}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-zinc-500 bg-white border border-zinc-200 px-1.5 py-0.5 rounded-md font-mono">
                          {tr.count} evals
                        </span>
                        <span className="text-xs font-black font-mono text-indigo-650">{tr.avg} / 5.0</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Simulador Live de Google Sheets */
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden font-sans">
              {/* Header estilo Google Sheets */}
              <div className="bg-emerald-800 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-950">
                <div className="flex items-center gap-2">
                  <div className="bg-white text-emerald-800 p-1.5 rounded shadow-sm">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-100 block leading-tight font-mono">GOOGLE SHEET: Evaluaciones</span>
                    <h4 className="text-sm font-bold leading-tight font-display">Base de Calificaciones ({syncedEvals} filas insertadas)</h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-emerald-100 bg-emerald-900/60 px-2.5 py-1 rounded font-bold border border-emerald-750">
                    {appsScriptUrl.includes('SIMULATOR') 
                      ? 'Simulador de Hoja Local' 
                      : 'Producción: Apps Script Direct'
                    }
                  </span>
                </div>
              </div>

              {/* Botones de acción Sheets */}
              <div className="bg-zinc-50 px-4 py-2 flex items-center justify-between border-b border-zinc-200 overflow-x-auto gap-2">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                  <span className="font-bold text-indigo-600">APPS SCRIPT LINK:</span>
                  <span className="truncate max-w-[200px] md:max-w-[320px] bg-white border border-zinc-200 px-2 py-0.5 rounded text-[10px] text-zinc-650">
                    {appsScriptUrl || 'Sin configurar'}
                  </span>
                </div>
                {appsScriptUrl.includes('script.google.com') && !appsScriptUrl.includes('SIMULATOR') && (
                  <a 
                    href={appsScriptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-850 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 transition-colors"
                  >
                    <span>Ver Script</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Tabla de Hoja de Cálculo */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-zinc-100 text-zinc-650 font-bold border-b border-zinc-200/90 font-mono">
                      <th className="p-2 border-r border-zinc-200 w-10 text-center">#</th>
                      <th className="p-2.5 border-r border-zinc-200 min-w-[120px]">Timestamp / Ciclo</th>
                      <th className="p-2.5 border-r border-zinc-200 min-w-[160px]">Docente</th>
                      <th className="p-2.5 border-r border-zinc-200 min-w-[150px]">Asignatura</th>
                      <th className="p-2.5 border-r border-zinc-200 min-w-[100px]">Evaluador / Rol</th>
                      <th className="p-2.5 border-r border-zinc-200 min-w-[110px]">Promedio General</th>
                      <th className="p-2.5 border-r border-zinc-200 min-w-[200px]">Buzón & Comentarios</th>
                      <th className="p-2.5 min-w-[120px] text-center">Estado Sheets</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
                    {evaluations.map((ev, idx) => (
                      <tr key={ev.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/40'} hover:bg-emerald-55/10 transition-all`}>
                        <td className="p-2 border-r border-zinc-200 text-zinc-400 text-center font-bold bg-zinc-50/50">{idx + 1}</td>
                        <td className="p-2.5 border-r border-zinc-200 text-zinc-600">
                          <div>{new Date(ev.date).toLocaleDateString()}</div>
                          <div className="text-[9px] text-zinc-450 font-sans font-bold uppercase">{ev.period}</div>
                        </td>
                        <td className="p-2.5 border-r border-zinc-200 font-sans font-semibold text-zinc-800">{ev.teacherName}</td>
                        <td className="p-2.5 border-r border-zinc-200 font-sans text-zinc-600">{ev.subjectName}</td>
                        <td className="p-2.5 border-r border-zinc-200 text-zinc-500 font-sans">
                          <div>{ev.evaluatorName}</div>
                          <div className="text-[9px] font-bold text-zinc-400 uppercase">{ev.evaluatorRole}</div>
                        </td>
                        <td className="p-2.5 border-r border-zinc-200 text-indigo-650 font-bold text-center bg-indigo-50/15">
                          {(ev.responses.reduce((sum, r) => sum + r.score, 0) / ev.responses.length).toFixed(1)} / 5.0
                        </td>
                        <td className="p-2.5 border-r border-zinc-200 font-sans text-zinc-500 text-[11px] leading-snug">
                          {ev.strengths && <div><strong>Fortalezas:</strong> {ev.strengths}</div>}
                          {ev.areasToImprove && <div className="mt-0.5"><strong>Mejorar:</strong> {ev.areasToImprove}</div>}
                          {ev.generalComments && <div className="mt-0.5 text-zinc-400 italic">"{ev.generalComments}"</div>}
                          {!ev.strengths && !ev.areasToImprove && !ev.generalComments && <span className="text-zinc-350 italic">Sin comentarios cualitativos</span>}
                        </td>
                        <td className="p-2.5 text-center font-sans">
                          {ev.synced ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>INSERTED</span>
                            </span>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="inline-flex items-center gap-1.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 px-0.5 rounded-full font-bold font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                <span>PENDING</span>
                              </span>
                              <button
                                onClick={() => handleSyncClick(ev.id)}
                                disabled={syncingId === ev.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded text-[10px] font-semibold transition-all shadow-sm cursor-pointer"
                              >
                                {syncingId === ev.id ? (
                                  <RotateCw className="w-2.5 h-2.5 animate-spin" />
                                ) : (
                                  <span>Insertar Fila</span>
                                )}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Historial y Acciones Globals */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-display">Acciones de Almacenamiento</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-normal">Descarga tus datos consolidados o vacía la memoria local de la aplicación.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto font-sans">
              <button
                onClick={exportToCSV}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl hover:shadow-md transition-all cursor-pointer font-display"
              >
                <Share2 className="w-4 h-4 text-zinc-200" />
                <span>Exportar Hoja a CSV</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que deseas borrar todas las evaluaciones registradas en este navegador? Se eliminarán los borradores locales.')) {
                    onClearEvaluations();
                  }
                }}
                className="w-auto p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-650 rounded-xl transition-all cursor-pointer"
                title="Limpiar base de datos local"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
