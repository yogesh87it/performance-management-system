
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { designationService, employeeService } from '../services/localStorageService';
import { Designation } from '../types';
import PageHeader from '../components/ui/PageHeader';
import { Briefcase, Plus, Save, Edit2, Trash2 } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const DesignationManagementPage: React.FC = () => {
  const { company } = useAuth();
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [name, setName] = useState('');
  const [editingDesig, setEditingDesig] = useState<Designation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (company?.id) {
      const desigs = designationService.getByCompanyId(company.id);
      setDesignations(desigs.sort((a, b) => a.name.localeCompare(b.name)));
      setIsLoading(false);
    }
  }, [company]);

  const employeeCounts = useMemo(() => {
    if (!company?.id) return {};
    const employees = employeeService.getByCompanyId(company.id);
    return employees.reduce((acc, emp) => {
      if (emp.desig_id) {
        acc[emp.desig_id] = (acc[emp.desig_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [company, designations]);

  const handleEdit = (desig: Designation) => {
    setEditingDesig(desig);
    setName(desig.name);
  };

  const handleCancel = () => {
    setEditingDesig(null);
    setName('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      designationService.delete(id);
      setDesignations(designations.filter(d => d.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company?.id) return;

    if (editingDesig) {
      const updatedDesig = designationService.update(editingDesig.id, { name: name.trim() });
      if (updatedDesig) {
        setDesignations(designations.map(d => d.id === updatedDesig.id ? updatedDesig : d).sort((a, b) => a.name.localeCompare(b.name)));
      }
    } else {
      const newDesig = designationService.create({ company_id: company.id, name: name.trim() });
      setDesignations([...designations, newDesig].sort((a, b) => a.name.localeCompare(b.name)));
    }
    handleCancel();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Designation Management" description="Add and manage job designations." icon={Briefcase} />
      
      <Card title={editingDesig ? 'Edit Designation' : 'Add New Designation'} icon={editingDesig ? Edit2 : Plus}>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
          <Input 
            label="Designation Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            containerClassName="flex-grow"
            required
          />
          <div className="flex gap-2">
            {editingDesig && <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>}
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {editingDesig ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Designations List</h3>
        {isLoading ? <p>Loading...</p> : designations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-3 font-semibold">Designation Name</th>
                  <th className="px-6 py-3 font-semibold">Employees</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {designations.map((desig) => (
                  <tr key={desig.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{desig.name}</td>
                    <td className="px-6 py-4">{employeeCounts[desig.id] || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(desig)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(desig.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No designations added yet.</p>
        )}
      </Card>
    </div>
  );
};

export default DesignationManagementPage;
