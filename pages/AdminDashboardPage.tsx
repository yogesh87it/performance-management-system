
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { departmentService, designationService, employeeService, kpiRowService } from '../services/localStorageService';
import { Building2, Users, Briefcase, Target, LayoutDashboard } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { company } = useAuth();
  const [stats, setStats] = useState({ departments: 0, designations: 0, employees: 0, kras: 0 });

  useEffect(() => {
    if (!company?.id) return;
    const departments = departmentService.getByCompanyId(company.id);
    const designations = designationService.getByCompanyId(company.id);
    const employees = employeeService.getByCompanyId(company.id);
    const kras = employees.reduce((acc, emp) => acc + kpiRowService.getByEmployeeId(emp.id).length, 0);

    setStats({
      departments: departments.length,
      designations: designations.length,
      employees: employees.length,
      kras,
    });
  }, [company]);

  const dashboardItems = [
    { title: 'Company Details', description: 'Manage company information', icon: Building2, route: '/admin/company', color: 'from-blue-500 to-blue-600' },
    { title: 'Departments', description: 'View and manage departments', icon: Briefcase, route: '/admin/departments', color: 'from-purple-500 to-purple-600' },
    { title: 'Designations', description: 'Configure job roles', icon: Briefcase, route: '/admin/designations', color: 'from-indigo-500 to-indigo-600' },
    { title: 'Employees', description: 'Register and manage employees', icon: Users, route: '/admin/employees', color: 'from-green-500 to-green-600' },
    { title: 'KRA Management', description: 'Assign and score KRAs', icon: Target, route: '/admin/kra-management', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
            <LayoutDashboard className="w-10 h-10 mr-4 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage all administrative functions for {company?.name}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={() => navigate(item.route)}
              className={`bg-gradient-to-br ${item.color} text-white rounded-xl shadow-lg p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-left`}
            >
              <div className="bg-white bg-opacity-20 rounded-lg p-4 w-fit mb-4"><Icon className="w-10 h-10" /></div>
              <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
              <p className="text-white text-opacity-90 text-sm">{item.description}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Departments" value={stats.departments} color="blue" />
            <StatCard title="Designations" value={stats.designations} color="purple" />
            <StatCard title="Total Employees" value={stats.employees} color="green" />
            <StatCard title="Active KRAs" value={stats.kras} color="orange" />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
    title: string;
    value: number;
    color: 'blue' | 'purple' | 'green' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
    const colors = {
        blue: 'text-blue-600 bg-blue-50',
        purple: 'text-purple-600 bg-purple-50',
        green: 'text-green-600 bg-green-50',
        orange: 'text-orange-600 bg-orange-50',
    };
    return (
        <div className={`text-center p-4 rounded-lg ${colors[color]}`}>
            <div className="text-3xl font-bold mb-1">{value}</div>
            <div className="text-sm text-gray-600">{title}</div>
        </div>
    );
};

export default AdminDashboardPage;
