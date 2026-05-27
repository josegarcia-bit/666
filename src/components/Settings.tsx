/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Check, 
  Github, 
  AlertCircle, 
  CheckCircle, 
  Save, 
  Link2,
  ListFilter,
  RefreshCw,
  FolderSync
} from 'lucide-react';
import { Teacher, SubjectItem, AppsScriptConfig } from '../types';

interface SettingsProps {
  teachers: Teacher[];
  subjects: SubjectItem[];
  appsScriptUrl: string;
  onUpdateUrl: (url: string) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onRemoveTeacher: (id: string) => void;
  onAddSubject: (subject: SubjectItem) => void;
  onRemoveSubject: (id: string) => void;
  onTestConnection: () => Promise<boolean>;
}

export default function Settings({
  teachers,
  subjects,
  appsScriptUrl,
  onUpdateUrl,
  onAddTeacher,
  onRemoveTeacher,
  onAddSubject,
  onRemoveSubject,
  onTestConnection
}: SettingsProps) {
  const [internalUrl, setInternalUrl] = useState(appsScriptUrl);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed' | 'simulator'>(() => {
    if (appsScriptUrl.includes('SIMULATOR')) return 'simulator';
    return 'idle';
  });

  // Adding Teachers form state
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherDept, setNewTeacherDept] = useState('Ingeniería y Ciencias');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');

  // Adding Subjects form state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUrl(internalUrl);
    if (internalUrl.includes('SIMULATOR')) {
      setConnectionStatus('simulator');
    } else {
      setConnectionStatus('idle');
    }
  };

  const verifyConnection = async () => {
    if (internalUrl.includes('SIMULATOR')) {
      setConnectionStatus('simulator');
      return;
    }
    
    setTestingConnection(true);
    setConnectionStatus('idle');
    const works = await onTestConnection();
    setTestingConnection(false);
    if (works) {
      setConnectionStatus('success');
    } else {
      setConnectionStatus('failed');
    }
  };

  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) return;
    onAddTeacher({
      id: 'teacher_' + Date.now(),
      name: newTeacherName,
      department: newTeacherDept,
      email: newTeacherEmail || 'sn@universidad.edu',
      status: 'active'
    });
    setNewTeacherName('');
    setNewTeacherEmail('');
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !newSubjectCode.trim()) return;
    onAddSubject({
      id: 'subject_' + Date.now(),
      name: newSubjectName,
      code: newSubjectCode.toUpperCase()
    });
    setNewSubjectName('');
    setNewSubjectCode('');
  };

  return (
    <div className="space-y-8">
      {/* SECCIÓN 1: CONFIGURACIÓN GOOGLE APPS SCRIPT */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2 mb-2">
          <Link2 className="text-indigo-600 w-5 h-5" />
          <span>Configuración de Enlace Técnico</span>
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Define la ubicación del endpoint desplegado de Apps Script. Es el cordón umbilical que sincroniza el cuestionario web con tu hoja de cálculo Google Sheets de manera segura y sin intermediarios.
        </p>

        <form onSubmit={handleSaveUrl} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Dirección de la Aplicación Web (GAS URL)
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="url"
                value={internalUrl}
                onChange={(e) => setInternalUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                required
                className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-slate-600 bg-slate-50/50"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold hover:shadow-md transition-all whitespace-nowrap cursor-pointer shrink-0"
                >
                  Establecer URL
                </button>
                <button
                  type="button"
                  onClick={verifyConnection}
                  disabled={testingConnection || !internalUrl}
                  className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
                >
                  {testingConnection ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Probar Conexión</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Estado Alerta de Conexión */}
        <div className="mt-4">
          {connectionStatus === 'simulator' && (
            <div className="bg-emerald-50 text-emerald-700 rounded-xl p-4 border border-emerald-150 text-xs flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-605 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Simulador Interactivo Habilitado:</strong> Todas las encuestas completadas se insertarán en una base de datos local temporal de Google Sheet que puedes visualizar de forma impecable en la pestaña 'Vista Hoja de Cálculo (Live)' del panel principal.
              </div>
            </div>
          )}

          {connectionStatus === 'success' && (
            <div className="bg-emerald-50 text-emerald-700 rounded-xl p-4 border border-emerald-150 text-xs flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">¡Conexión Excelente!</strong> Tu Apps Script ha respondido de manera óptima al ping inicial. El canal para consolidar evaluaciones docentes está listo para operar.
              </div>
            </div>
          )}

          {connectionStatus === 'failed' && (
            <div className="bg-rose-50 text-rose-750 rounded-xl p-4 border border-rose-150 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-550 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Error de Accesibilidad:</strong> No pudimos recibir una respuesta exitosa de la URL proveída. Te aconsejamos verificar que hiciste clic en "Nueva implementación", estableciste la visibilidad para "Cualquier persona" (Anyone) y otorgaste los debidos consentimientos.
              </div>
            </div>
          )}

          {connectionStatus === 'idle' && !internalUrl && (
            <div className="bg-blue-50 text-blue-700 rounded-xl p-4 border border-blue-150 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                No has configurado ningún enlace Apps Script. Por favor, lee las instrucciones de la sección anterior para crear tu archivo receptor en Google Sheets o inserta el Simulador Local haciendo clic sobre el botón correspondiente.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: DIRECTRICES DE GITHUB PAGES (PREPARADO PARA ALOJAR) */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
            <Github className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Despliegue GitHub Pages</span>
            <h3 className="text-base font-bold tracking-tight">Preparado para Alojamiento Estático</h3>
          </div>
        </div>
        <p className="text-slate-450 text-xs leading-relaxed mb-6">
          Esta aplicación web ha sido configurada como un desarrollo estático SPA ("Single Page Application"). Esto significa que todo se procesa en el navegador del usuario y se conecta externamente por HTTPS. ¡No requieres de un servidor Node.js de fondo, por lo que puedes alojarla de forma <strong className="text-white">100% gratuita en GitHub Pages</strong> de por vida!
        </p>

        <div className="space-y-4">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider">¿Cómo publicarlo en GitHub en 3 pasos?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-750">
              <div className="text-indigo-400 font-bold mb-1.5 font-mono">01. URL Relativas Configuradas</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Ya actualizamos <code className="text-rose-400">vite.config.ts</code> de modo que compile con rutas relativas libres. El app funcionará sin corromperse en <code className="text-slate-200">usuario.github.io/tu-repo/</code>.
              </p>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-750">
              <div className="text-indigo-400 font-bold mb-1.5 font-mono">02. Compilación Local</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Abre la terminal en tu entorno local y ejecuta:
                <code className="block bg-slate-950 px-2 py-1.5 rounded text-indigo-300 font-mono text-[10px] mt-2 border border-slate-900">
                  npm run build
                </code>
                Esto generará una carpeta <strong className="text-white">/dist</strong> totalmente compilada.
              </p>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-750">
              <div className="text-indigo-400 font-bold mb-1.5 font-mono">03. Carga de los Archivos</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Sube el material de la carpeta <code className="text-indigo-300">/dist</code> a la rama <code className="text-slate-200">gh-pages</code> o a la raíz de tu repositorio principal de GitHub y activa Pages desde la sección <strong>Settings → Pages</strong> de tu repo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: GESTIÓN DE DOCENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catálogo de Docentes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-850 uppercase tracking-widest mb-4 flex items-center justify-between">
            <span>Catálogo de Docentes</span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{teachers.length} Activos</span>
          </h4>

          {/* Formulario rápido para añadir docente */}
          <form onSubmit={handleAddTeacherSubmit} className="bg-slate-50/75 p-4 rounded-xl border border-slate-100 mb-5 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registrar Nuevo Docente</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Nombre Completo"
                value={newTeacherName}
                onChange={(e) => setNewTeacherName(e.target.value)}
                className="w-full text-[11px] font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 bg-white"
              />
              <select
                value={newTeacherDept}
                onChange={(e) => setNewTeacherDept(e.target.value)}
                className="w-full text-[11px] font-medium border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white text-slate-700"
              >
                <option value="Ingeniería y Ciencias">Ingeniería y Ciencias</option>
                <option value="Negocios y Economía">Negocios y Economía</option>
                <option value="Ciencias Sociales y Humanidades">C. Sociales y Humanidades</option>
                <option value="Ciencias de la Salud">Ciencias de la Salud</option>
                <option value="Idiomas y Artes">Idiomas y Artes</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Correo Institucional (Opcional)"
                value={newTeacherEmail}
                onChange={(e) => setNewTeacherEmail(e.target.value)}
                className="flex-1 text-[11px] font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 bg-white"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white p-1.5 px-3 rounded-lg text-[11px] font-bold shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>
          </form>

          {/* Tabla de Docentes */}
          <div className="space-y-2.5 overflow-y-auto max-h-[200px] pr-1">
            {teachers.map(teacher => (
              <div 
                key={teacher.id} 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/40 transition-all text-xs"
              >
                <div>
                  <h5 className="font-bold text-slate-800">{teacher.name}</h5>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{teacher.department} • {teacher.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveTeacher(teacher.id)}
                  disabled={teachers.length <= 1}
                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Eliminar Docente"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Catálogo de Asignaturas */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-850 uppercase tracking-widest mb-4 flex items-center justify-between">
            <span>Catálogo de Asignaturas</span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{subjects.length} Cursos</span>
          </h4>

          {/* Formulario rápido para añadir materia */}
          <form onSubmit={handleAddSubjectSubmit} className="bg-slate-50/75 p-4 rounded-xl border border-slate-100 mb-5 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registrar Nueva Asignatura</span>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Clave (p. ej. INC-301)"
                value={newSubjectCode}
                onChange={(e) => setNewSubjectCode(e.target.value)}
                className="w-1/3 text-[11px] font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 bg-white"
              />
              <input
                type="text"
                required
                placeholder="Nombre de la Materia"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="flex-1 text-[11px] font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 bg-white"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white p-1.5 px-3 rounded-lg text-[11px] font-bold shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>
          </form>

          {/* Lista de Asignaturas */}
          <div className="space-y-2.5 overflow-y-auto max-h-[200px] pr-1">
            {subjects.map(subject => (
              <div 
                key={subject.id} 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/40 transition-all text-xs"
              >
                <div>
                  <h5 className="font-bold text-slate-800">{subject.name}</h5>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Clave Única: {subject.code}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveSubject(subject.id)}
                  disabled={subjects.length <= 1}
                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Eliminar Asignatura"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
