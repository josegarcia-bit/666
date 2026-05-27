/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EvaluationCriterion, Teacher, SubjectItem } from '../types';

export const DEFAULT_TEACHERS: Teacher[] = [
  { id: 't1', name: 'Dra. María Elena Fuentes', department: 'Ingeniería y Ciencias', email: 'maria.fuentes@universidad.edu', status: 'active' },
  { id: 't2', name: 'Dr. Alejandro Silva Treviño', department: 'Negocios y Economía', email: 'alejandro.silva@universidad.edu', status: 'active' },
  { id: 't3', name: 'Mtra. Laura Sofía Ortega', department: 'Ciencias Sociales y Humanidades', email: 'laura.ortega@universidad.edu', status: 'active' },
  { id: 't4', name: 'Ing. Roberto Carlos Méndez', department: 'Ingeniería y Ciencias', email: 'roberto.mendez@universidad.edu', status: 'active' },
  { id: 't5', name: 'Dra. Patricia González Ibáñez', department: 'Ciencias de la Salud', email: 'patricia.gonzalez@universidad.edu', status: 'active' }
];

export const DEFAULT_SUBJECTS: SubjectItem[] = [
  { id: 's1', name: 'Programación Orientada a Objetos', code: 'INC-302' },
  { id: 's2', name: 'Cálculo Multivariable', code: 'MAT-204' },
  { id: 's3', name: 'Microeconomía Intermedia', code: 'ECO-125' },
  { id: 's4', name: 'Psicología Cognitiva', code: 'PSI-401' },
  { id: 's5', name: 'Fisiología Humana II', code: 'MED-310' },
  { id: 's6', name: 'Metodología de Investigación', code: 'HUM-102' }
];

export const DEFAULT_CRITERIA: EvaluationCriterion[] = [
  // Planeación y Estructura
  {
    id: 'q1',
    category: 'Planeación y Estructura',
    question: 'Presenta claramente el programa y los objetivos del curso',
    description: 'El docente explica la planeación didáctica, criterios de evaluación y cronograma de la asignatura al inicio y se apega a ellos.'
  },
  {
    id: 'q2',
    category: 'Planeación y Estructura',
    question: 'Estructuración lógica de las sesiones',
    description: 'Las clases muestran una secuencia organizada (inicio, desarrollo, cierre) que facilita la comprensión del tema.'
  },
  // Dominio e Impartición
  {
    id: 'q3',
    category: 'Fomento del Aprendizaje',
    question: 'Muestra amplio dominio y actualización de los temas de clase',
    description: 'Resuelve dudas de forma precisa y ofrece ejemplos prácticos actuales alineados a la realidad profesional.'
  },
  {
    id: 'q4',
    category: 'Fomento del Aprendizaje',
    question: 'Utiliza metodologías de enseñanza variadas e interactivas',
    description: 'Utiliza dinámicas de grupo, plataformas tecnológicas modernos, casos reales u otros métodos alternativos al pizarrón tradicional.'
  },
  // Interacción y Clima de Aula
  {
    id: 'q5',
    category: 'Clima en el Aula y Relaciones',
    question: 'Fomenta la participación activa y el diálogo crítico',
    description: 'Genera un ambiente que invita a formular preguntas, debatir ideas y participar de manera voluntaria y enriquecedora.'
  },
  {
    id: 'q6',
    category: 'Clima en el Aula y Relaciones',
    question: 'Muestra respeto, empatía y accesibilidad con los alumnos',
    description: 'Atiende de forma respetuosa y equitativa la diversidad de opiniones y demuestra disposición para asesorar.'
  },
  // Evaluación y Retroalimentación
  {
    id: 'q7',
    category: 'Evaluación e Impacto',
    question: 'Aplica criterios de evaluación formativos y justos',
    description: 'Las evaluaciones se alinean con los contenidos expuestos en clase y miden efectivamente el logro de aprendizajes.'
  },
  {
    id: 'q8',
    category: 'Evaluación e Impacto',
    question: 'Retroalimenta el trabajo escolar de manera oportuna',
    description: 'Ofrece explicaciones útiles al devolver exámenes, tareas o proyectos para que el estudiante comprenda sus áreas de oportunidad.'
  },
  // Profesionalismo
  {
    id: 'q9',
    category: 'Compromiso Institucional',
    question: 'Cumple puntualmente con los horarios y sesiones de clase',
    description: 'Inicia y termina las clases a tiempo, demuestra constancia en su asistencia y aprovecha eficientemente el tiempo didáctico.'
  },
  {
    id: 'q10',
    category: 'Compromiso Institucional',
    question: 'Promueve el uso ético y el desarrollo de competencias blandas',
    description: 'Fomenta el trabajo en equipo, la honestidad académica, la responsabilidad y los valores éticos durante las actividades.'
  }
];

export const APPS_SCRIPT_TEMPLATE = `/**
 * CÓDIGO GOOGLE APPS SCRIPT PARA EVALUACIÓN DOCENTE PRO
 * 
 * Instrucciones de instalación:
 * 1. Abre tu Google Sheet donde quieres consolidar las evaluaciones.
 * 2. En el menú superior, ve a Extensiones -> Apps Script.
 * 3. Copia todo este código y reemplaza el contenido del editor 'Código.gs'.
 * 4. Guarda el proyecto (icono de disco).
 * 5. Haz clic en "Implementar" -> "Nueva implementación".
 * 6. Tipo de implementación: selecciona "Aplicación web".
 * 7. Configura lo siguiente:
 *    - Descripción: "Evaluación Docente API"
 *    - Ejecutar como: "Tú" (tu correo)
 *    - Quién tiene acceso: "Cualquier persona" (IMPORTANTE para permitir peticiones AJAX desde el navegador).
 * 8. Copia la URL de la aplicación web generada de la implementación y pégala en esta aplicación web.
 */

// Permite peticiones CORS preflight (OPTIONS)
function doOptions(e) {
  var output = ContentService.createTextOutput();
  return output
    .setMimeType(ContentService.MimeType.TEXT)
    .setContent("")
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function doGet(e) {
  var response = {
    status: "success",
    message: "Conexión exitosa. El Apps Script esta recibiendo peticiones de manera correcta.",
    timestamp: new Date().toISOString()
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

function doPost(e) {
  var origin = "*";
  
  try {
    // Si no hay datos, lanzar error
    if (!e.postData || !e.postData.contents) {
      throw new Error("Petición sin cuerpo de datos");
    }
    
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();
    
    // Obtener cabeceras o crearlas si es nuevo
    initHeadersIfNeeded(sheet);
    
    // Preparar fila para insertar
    var rowData = [
      new Date(), // Fecha de inserción en Apps Script
      data.id || "",
      data.period || "",
      data.teacherName || "",
      data.subjectName || "",
      data.evaluatorRole || "",
      data.evaluatorName || "Anónimo",
      data.generalComments || "",
      data.strengths || "",
      data.areasToImprove || ""
    ];
    
    // Añadir scores individuales de las preguntas q1 a q10 de forma robusta
    var responsesMap = {};
    if (data.responses && Array.isArray(data.responses)) {
      data.responses.forEach(function(r) {
        responsesMap[r.criterionId] = Number(r.score);
      });
    }
    
    // Insertamos dinámicamente q1 a q10
    var sum = 0;
    var count = 0;
    for (var i = 1; i <= 10; i++) {
      var scoreVal = responsesMap["q" + i] || 0;
      rowData.push(scoreVal);
      if (scoreVal > 0) {
        sum += scoreVal;
        count++;
      }
    }
    
    // Calcular promedio
    var average = count > 0 ? (sum / count) : 0;
    rowData.push(average);
    
    // Insertar al final del Google Sheets
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Evaluación guardada con éxito en Google Sheets.",
      inserted_id: data.id,
      average: average
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", origin)
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", origin)
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "Evaluaciones Docentes";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function initHeadersIfNeeded(sheet) {
  var numRows = sheet.getLastRow();
  if (numRows === 0) {
    var headers = [
      "Marca Temporal", 
      "ID Evaluación", 
      "Ciclo Escolar", 
      "Docente", 
      "Asignatura", 
      "Tipo Evaluador", 
      "Evaluador", 
      "Comentario General",
      "Fortalezas",
      "Áreas de Mejora",
      "P1 (Planificación)", 
      "P2 (Estructuración)", 
      "P3 (Dominio de Temas)", 
      "P4 (Metodología)", 
      "P5 (Participación)", 
      "P6 (Empatía)", 
      "P7 (Evaluación Justa)", 
      "P8 (Retroalimentación)", 
      "P9 (Puntualidad)", 
      "P10 (Valores & Ética)", 
      "Promedio General"
    ];
    sheet.appendRow(headers);
    
    // Aplicar estilos básicos a la cabecera
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1e293b"); // Slate 800
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setFontFamily("Inter");
    headerRange.setFontSize(10);
    headerRange.setHorizontalAlignment("center");
    
    // Ajustar columnas
    sheet.autoResizeColumns(1, headers.length);
  }
}
`;
