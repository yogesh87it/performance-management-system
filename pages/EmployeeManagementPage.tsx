import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  employeeService,
  departmentService,
  designationService,
} from "../services/localStorageService";
import { Employee, Department, Designation, Role } from "../types";
import PageHeader from "../components/ui/PageHeader";
import {
  Users,
  UserPlus,
  Save,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const EMPTY_FORM = {
  id: "",
  firstname: "",
  lastname: "",
  personal_email: "",
  password: "",
  role: Role.User,
  date_of_joining: "",
  personal_number: "",
  dept_id: null,
  desig_id: null,
  reporting_manager_id: null,
  company_email: null,
  company_number: null,
  date_of_birth: null,
  created_by: null,
  edited_by: null,
};

const EmployeeManagementPage: React.FC = () => {
  const { company, employee: currentEmployee } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<any>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (company?.id) {
      setEmployees(employeeService.getByCompanyId(company.id));
      setDepartments(departmentService.getByCompanyId(company.id));
      setDesignations(designationService.getByCompanyId(company.id));
    }
  }, [company]);

  const reportingManagers = employees.filter(
    (e) => e.role === Role.ReportingManager || e.role === Role.Admin,
  );

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ ...emp, password: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingEmployee(null);
    setFormData(EMPTY_FORM);
  };

  const handleDelete = (id: string) => {
    if (id === currentEmployee?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (window.confirm("Are you sure? This cannot be undone.")) {
      employeeService.delete(id);
      setEmployees(employees.filter((e) => e.id !== id));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id || !currentEmployee?.id) return;

    try {
      if (editingEmployee) {
        const {
          id,
          company_id,
          created_at,
          created_by,
          updated_at,
          ...updateData
        } = formData;

        if (
          updateData.password &&
          updateData.password.trim() !== "" &&
          updateData.password.length < 6
        ) {
          alert("New password must be at least 6 characters");
          return;
        }

        if (!updateData.password || updateData.password.trim() === "") {
          delete updateData.password;
        }

        employeeService.update(editingEmployee.id, {
          ...updateData,
          edited_by: currentEmployee.id,
        });
      } else {
        if (employees.some((emp) => emp.id === formData.id)) {
          alert("Error: Employee ID already exists.");
          return;
        }
        if (formData.password.length < 6) {
          alert("Password must be at least 6 characters");
          return;
        }
        employeeService.create({
          ...formData,
          company_id: company.id,
          created_by: currentEmployee.id,
        });
      }
      setEmployees(employeeService.getByCompanyId(company.id));
      handleCancel();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Management"
        description="Add, edit, and manage all employees in your company."
        icon={Users}
      />

      <Card
        title={
          editingEmployee
            ? `Edit Employee: ${editingEmployee.firstname}`
            : "Add New Employee"
        }
        icon={UserPlus}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Input
              label="Employee ID *"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              disabled={!!editingEmployee}
            />
            <Input
              label="First Name *"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              required
            />
            <Input
              label="Last Name *"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
            <Input
              label="Personal Email *"
              name="personal_email"
              type="email"
              value={formData.personal_email}
              onChange={handleChange}
              required
            />
            <Input
              label="Company Email"
              name="company_email"
              type="email"
              value={formData.company_email || ""}
              onChange={handleChange}
            />
            <Input
              label="Personal Number *"
              name="personal_number"
              type="tel"
              value={formData.personal_number}
              onChange={handleChange}
              required
            />
            <Input
              label="Company Number"
              name="company_number"
              type="tel"
              value={formData.company_number || ""}
              onChange={handleChange}
            />
            <Input
              label="Date of Joining *"
              name="date_of_joining"
              type="date"
              value={formData.date_of_joining}
              onChange={handleChange}
              required
            />
            <Input
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth || ""}
              onChange={handleChange}
            />
            <Select
              label="Department *"
              name="dept_id"
              value={formData.dept_id || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
            <Select
              label="Designation *"
              name="desig_id"
              value={formData.desig_id || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Designation</option>
              {designations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
            <Select
              label="Role *"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              {Object.values(Role).map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r.replace("_", " ")}
                </option>
              ))}
            </Select>
            <Select
              label="Reporting Manager"
              name="reporting_manager_id"
              value={formData.reporting_manager_id || ""}
              onChange={handleChange}
            >
              <option value="">None</option>
              {reportingManagers
                .filter((m) => m.id !== formData.id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstname} {m.lastname}
                  </option>
                ))}
            </Select>
            <div className="relative">
              <Input
                label={editingEmployee ? "New Password" : "Password *"}
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
                onChange={handleChange}
                required={!editingEmployee}
                helperText={
                  editingEmployee
                    ? "Leave blank to keep current password"
                    : "Min. 6 characters"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            {editingEmployee && (
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {editingEmployee ? "Update Employee" : "Save Employee"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Employee List
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Designation</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs">{emp.id}</td>
                  <td className="px-4 py-2">
                    {emp.firstname} {emp.lastname}
                  </td>
                  <td className="px-4 py-2">{emp.personal_email}</td>
                  <td className="px-4 py-2">
                    {departments.find((d) => d.id === emp.dept_id)?.name || "-"}
                  </td>
                  <td className="px-4 py-2">
                    {designations.find((d) => d.id === emp.desig_id)?.name ||
                      "-"}
                  </td>
                  <td className="px-4 py-2 capitalize">
                    {emp.role.replace("_", " ")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      aria-label={`Edit ${emp.firstname}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      aria-label={`Delete ${emp.firstname}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeManagementPage;
