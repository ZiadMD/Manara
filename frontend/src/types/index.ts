export type Role = 'student' | 'counselor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  contact_phone?: string | null;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface DomainNorm {
  mean: number;
  sd: number;
  min_score: number;
  max_score: number;
}

export interface Domain {
  id: string;
  name_ar: string;
  name_en: string;
  item_range: [number, number];
  item_count: number;
  intro_ar: string;
  intro_en: string;
  safety_notice_after_ar?: string;
  safety_notice_after_en?: string;
  norm: DomainNorm;
}

export interface ResponseOption {
  value: number;
  label_ar: string;
  label_en: string;
}

export interface Item {
  number: number;
  domain: string;
  text_ar: string;
  gloss_en: string;
  reverse: boolean;
}

export interface DemographicFieldOption {
  value: string;
  label_ar: string;
  label_en: string;
}

export interface DemographicField {
  id: string;
  label_ar: string;
  label_en: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  options?: DemographicFieldOption[];
  min?: number;
  max?: number;
  placeholder_ar?: string;
  placeholder_en?: string;
}

export interface DomainScoreResult {
  domain: string;
  raw_score: number;
  t_score: number;
  percentile: number | null;
  screening_level: 'low' | 'medium' | 'high' | 'very_high';
  screening_level_ar: string;
  screening_level_en: string;
  domain_name_ar: string;
  domain_name_en: string;
}

export interface SafetyFlag {
  id: string;
  assessment_id: string;
  student_id: string;
  student_name: string;
  student_stage?: string | null;
  triggered_by: string;
  status: 'open' | 'reviewed' | 'escalated';
  notes?: string | null;
  created_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

export interface AssessmentSummary {
  id: string;
  student_id: string;
  student_name: string;
  submitted_at: string;
  status: string;
  has_safety_flags: boolean;
  highest_screening_level?: 'low' | 'medium' | 'high' | 'very_high' | null;
  school_stage?: string | null;
}

export interface ItemDetail {
  item_number: number;
  raw_response: number;
  scored_value: number;
  is_reversed: boolean;
  text_ar: string;
  gloss_en: string;
  domain: string;
}

export interface AssessmentDetail {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  submitted_at: string;
  status: string;
  background_responses: Record<string, string>;
  domain_scores: Record<string, DomainScoreResult>;
  safety_flags: SafetyFlag[];
  items: ItemDetail[];
}

export interface ScreeningLevelCount {
  level: string;
  count: number;
  percentage: number;
}

export interface DomainAggregate {
  domain: string;
  domain_name_ar: string;
  domain_name_en: string;
  levels: Record<string, ScreeningLevelCount>;
  mean_t_score?: number | null;
}

export interface DemographicsAggregate {
  by_stage: Record<string, number>;
  by_gender: Record<string, number>;
  by_school_type: Record<string, number>;
}

export interface AdminMetricsResponse {
  total_assessments: number;
  total_safety_flags: number;
  open_safety_flags: number;
  domains: Record<string, DomainAggregate>;
  demographics: DemographicsAggregate;
}

export interface SafetyConfig {
  direct_risk_items: number[];
  trigger_threshold: number;
  description?: string;
  items_detail?: Record<string, string>;
}
