import React from "react";
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import AuthPage from "./pages/AuthPage";
import DepartmentManagementPage from "./pages/DepartmentManagementPage";
import DesignationManagementPage from "./pages/DesignationManagementPage";
import EmployeeManagementPage from "./pages/EmployeeManagementPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
import MyKraPage from "./pages/MyKraPage";
import KraAssignmentPage from "./pages/KraAssignmentPage";
import CompanyDetailsPage from "./pages/CompanyDetailsPage";
import { Role } from "./types";

function App() {
  return (
    <ReactRouterDOM.HashRouter>
      <AuthProvider>
        <ReactRouterDOM.Routes>
          <ReactRouterDOM.Route path="/auth" element={<AuthPage />} />
          <ReactRouterDOM.Route
            path="/"
            element={<ReactRouterDOM.Navigate to="/auth" replace />}
          />

          <ReactRouterDOM.Route element={<AppLayout />}>
            {/* Admin Routes */}
            <ReactRouterDOM.Route
              element={<ProtectedRoute allowedRoles={[Role.Admin]} />}
            >
              <ReactRouterDOM.Route
                path="/admin/dashboard"
                element={<ManagerDashboardPage />}
              />
              <ReactRouterDOM.Route
                path="/admin/company"
                element={<CompanyDetailsPage />}
              />
              <ReactRouterDOM.Route
                path="/admin/departments"
                element={<DepartmentManagementPage />}
              />
              <ReactRouterDOM.Route
                path="/admin/designations"
                element={<DesignationManagementPage />}
              />
              <ReactRouterDOM.Route
                path="/admin/employees"
                element={<EmployeeManagementPage />}
              />
              <ReactRouterDOM.Route
                path="/admin/kra-management"
                element={<KraAssignmentPage />}
              />
            </ReactRouterDOM.Route>

            {/* Reporting Manager Routes */}
            <ReactRouterDOM.Route
              element={
                <ProtectedRoute
                  allowedRoles={[Role.ReportingManager, Role.Admin]}
                />
              }
            >
              <ReactRouterDOM.Route
                path="/manager/dashboard"
                element={<ManagerDashboardPage />}
              />
              <ReactRouterDOM.Route
                path="/manager/kra-assignment"
                element={<KraAssignmentPage />}
              />
            </ReactRouterDOM.Route>

            {/* User Routes (also accessible by manager and admin) */}
            <ReactRouterDOM.Route
              element={
                <ProtectedRoute
                  allowedRoles={[Role.User, Role.ReportingManager, Role.Admin]}
                />
              }
            >
              <ReactRouterDOM.Route path="/my-kra" element={<MyKraPage />} />
            </ReactRouterDOM.Route>
          </ReactRouterDOM.Route>

          <ReactRouterDOM.Route
            path="*"
            element={<ReactRouterDOM.Navigate to="/auth" replace />}
          />
        </ReactRouterDOM.Routes>
      </AuthProvider>
    </ReactRouterDOM.HashRouter>
  );
}

export default App;
