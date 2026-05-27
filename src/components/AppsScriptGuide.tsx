/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Copy, Check, ExternalLink, FileSpreadsheet, Info, Play, CheckCircle } from 'lucide-react';
import { APPS_SCRIPT_TEMPLATE } from '../data/defaultData';

interface AppsScriptGuideProps {
  onInsertDemoUrl: () => void;
  currentUrl: string;
}

export default function AppsScriptGuide({ onInsertDemoUrl, currentUrl }: AppsScriptGuideProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 shadow-sm font-sans">
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl border border-emerald-100">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight font-display">Conexión con Google Sheets</h2>
          <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
            Esta aplicación almacena los resultados de rendimiento docente directamente en tu propia hoja de cálculo en tiempo real. Sigue estos 3 simples pasos para conectarla.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Paso 1 */}
        <div className="relative pl-8 border-l border-zinc-200">
          <div className="absolute left-[-13px] top-0 bg-zinc-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono">
            1
          </div>
          <h3 className="font-bold text-zinc-950 text-sm font-display">Crea tu Google Sheet</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Abre o crea una hoja de cálculo en Google Drive. No necesitas estructurar columnas de cabecera manuales, el script las creará automáticamente con un formato e identidad profesional en tu primer envío.
          </p>
          <a
            href="https://sheets.new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-bold mt-2 hover:underline transition-colors cursor-pointer"
          >
            <span>Crear nueva hoja de cálculo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Paso 2 */}
        <div className="relative pl-8 border-l border-zinc-200">
          <div className="absolute left-[-13px] top-0 bg-zinc-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono">
            2
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-bold text-zinc-950 text-sm font-display">Copia el Código de Apps Script</h3>
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-zinc-100 hover:bg-zinc-250 text-zinc-800 border border-zinc-250'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>¡Código Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Script</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Ve a <strong>Extensiones → Apps Script</strong> en el menú de Google Sheet, elimina las líneas de ejemplo en el archivo <code className="bg-zinc-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-[10px] border border-zinc-200">Código.gs</code>, pega el script de la plataforma y presiona el guardar.
          </p>
        </div>

        {/* Paso 3 */}
        <div className="relative pl-8">
          <div className="absolute left-[-13px] top-0 bg-zinc-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono">
            3
          </div>
          <h3 className="font-bold text-zinc-950 text-sm font-display">Implementa como Aplicación Web</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Haz clic en <strong>Implementar → Nueva implementación</strong>. Selecciona el tipo <strong>"Aplicación web"</strong>. 
            Establece los parámetros Ejecutar como: <strong>"Tú"</strong> y Quién tiene acceso: <strong>"Cualquier persona"</strong>. Despliega, otorga los permisos correspondientes de Google Drive y copia el enlace resultante.
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-200">
        <h4 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-1.5 font-display">
          <Info className="w-4 h-4 text-indigo-600 animate-pulse" />
          <span>¿Quieres probar la app de inmediato con un simulador?</span>
        </h4>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl">
          Para agilizar la prueba, la plataforma cuenta con un simulador local embebido de Google Sheets. Al hacer clic en el botón, se generará e insertará una URL del simulador virtual que registrará todas las evaluaciones que realices y te permitirá ver la hoja de cálculo modelada en tiempo real.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onInsertDemoUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-850 active:bg-zinc-900 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all group cursor-pointer font-display"
          >
            <Play className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            <span>Insertar URL de Apps Script del Simulador</span>
          </button>
          {currentUrl.includes('SIMULATOR') && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-full font-bold border border-emerald-100 font-mono">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Simulador Activo</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
