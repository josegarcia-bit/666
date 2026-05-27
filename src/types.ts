/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EvaluationCriterion {
  id: string;
  category: string;
  question: string;
  description: string;
}

export interface Teacher {
  id: string;
  name: string;
  department: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
}

export interface EvaluationResponse {
  criterionId: string;
  score: number; // 1-5
}

export interface TeacherEvaluation {
  id: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  evaluatorName: string;
  evaluatorRole: 'student' | 'peer' | 'director';
  period: string;
  date: string; // ISO string
  responses: EvaluationResponse[];
  generalComments: string;
  strengths: string;
  areasToImprove: string;
  synced: boolean;
  syncError?: string;
}

export interface AppsScriptConfig {
  webAppUrl: string;
  spreadsheetId: string;
  status: 'idle' | 'testing' | 'connected' | 'error';
}
