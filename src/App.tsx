/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  BarChart3, 
  Settings as SettingsIcon, 
  BookOpen, 
  FileSpreadsheet, 
  GraduationCap, 
  HelpCircle, 
  ShieldAlert, 
  Sparkles,
  Link2,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { DEFAULT_TEACHERS, DEFAULT_SUBJECTS, DEFAULT_CRITERIA } from './data/defaultData';
import { Teacher, SubjectItem, TeacherEvaluation } from './types';

// Components
import EvaluationForm from './components/EvaluationForm';
import Dashboard from './components/Dashboard';
import AppsScriptGuide from './components/AppsScriptGuide';
import Settings from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'dashboard' | 'guide' | 'settings'>('form');

  // Load state from local storage or defaults
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('docente_teachers');
    return saved ? JSON.parse(saved) : DEFAULT_TEACHERS;
  });

  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    const saved = localStorage.getItem('docente_subjects');
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });

  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    const saved = localStorage.getItem('docente_apps_script_url');
    // Defaulting to simulator URL so they have fully working mock experience instantly
    return saved || 'https://script.google.com/macros/s/AKfycbz_SIMULATOR_DOCENTE_PRO/exec';
  });

  // Dynamic evaluation history
  const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>(() => {
    const saved = localStorage.getItem('docente_evaluations');
    if (saved) return JSON.parse(saved);
    
    // Inject 3 high quality initial evaluations to populate analytics immediately
    const mockEvaluations: TeacherEvaluation[] = [
      {
        id: 'eval_mock_1',
        teacherId: 't1',
        teacherName: 'Dra. María Elena Fuentes',
        subjectId: 's1',
        subjectName: 'Programación Orientada a Objetos',
        evaluatorName: 'Anónimo',
        evaluatorRole: 'student',
        period: '2026-I',
        date: new Date(Date.now() - 48 * 3600000).toISOString(),
        responses: DEFAULT_CRITERIA.map((c, i) => ({
          criterionId: c.id,
          // Mix of 4s and 5s
          score: i % 2 === 0 ? 5 : 4
        })),
        generalComments: 'Excelente profesora, sus laboratorios prácticos facilitan mucho el aprendizaje.',
        strengths: 'Estructura impecable y gran paciencia para explicar cada línea de código.',
        areasToImprove: 'Subir el material al repositorio con mayor antelación.',
        synced: true
      },
      {
        id: 'eval_mock_2',
        teacherId: 't2',
        teacherName: 'Dr. Alejandro Silva Treviño',
        subjectId: 's3',
        subjectName: 'Microeconomía Intermedia',
        evaluatorName: 'Mtro. Héctor Ortega',
        evaluatorRole: 'peer',
        period: '2026-I',
        date: new Date(Date.now() - 24 * 3600000).toISOString(),
        responses: DEFAULT_CRITERIA.map((c, i) => ({
          criterionId: c.id,
          score: i % 3 === 0 ? 5 : 4
        })),
        generalComments: 'El Dr. Alejandro aplica dinámicas de debate muy ricas y fomenta la lectura crítica de artículos especializados.',
        strengths: 'Profundo dominio del mercado financiero e ingenio didáctico.',
        areasToImprove: 'Podría ajustar los tiempos de los exámenes que son un poco extensos.',
        synced: true
      },
      {
        id: 'eval_mock_3',
        teacherId: 't3',
        teacherName: 'Mtra. Laura Sofía Ortega',
        subjectId: 's4',
        subjectName: 'Psicología Cognitiva',
        evaluatorName: 'Anónimo',
        evaluatorRole: 'student',
        period: '2026-I',
        date: new Date(Date.now() - 12 * 3600000).toISOString(),
        responses: DEFAULT_CRITERIA.map((c) => ({
          criterionId: c.id,
          // Solid evaluation
          score: 5
        })),
        generalComments: 'La mejor clase del semestre. Dinámica, empática y profundamente enriquecedora.',
        strengths: 'Clima de confianza espectacular, responde correos al instante brindando apoyo académico.',
        areasToImprove: 'Ninguna, es perfecta.',
        synced: true
      }
    ];
    return mockEvaluations;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('docente_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('docente_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('docente_apps_script_url', appsScriptUrl);
  }, [appsScriptUrl]);

  useEffect(() => {
    localStorage.setItem('docente_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  // Handle setting updates
  const handleUpdateUrl = (url: string) => {
    setAppsScriptUrl(url);
  };

  const handleInsertDemoUrl = () => {
    setAppsScriptUrl('https://script.google.com/macros/s/AKfycbz_SIMULATOR_DOCENTE_PRO/exec');
    setActiveTab('settings');
  };

  const handleAddTeacher = (newTeacher: Teacher) => {
    setTeachers(prev => [...prev, newTeacher]);
  };

  const handleRemoveTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const handleAddSubject = (newSubject: SubjectItem) => {
    setSubjects(prev => [...prev, newSubject]);
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const handleClearEvaluations = () => {
    setEvaluations([]);
  };

  // Ping Testing Connection
  const handleTestConnection = async (): Promise<boolean> => {
    if (!appsScriptUrl || appsScriptUrl.includes('SIMULATOR')) {
      return true;
    }
    try {
      const response = await fetch(appsScriptUrl, { method: 'GET', mode: 'cors' });
      const data = await response.json();
      return data && data.status === 'success';
    } catch (e) {
      console.error('Connection test failure:', e);
      return false;
    }
  };

  // Save assessment & attempt transmission to sheet
  const handleSaveEvaluation = async (evaluation: TeacherEvaluation): Promise<{ success: boolean; error?: string }> => {
    let synced = false;
    let syncError: string | undefined;

    if (appsScriptUrl && !appsScriptUrl.includes('SIMULATOR')) {
      try {
        // Prepare criteria formatting for Apps Script (converting from nested array to simple payloads if needed)
        const payload = {
          id: evaluation.id,
          period: evaluation.period,
          teacherName: evaluation.teacherName,
          subjectName: evaluation.subjectName,
          evaluatorRole: evaluation.evaluatorRole,
          evaluatorName: evaluation.evaluatorName,
          generalComments: evaluation.generalComments,
          strengths: evaluation.strengths,
          areasToImprove: evaluation.areasToImprove,
          responses: evaluation.responses
        };

        // Note: Google Apps Script Web Apps often trigger CORS preflight redirect issues with Content-Type json,
        // so posting as 'text/plain' body avoids CORS blocks and doPost reads it cleanly as payload string.
        const response = await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data && data.status === 'success') {
          synced = true;
        } else {
          syncError = data.message || 'Código de respuesta de script no exitoso';
        }
      } catch (err: any) {
        console.error('Apps Script Sync Error:', err);
        syncError = err.message || 'Error de red / CORS bloqueado';
      }
    } else if (appsScriptUrl.includes('SIMULATOR')) {
      // Simulator mimics network transmission lag
      await new Promise(resolve => setTimeout(resolve, 850));
      synced = true;
    }

    const finalEval: TeacherEvaluation = {
      ...evaluation,
      synced,
      syncError
    };

    setEvaluations(prev => [finalEval, ...prev]);

    return { 
      success: synced, 
      error: syncError 
    };
  };

  // Retry sync of a single local-only draft
  const handleSyncSingleDraft = async (id: string): Promise<boolean> => {
    const target = evaluations.find(e => e.id === id);
    if (!target) return false;

    if (appsScriptUrl && !appsScriptUrl.includes('SIMULATOR')) {
      try {
        const payload = {
          id: target.id,
          period: target.period,
          teacherName: target.teacherName,
          subjectName: target.subjectName,
          evaluatorRole: target.evaluatorRole,
          evaluatorName: target.evaluatorName,
          generalComments: target.generalComments,
          strengths: target.strengths,
          areasToImprove: target.areasToImprove,
          responses: target.responses
        };

        const response = await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data && data.status === 'success') {
          setEvaluations(prev => prev.map(e => e.id === id ? { ...e, synced: true, syncError: undefined } : e));
          return true;
        }
      } catch (err) {
        console.error('Draft Sync single failure:', err);
      }
    } else if (appsScriptUrl.includes('SIMULATOR')) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setEvaluations(prev => prev.map(e => e.id === id ? { ...e, synced: true, syncError: undefined } : e));
      return true;
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-800 antialiased selection:bg-indigo-100 selection:text-indigo-900 pb-12">
      {/* Barra de estado superior: Alerta de configuracion */}
      <div className="bg-zinc-900 text-white text-xs px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-zinc-300 font-mono text-[11px]">
            {appsScriptUrl.includes('SIMULATOR') 
              ? 'STATUS: Conectado al Simulador Local de Google Sheets' 
              : `STATUS: Conectado a Apps Script Real (${appsScriptUrl.substring(0, 48)}...)`
            }
          </span>
        </div>
        <div className="flex items-center gap-3">
          {appsScriptUrl.includes('SIMULATOR') ? (
            <button
              onClick={() => setActiveTab('guide')}
              className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline transition-colors text-[11px]"
            >
              Conectar Google Sheet Real →
            </button>
          ) : (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Sincronización Activa</span>
            </span>
          )}
        </div>
      </div>

      {/* Header Principal */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-zinc-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-100">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-zinc-950 font-display">
                  EvaluaDocente <span className="text-indigo-600 font-black underline underline-offset-4 decoration-2">PRO</span>
                </h1>
                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-650 px-2 py-0.5 rounded border border-zinc-200/60 uppercase font-mono">v1.2</span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">Control de Calidad Académica y Sincronización en Directo</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-zinc-100/80 p-1 rounded-xl w-full md:w-auto overflow-x-auto border border-zinc-200/50">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all ${
                activeTab === 'form'
                  ? 'bg-white text-zinc-950 shadow-sm font-bold border border-zinc-200/60'
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/30'
              }`}
            >
              Nueva Evaluación
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-zinc-950 shadow-sm font-bold border border-zinc-200/60'
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/30'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Consola & Reportes</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-white text-zinc-950 shadow-sm font-bold border border-zinc-200/60'
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/30'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instalar Sheet</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-white text-zinc-950 shadow-sm font-bold border border-zinc-200/60'
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/30'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5 text-zinc-500" />
              <span>Ajustes</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        {activeTab === 'form' && (
          <EvaluationForm 
            teachers={teachers}
            subjects={subjects}
            criteria={DEFAULT_CRITERIA}
            appsScriptUrl={appsScriptUrl}
            onSaveEvaluation={handleSaveEvaluation}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard 
            evaluations={evaluations}
            teachers={teachers}
            subjects={subjects}
            criteria={DEFAULT_CRITERIA}
            appsScriptUrl={appsScriptUrl}
            onSyncSingle={handleSyncSingleDraft}
            onClearEvaluations={handleClearEvaluations}
          />
        )}

        {activeTab === 'guide' && (
          <AppsScriptGuide 
            onInsertDemoUrl={handleInsertDemoUrl}
            currentUrl={appsScriptUrl}
          />
        )}

        {activeTab === 'settings' && (
          <Settings 
            teachers={teachers}
            subjects={subjects}
            appsScriptUrl={appsScriptUrl}
            onUpdateUrl={handleUpdateUrl}
            onAddTeacher={handleAddTeacher}
            onRemoveTeacher={handleRemoveTeacher}
            onAddSubject={handleAddSubject}
            onRemoveSubject={handleRemoveSubject}
            onTestConnection={handleTestConnection}
          />
        )}
      </main>
    </div>
  );
}
