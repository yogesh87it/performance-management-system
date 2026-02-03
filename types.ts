export enum Role {
  Admin = "admin",
  ReportingManager = "reporting_manager",
  User = "user",
}

export interface Company {
  id: string;
  name: string;
  address: string;
  url: string | null;
  phone: string;
  created_at: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  company_id: string;
  dept_id: string | null;
  desig_id: string | null;
  reporting_manager_id: string | null;
  role: Role;
  firstname: string;
  lastname: string;
  personal_email: string;
  company_email: string | null;
  personal_number: string;
  company_number: string | null;
  date_of_birth?: string | null;
  date_of_joining: string;
  password?: string;
  created_by: string | null;
  edited_by: string | null;
  manager_recommendation?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
  updated_at?: string;
}

export interface Designation {
  id: string;
  company_id: string;
  name: string; // Renamed from title for consistency
  created_at: string;
  updated_at?: string;
}

export interface KpiRow {
  id: string;
  employee_id: string;
  kra_name: string;
  kpi_detail: string;
  weight: number;
  target: string;
  actual: string;
  score: number | null;
  manager_remarks: string;
  sort_order?: number;
  created_at: string;
  updated_at?: string;
}

export interface SelfAssessment {
  id: string;
  kpi_row_id: string;
  employee_id: string;
  action_taken: string;
  accomplishment: string; // Renamed from accomplishments for consistency
  notes: string;
  created_at: string;
  updated_at?: string;
}

// For AuthContext
export interface AuthState {
  isAuthenticated: boolean;
  employee: Employee | null;
  company: Company | null;
  role: Role | null;
  loading: boolean;
}

// For localStorageService signUp
export interface SignUpData {
  companyName: string;
  companyWebsite?: string;
  companyAddress: string;
  companyPhone: string;
  contactPersonName: string;
  contactPersonDesignation: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  password: string;
}
