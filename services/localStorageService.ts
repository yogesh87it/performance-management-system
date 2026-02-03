
import { Company, Department, Designation, Employee, KpiRow, SelfAssessment, SignUpData, Role } from '../types';

const STORAGE_KEYS = {
  COMPANIES: "pms_companies",
  EMPLOYEES: "pms_employees",
  DEPARTMENTS: "pms_departments",
  DESIGNATIONS: "pms_designations",
  KPI_ROWS: "pms_kpi_rows",
  SELF_ASSESSMENTS: "pms_self_assessments",
  CURRENT_SESSION: "pms_current_session",
};

// --- Helpers ---
const generateId = (): string => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getFromStorage = <T,>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) as T : null;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
};

const saveToStorage = <T,>(key: string, data: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

const initializeStorage = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    if (key !== STORAGE_KEYS.CURRENT_SESSION && !localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });
};

initializeStorage();

// --- Auth Service ---
export const authService = {
  signUpAndBootstrapCompany: async (data: SignUpData) => {
    const companies = companyService.getAll();
    const employees = employeeService.getAll();

    if (employees.some(emp => emp.personal_email === data.contactPersonEmail)) {
      throw new Error("Email already registered");
    }

    const companyId = generateId();
    const newCompany: Company = {
      id: companyId,
      name: data.companyName,
      address: data.companyAddress,
      url: data.companyWebsite || null,
      phone: data.companyPhone,
      created_at: new Date().toISOString(),
    };
    companies.push(newCompany);
    saveToStorage(STORAGE_KEYS.COMPANIES, companies);

    const [firstname, ...rest] = (data.contactPersonName || "").trim().split(/\s+/);
    const lastname = rest.join(" ") || ' ';

    const newEmployee: Employee = {
      id: 'ADMIN001',
      company_id: companyId,
      dept_id: null,
      desig_id: null,
      role: Role.Admin,
      firstname,
      lastname,
      personal_email: data.contactPersonEmail,
      company_email: null,
      personal_number: data.contactPersonPhone,
      company_number: null,
      date_of_joining: new Date().toISOString().slice(0, 10),
      password: data.password,
      reporting_manager_id: null,
      created_by: null,
      edited_by: null,
      created_at: new Date().toISOString(),
    };
    employees.push(newEmployee);
    saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
  },

  signIn: async (email: string, password: string) => {
    const employee = employeeService.getAll().find(e => e.personal_email === email);
    if (!employee || employee.password !== password) {
      throw new Error("Invalid email or password");
    }
    const company = companyService.getById(employee.company_id);
    const session = { employee, company };
    saveToStorage(STORAGE_KEYS.CURRENT_SESSION, session);
    return session;
  },

  signOut: async () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  },

  getCurrentSession: (): { employee: Employee, company: Company } | null => {
    return getFromStorage<{ employee: Employee, company: Company }>(STORAGE_KEYS.CURRENT_SESSION);
  },
};

// --- Generic CRUD Service Factory ---
const createCrudService = <T extends { id: string }>(storageKey: string) => {
    return {
        getAll: (): T[] => getFromStorage<T[]>(storageKey) || [],
        getById: (id: string): T | undefined => {
            return (getFromStorage<T[]>(storageKey) || []).find(item => item.id === id);
        },
        create: (itemData: Omit<T, 'id' | 'created_at'> & { id?: string }): T => {
            const items = getFromStorage<T[]>(storageKey) || [];
            const newItem = {
                ...itemData,
                id: itemData.id || generateId(),
                created_at: new Date().toISOString(),
// FIX: Fix TypeScript error by asserting type to `unknown` first. This is necessary because T is a generic type.
            } as unknown as T;
            items.push(newItem);
            saveToStorage(storageKey, items);
            return newItem;
        },
        update: (id: string, itemData: Partial<T>): T | null => {
            const items = getFromStorage<T[]>(storageKey) || [];
            const index = items.findIndex(item => item.id === id);
            if (index > -1) {
                items[index] = { ...items[index], ...itemData, updated_at: new Date().toISOString() };
                saveToStorage(storageKey, items);
                return items[index];
            }
            return null;
        },
        delete: (id: string): boolean => {
            let items = getFromStorage<T[]>(storageKey) || [];
            const initialLength = items.length;
            items = items.filter(item => item.id !== id);
            if (items.length < initialLength) {
                saveToStorage(storageKey, items);
                return true;
            }
            return false;
        },
    };
};


// --- Entity Services ---
export const companyService = {
    ...createCrudService<Company>(STORAGE_KEYS.COMPANIES)
};

export const employeeService = {
    ...createCrudService<Employee>(STORAGE_KEYS.EMPLOYEES),
    getByCompanyId: (companyId: string): Employee[] => {
        return employeeService.getAll().filter(e => e.company_id === companyId);
    },
    getByReportingManagerId: (managerId: string): Employee[] => {
        return employeeService.getAll().filter(e => e.reporting_manager_id === managerId);
    },
    fetchByEmail: (email: string): Employee | undefined => {
      return employeeService.getAll().find(e => e.personal_email === email);
    }
};

export const departmentService = {
    ...createCrudService<Department>(STORAGE_KEYS.DEPARTMENTS),
    getByCompanyId: (companyId: string): Department[] => {
        return departmentService.getAll().filter(d => d.company_id === companyId);
    }
};

export const designationService = {
    ...createCrudService<Designation>(STORAGE_KEYS.DESIGNATIONS),
    getByCompanyId: (companyId: string): Designation[] => {
        return designationService.getAll().filter(d => d.company_id === companyId);
    }
};

export const kpiRowService = {
    ...createCrudService<KpiRow>(STORAGE_KEYS.KPI_ROWS),
    getByEmployeeId: (employeeId: string): KpiRow[] => {
        return kpiRowService.getAll().filter(k => k.employee_id === employeeId);
    }
};

export const selfAssessmentService = {
    ...createCrudService<SelfAssessment>(STORAGE_KEYS.SELF_ASSESSMENTS),
    getByKpiRowId: (kpiRowId: string): SelfAssessment | undefined => {
        return selfAssessmentService.getAll().find(a => a.kpi_row_id === kpiRowId);
    },
    getByEmployeeId: (employeeId: string): SelfAssessment[] => {
        return selfAssessmentService.getAll().filter(a => a.employee_id === employeeId);
    }
};
