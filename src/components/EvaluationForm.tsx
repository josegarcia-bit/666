/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  User, 
  GraduationCap, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Send, 
  MessageSquare, 
  Star, 
  CalendarClock,
  Sparkles,
  Save
} from 'lucide-react';
import { Teacher, SubjectItem, EvaluationCriterion, EvaluationResponse, TeacherEvaluation } from '../types';

interface EvaluationFormProps {
  teachers: Teacher[];
  subjects: SubjectItem[];
  criteria: EvaluationCriterion[];
  appsScriptUrl: string;
  onSaveEvaluation: (evaluation: TeacherEvaluation) => Promise<{ success: boolean; error?: string }>;
}

export default function EvaluationForm({ 
  teachers, 
  subjects, 
  criteria, 
  appsScriptUrl, 
  onSaveEvaluation 
}: EvaluationFormProps) {
  const [step, setStep] = useState(1);
  
  // Form State
  const [evaluatorRole, setEvaluatorRole] = useState<'student' | 'peer' | 'director'>('student');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('2026-I');
  
  // Responses state (defaulting to 5 for rapid premium testing)
  const [responses, setResponses] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    criteria.forEach(c => {
      initial[c.id] = 5;
    });
    return initial;
  });

  const [generalComments, setGeneralComments] = useState('');
  const [strengths, setStrengths] = useState('');
  const [areasToImprove, setAreasToImprove] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const activeTeacher = teachers.find(t => t.id === selectedTeacherId);
  const activeSubject = subjects.find(s => s.id === selectedSubjectId);

  const getScoreDescription = (score: number) => {
    switch (score) {
      case 1: return { text: 'Deficiente / Insuficiente', color: 'text-rose-500 bg-rose-50' };
      case 2: return { text: 'Regular / Aceptable con reservas', color: 'text-amber-500 bg-amber-50' };
      case 3: return { text: 'Bueno / Cumple satisfactoriamente', color: 'text-indigo-500 bg-indigo-50' };
      case 4: return { text: 'Muy Bueno / Destaca en su labor', color: 'text-blue-500 bg-blue-50' };
      case 5: return { text: 'Excelente / Sobresaliente', color: 'text-emerald-500 bg-emerald-50' };
      default: return { text: '', color: '' };
    }
  };

  const handleScoreChange = (criterionId: string, score: number) => {
    setResponses(prev => ({
      ...prev,
      [criterionId]: score
    }));
  };

  const calculateFormProgress = () => {
    if (step === 1) return 10;
    if (step === 2) return 55;
    if (step === 3) return 85;
    return 100;
  };

  const isStep1Valid = () => {
    return selectedTeacherId !== '' && selectedSubjectId !== '';
  };

  const currentOverallAverage = () => {
    const scores = Object.values(responses) as number[];
    if (!scores.length) return 0;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Number((sum / scores.length).toFixed(1));
  };

  const resetForm = () => {
    setSelectedTeacherId('');
    setSelectedSubjectId('');
    setGeneralComments('');
    setStrengths('');
    setAreasToImprove('');
    setStep(1);
    setSubmitResult(null);
    const initial: Record<string, number> = {};
    criteria.forEach(c => {
      initial[c.id] = 5;
    });
    setResponses(initial);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid()) return;
    
    setSubmitting(true);
    
    const evaluationResponses: EvaluationResponse[] = Object.entries(responses).map(([cId, score]) => ({
      criterionId: cId,
      score: score as number
    }));

    const finalEvaluation: TeacherEvaluation = {
      id: 'eval_' + Math.random().toString(36).substr(2, 9),
      teacherId: selectedTeacherId,
      teacherName: activeTeacher?.name || 'Docente de Prueba',
      subjectId: selectedSubjectId,
      subjectName: activeSubject?.name || 'Asignatura de Prueba',
      evaluatorName: isAnonymous ? 'Anónimo' : evaluatorName || 'Evaluador',
      evaluatorRole,
      period: selectedPeriod,
      date: new Date().toISOString(),
      responses: evaluationResponses,
      generalComments,
      strengths,
      areasToImprove,
      synced: false
    };

    const res = await onSaveEvaluation(finalEvaluation);
    setSubmitting(false);

    if (res.success) {
      setSubmitResult({
        success: true,
        message: appsScriptUrl.includes('SIMULATOR') 
          ? '¡Éxito! La evaluación ha sido registrada de forma impecable y sincronizada con el Simulador de Google Sheets local.'
          : '¡Éxito! Tu evaluación docente ha sido registrada de forma impecable y sincronizada con tu Google Sheet vía Apps Script.'
      });
      setStep(4);
    } else {
      setSubmitResult({
        success: false,
        message: `La evaluación se guardó de forma local como borrador pendiente debido al siguiente obstáculo de red: ${res.error}. Podrás re-intentar enviarla en cualquier momento desde el Panel de Registros.`
      });
      setStep(4);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progreso del Cuestionario */}
      <div className="mb-6 bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
            <ClipboardList className="w-4 h-4 text-indigo-650" />
            <span>Paso {step === 4 ? 4 : step} de 3</span>
          </span>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/50 font-display">
            {step === 1 && 'Selección de Docente y Contexto'}
            {step === 2 && 'Cuestionario de Aptitudes (10 Preguntas)'}
            {step === 3 && 'Comentarios y Áreas de Mejora'}
            {step === 4 && 'Completado con Éxito'}
          </span>
        </div>
        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${calculateFormProgress()}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 shadow-sm animate-fade-in"
          >
            <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2 mb-1 font-display">
              <User className="text-indigo-600 w-5 h-5" />
              <span>Contexto de la Evaluación</span>
            </h2>
            <p className="text-xs text-zinc-500 mb-6">
              Por favor, selecciona al docente, la materia correspondiente y define las credenciales del evaluador de forma transparente.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); if(isStep1Valid()) setStep(2); }} className="space-y-6 font-sans">
              {/* Rol y Nombre Evaluador */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 font-display">
                    Tipo de Evaluador
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['student', 'peer', 'director'] as const).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setEvaluatorRole(role)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1.5 justify-center cursor-pointer ${
                          evaluatorRole === role
                            ? 'bg-indigo-50 border-indigo-250 text-indigo-700 font-bold'
                            : 'bg-white border-zinc-200/60 text-zinc-650 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="capitalize">
                          {role === 'student' ? 'Estudiante' : role === 'peer' ? 'Colega / Par' : 'Director'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider font-display">
                      Identificación del Evaluador
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className="text-xs text-indigo-600 hover:underline font-bold transition-all cursor-pointer"
                    >
                      {isAnonymous ? 'Hacer Nominativo' : 'Permanecer Anónimo'}
                    </button>
                  </div>
                  {isAnonymous ? (
                    <div className="bg-zinc-50 border border-dashed border-zinc-200 text-zinc-500 px-4 py-3 rounded-xl text-xs flex items-center gap-2 h-[42px] font-mono">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Evaluación Anónima Activa. El nombre no se guardará.</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={evaluatorName}
                      onChange={(e) => setEvaluatorName(e.target.value)}
                      placeholder="Escribe tu nombre y apellido"
                      required
                      className="w-full text-xs border border-zinc-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-zinc-750 placeholder-zinc-400 bg-white"
                    />
                  )}
                </div>
              </div>

              {/* Selección de Docente y Ciclo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1 font-display">
                    <GraduationCap className="w-3.5 h-3.5 text-zinc-450" />
                    <span>Docente a Evaluar</span>
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    required
                    className="w-full text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="">-- Seleccionar Docente --</option>
                    {teachers.filter(t => t.status === 'active').map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1 font-display">
                    <CalendarClock className="w-3.5 h-3.5 text-zinc-450" />
                    <span>Ciclo / Periodo Académico</span>
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="2026-I">Semestre 2026-I (Activo)</option>
                    <option value="2026-II">Semestre 2026-II</option>
                    <option value="2025-II">Semestre Anterior (2025-II)</option>
                    <option value="2026-Modular">Módulo Intensivo 2026</option>
                  </select>
                </div>
              </div>

              {/* Asignatura */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1 font-display">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-450" />
                  <span>Materia o Asignatura</span>
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  required
                  className="w-full text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="">-- Seleccionar Asignatura --</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Navegación */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={!isStep1Valid()}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-xs shadow-md transition-all ${
                    isStep1Valid() 
                      ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 hover:shadow-lg cursor-pointer' 
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  <span>Siguiente: Cuestionario</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Header del Docente Seleccionado */}
            <div className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider font-mono">Evaluando a:</span>
                <h3 className="text-lg font-bold leading-tight font-display text-zinc-100">{activeTeacher?.name}</h3>
                <p className="text-xs text-zinc-300 mt-1">{activeSubject?.name}</p>
              </div>
              <div className="text-right bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                <span className="block text-[9px] uppercase font-bold text-zinc-300 font-mono">Promedio Parcial</span>
                <span className="text-xl font-extrabold font-mono tracking-tight text-white">{currentOverallAverage()}</span>
              </div>
            </div>

            {/* Lista de Criterios de Evaluación */}
            <div className="space-y-4">
              {criteria.map((criterion, index) => {
                const score = responses[criterion.id] || 5;
                const desc = getScoreDescription(score);

                return (
                  <div 
                    key={criterion.id}
                    className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:border-zinc-300 transition-all font-sans"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className="bg-indigo-50 text-indigo-600 rounded-lg p-1.5 text-xs font-extrabold w-7 h-7 flex items-center justify-center shrink-0 font-mono">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-bold text-indigo-650 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded font-mono">
                            {criterion.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-zinc-900 text-sm leading-snug font-display">{criterion.question}</h4>
                        <p className="text-xs text-zinc-500 leading-normal">{criterion.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Opciones de puntuación 1-5 */}
                      <div className="flex items-center gap-1.5 sm:gap-2.5 w-full sm:w-auto overflow-x-auto py-1">
                        {[1, 2, 3, 4, 5].map(scoreOption => {
                          const isActive = score === scoreOption;
                          let btnClass = "bg-zinc-50 hover:bg-zinc-100/80 text-zinc-500 border-zinc-200/85";
                          if (isActive) {
                            if (scoreOption === 1) btnClass = "bg-rose-500 text-white border-rose-500 shadow-md font-bold";
                            else if (scoreOption === 2) btnClass = "bg-amber-500 text-white border-amber-500 shadow-md font-bold";
                            else if (scoreOption === 3) btnClass = "bg-indigo-500 text-white border-indigo-500 shadow-md font-bold";
                            else if (scoreOption === 4) btnClass = "bg-blue-500 text-white border-blue-500 shadow-md font-bold";
                            else if (scoreOption === 5) btnClass = "bg-emerald-505 text-white border-emerald-505 shadow-md font-bold";
                          }

                          return (
                            <button
                              key={scoreOption}
                              type="button"
                              onClick={() => handleScoreChange(criterion.id, scoreOption)}
                              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full text-xs font-bold border flex flex-col items-center justify-center transition-all cursor-pointer ${btnClass}`}
                            >
                              <span className="text-xs sm:text-sm">{scoreOption}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Descripción Puntuación */}
                      <div className={`px-4 py-1.5 rounded-xl text-xs font-bold tracking-tight ${desc.color} border border-current/10 shrink-0 text-center sm:text-left`}>
                        {desc.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navegación del Cuestionario */}
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-zinc-200 shadow-sm font-sans">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-800 bg-zinc-50 hover:bg-zinc-100 transition-all font-bold text-xs border border-zinc-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 font-bold text-xs shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Siguiente: Retroalimentación</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2 mb-1 font-display">
              <MessageSquare className="text-indigo-600 w-5 h-5" />
              <span>Retroalimentación Cualitativa</span>
            </h2>
            <p className="text-xs text-zinc-500 mb-6 font-sans">
              Tus comentarios constructivos son sumamente valiosos. Ayuda al docente a conocer qué está haciendo bien y qué puede perfeccionar.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 font-sans">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1 font-display">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Principales Fortalezas del Docente</span>
                </label>
                <textarea
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Por ejemplo: Explica de forma clara, siempre comparte ejemplos del mundo profesional, muestra empatía con el grupo..."
                  rows={3}
                  className="w-full text-xs border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-zinc-750 placeholder-zinc-450 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1 font-display">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Áreas de Oportunidad o Mejora</span>
                </label>
                <textarea
                  value={areasToImprove}
                  onChange={(e) => setAreasToImprove(e.target.value)}
                  placeholder="Por ejemplo: Devolver calificaciones a tiempo, diversificar las dinámicas del aula para que no sea solo teoría, fomentar más la participación pacífica..."
                  rows={3}
                  className="w-full text-xs border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-zinc-750 placeholder-zinc-450 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 font-display">
                  Comentarios Adicionales o Sugerencias
                </label>
                <textarea
                  value={generalComments}
                  onChange={(e) => setGeneralComments(e.target.value)}
                  placeholder="Escribe otros detalles de utilidad sobre el curso, recursos de apoyo, ritmo de avance, etc."
                  rows={3}
                  className="w-full text-xs border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-zinc-750 placeholder-zinc-450 bg-white"
                />
              </div>

              {/* Caja de Promedio */}
              <div className="bg-zinc-55 rounded-2xl p-5 border border-zinc-200 flex items-center justify-between shadow-inner">
                <div>
                  <h4 className="text-sm font-bold text-zinc-800 font-display">Resumen Diagnóstico</h4>
                  <p className="text-xs text-zinc-500 mt-1">Calificación promedio otorgada en base a las 10 directrices.</p>
                </div>
                <div className="bg-white rounded-xl py-2 px-4 shadow-sm text-center border border-zinc-200/80">
                  <span className="text-2xl font-black font-mono text-indigo-600 block">{currentOverallAverage()}</span>
                  <span className="text-[9px] uppercase font-bold text-zinc-455 tracking-wider font-mono">Puntuación</span>
                </div>
              </div>

              {/* Botones de Navegación */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-800 bg-zinc-50 hover:bg-zinc-100 transition-all font-bold text-xs border border-zinc-200 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Transmitiendo...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Finalizar y Guardar Evaluación</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 4 && submitResult && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-zinc-200 p-8 text-center shadow-lg max-w-lg mx-auto"
          >
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner ${
              submitResult.success ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
            }`}>
              {submitResult.success ? <Check className="w-8 h-8" /> : <Save className="w-8 h-8" />}
            </div>

            <h2 className="text-xl font-bold text-zinc-900 tracking-tight font-display">
              {submitResult.success ? '¡Evaluación Procesada!' : 'Evaluación Pendiente de Sincronizar'}
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed mt-2.5 px-2">
              {submitResult.message}
            </p>

            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl my-6 text-left max-w-sm mx-auto space-y-1 font-sans">
              <div className="text-xs flex justify-between">
                <span className="text-zinc-455">Docente:</span>
                <span className="font-bold text-zinc-850">{activeTeacher?.name}</span>
              </div>
              <div className="text-xs flex justify-between">
                <span className="text-zinc-455">Materia:</span>
                <span className="font-bold text-zinc-850 truncate max-w-[200px]">{activeSubject?.name}</span>
              </div>
              <div className="text-xs flex justify-between">
                <span className="text-zinc-455">Calificación del Curso:</span>
                <span className="font-extrabold text-indigo-600 font-mono text-xs">{currentOverallAverage()} / 5.0</span>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-950 text-white text-xs font-bold rounded-xl hover:shadow shadow-sm transition-all cursor-pointer font-sans"
            >
              Iniciar Nueva Evaluación
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
