
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { companyService } from '../services/localStorageService';
import { Company } from '../types';
import PageHeader from '../components/ui/PageHeader';
import { Building2, Save } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const CompanyDetailsPage: React.FC = () => {
  const { company, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && company) {
      setFormData(company);
      setIsLoading(false);
    }
  }, [company, authLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setIsSaving(true);
    try {
      companyService.update(company.id, formData);
      alert('Company details updated successfully!');
    } catch (error) {
      alert('Failed to update details.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading company details...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Details"
        description="View and manage your company's information."
        icon={Building2}
      />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Company Name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
            <Input
              label="Company Phone"
              name="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={handleChange}
              required
            />
            <Input
              label="Company Website"
              name="url"
              type="url"
              value={formData.url || ''}
              onChange={handleChange}
              containerClassName="md:col-span-2"
            />
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Company Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CompanyDetailsPage;
