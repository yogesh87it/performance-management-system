import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from "react-router-dom";
import { authService } from "../services/localStorageService";
import { AuthState, Employee, Company, Role, SignUpData } from "../types";

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUpAndBootstrapCompany: (data: SignUpData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    employee: null,
    company: null,
    role: null,
    loading: true,
  });

  const navigate = ReactRouterDOM.useNavigate();

  const loadSession = useCallback(() => {
    try {
      const session = authService.getCurrentSession();
      if (session?.employee && session?.company) {
        setAuth({
          isAuthenticated: true,
          employee: session.employee,
          company: session.company,
          role: session.employee.role,
          loading: false,
        });
      } else {
        setAuth({
          isAuthenticated: false,
          employee: null,
          company: null,
          role: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      setAuth({
        isAuthenticated: false,
        employee: null,
        company: null,
        role: null,
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const navigateAfterLogin = (role: Role) => {
    switch (role) {
      case Role.Admin:
        navigate("/admin/dashboard");
        break;
      case Role.ReportingManager:
        navigate("/manager/dashboard");
        break;
      case Role.User:
        navigate("/my-kra");
        break;
      default:
        navigate("/my-kra");
        break;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { employee, company } = await authService.signIn(email, password);
    if (employee && company) {
      setAuth({
        isAuthenticated: true,
        employee,
        company,
        role: employee.role,
        loading: false,
      });
      navigateAfterLogin(employee.role);
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setAuth({
      isAuthenticated: false,
      employee: null,
      company: null,
      role: null,
      loading: false,
    });
    navigate("/auth");
  };

  const signUpAndBootstrapCompany = async (data: SignUpData) => {
    await authService.signUpAndBootstrapCompany(data);
  };

  const value = { ...auth, signIn, signOut, signUpAndBootstrapCompany };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
