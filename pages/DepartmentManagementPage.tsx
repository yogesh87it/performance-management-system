
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { departmentService, employeeService } from '../services/localStorageService';
import { Department } from '../types';
import PageHeader from '../components/ui/PageHeader';
import { Briefcase, Plus, Save, Edit2, Trash2 } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const DepartmentManagementPage: React.FC = () => {
  const { company } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState('');
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (company?.id) {
      const depts = departmentService.getByCompanyId(company.id);
      setDepartments(depts.sort((a, b) => a.name.localeCompare(b.name)));
      setIsLoading(false);
    }
  }, [company]);

  const employeeCounts = useMemo(() => {
    if (!company?.id) return {};
    const employees = employeeService.getByCompanyId(company.id);
    return employees.reduce((acc, emp) => {
      if (emp.dept_id) {
        acc[emp.dept_id] = (acc[emp.dept_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [company, departments]);

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
  };

  const handleCancel = () => {
    setEditingDept(null);
    setName('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      departmentService.delete(id);
      setDepartments(departments.filter(d => d.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company?.id) return;

    if (editingDept) {
      const updatedDept = departmentService.update(editingDept.id, { name: name.trim() });
      if (updatedDept) {
        setDepartments(departments.map(d => d.id === updatedDept.id ? updatedDept : d).sort((a, b) => a.name.localeCompare(b.name)));
      }
    } else {
      const newDept = departmentService.create({ company_id: company.id, name: name.trim() });
      setDepartments([...departments, newDept].sort((a, b) => a.name.localeCompare(b.name)));
    }
    handleCancel();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Department Management" description="Add and manage company departments." icon={Briefcase} />
      
      <Card title={editingDept ? 'Edit Department' : 'Add New Department'} icon={editingDept ? Edit2 : Plus}>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
          <Input 
            label="Department Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            containerClassName="flex-grow"
            required
          />
          <div className="flex gap-2">
            {editingDept && <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>}
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {editingDept ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Departments List</h3>
        {isLoading ? <p>Loading...</p> : departments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-3 font-semibold">Department Name</th>
                  <th className="px-6 py-3 font-semibold">Employees</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4">{employeeCounts[dept.id] || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(dept)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(dept.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No departments added yet.</p>
        )}
      </Card>
    </div>
  );
};

export default DepartmentManagementPage;
