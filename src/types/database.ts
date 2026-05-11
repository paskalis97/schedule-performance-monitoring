/** Row from the `projects` table. */
export interface Project {
  project_id: number;
  project_code: string;
  project_name: string;
  start_date: string;
  end_date: string;
  current_cutoff_date: string;
  created_at: string;
  updated_at: string;
}

/** Row from the `weekly_cutoffs` table. */
export interface WeeklyCutoff {
  cutoff_id: number;
  project_id: number;
  cutoff_date: string;
  week_number: number;
}

/** Row from the `spi_thresholds` table. */
export interface SpiThreshold {
  threshold_id: number;
  project_id: number | null;
  green_min: number;
  yellow_min: number;
}

/** Row from `v_dashboard_progress`. */
export interface DashboardProgressRow {
  project_id: number;
  discipline_id: number;
  discipline_code: string;
  discipline_name: string;
  cutoff_id: number;
  cutoff_date: string;
  week_number: number;
  weight_factor: number;
  prev_plan: number | null;
  prev_recovery: number | null;
  prev_actual: number | null;
  prev_variance: number | null;
  this_week_plan: number;
  this_week_recovery: number;
  this_week_actual: number;
  this_week_variance: number;
  cum_plan: number;
  cum_recovery: number;
  cum_actual: number;
  cum_variance: number;
  spi: number | null;
}

/** Row from `v_scurve`. */
export interface SCurveRow {
  project_id: number;
  discipline_code: string;
  discipline_name: string;
  cutoff_date: string;
  week_number: number;
  series_type: "BASELINE_PLAN" | "RECOVERY" | "ACTUAL";
  cumulative_progress: number;
}

/** Generic Supabase database type wrapper used by the typed clients. */
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: Project;
        Update: Partial<Project>;
        Relationships: [];
      };
      weekly_cutoffs: {
        Row: WeeklyCutoff;
        Insert: WeeklyCutoff;
        Update: Partial<WeeklyCutoff>;
        Relationships: [];
      };
      spi_thresholds: {
        Row: SpiThreshold;
        Insert: SpiThreshold;
        Update: Partial<SpiThreshold>;
        Relationships: [];
      };
    };
    Views: {
      v_dashboard_progress: { Row: DashboardProgressRow; Relationships: [] };
      v_scurve: { Row: SCurveRow; Relationships: [] };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
