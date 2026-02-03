
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, User, Phone, MapPin, Globe, Briefcase, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import { SignUpData } from '../types';

const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {isLoginView ? <LoginForm switchToRegister={() => setIsLoginView(false)} /> : <RegisterForm switchToLogin={() => setIsLoginView(true)} />}
    </div>
  );
};

const LoginForm: React.FC<{ switchToRegister: () => void }> = ({ switchToRegister }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!email || !password) {
      setError("Please fill all fields.");
      setLoading(false);
      return;
    }
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
        <Building2 className="w-16 h-16 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-blue-100 mt-2">Sign in to your account</p>
      </div>
      <form onSubmit={handleSubmit} className="p-8">
        <div className="space-y-6">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <InputField icon={Mail} type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} label="Email Address" />
          <InputField icon={Lock} type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} label="Password" onIconClick={() => setShowPassword(!showPassword)} iconRight={showPassword ? EyeOff : Eye} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button type="button" onClick={switchToRegister} className="text-blue-600 hover:text-blue-700 font-semibold">
            Create one here
          </button>
        </p>
      </form>
    </div>
  );
};

const RegisterForm: React.FC<{ switchToLogin: () => void }> = ({ switchToLogin }) => {
  const { signUpAndBootstrapCompany } = useAuth();
  const [formData, setFormData] = useState<SignUpData & { confirmPassword: string }>({
    companyName: '', companyWebsite: '', companyAddress: '', contactPersonName: '', contactPersonDesignation: '', companyPhone: '', contactPersonPhone: '', contactPersonEmail: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (Object.values(formData).some(v => v === '' && v !== formData.companyWebsite)) {
        setError('Please fill all required fields');
        return;
    }
    if(formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
    }
    if(formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...signUpData } = formData;
      await signUpAndBootstrapCompany(signUpData);
      alert('Registration successful! Please sign in.');
      switchToLogin();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white text-center">
        <Building2 className="w-16 h-16 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-purple-100 mt-2">Register your company to get started</p>
      </div>
      <form onSubmit={handleSubmit} className="p-8">
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InputField label="Company Name *" name="companyName" value={formData.companyName} onChange={handleChange} icon={Building2} />
            <InputField label="Company Website" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} icon={Globe} />
            <InputField label="Company Phone *" name="companyPhone" value={formData.companyPhone} onChange={handleChange} icon={Phone} type="tel" />
            <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Address *</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea name="companyAddress" value={formData.companyAddress} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-20 resize-y" />
                </div>
            </div>
            <InputField label="Contact Person Name *" name="contactPersonName" value={formData.contactPersonName} onChange={handleChange} icon={User} />
            <InputField label="Designation *" name="contactPersonDesignation" value={formData.contactPersonDesignation} onChange={handleChange} icon={Briefcase} />
            <InputField label="Contact Person Phone *" name="contactPersonPhone" value={formData.contactPersonPhone} onChange={handleChange} icon={Phone} type="tel" />
            <InputField label="Contact Person Email *" name="contactPersonEmail" value={formData.contactPersonEmail} onChange={handleChange} icon={Mail} type="email" />
            <InputField label="Password *" name="password" value={formData.password} onChange={handleChange} icon={Lock} type="password" />
            <InputField label="Confirm Password *" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} icon={Lock} type="password" />
        </div>
        <Button type="submit" className="w-full mt-6" variant="primary" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</Button>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button type="button" onClick={switchToLogin} className="text-purple-600 hover:text-purple-700 font-semibold">
            Sign in here
          </button>
        </p>
      </form>
    </div>
  );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: React.ElementType;
    iconRight?: React.ElementType;
    onIconClick?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({ label, icon: Icon, iconRight: IconRight, onIconClick, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input {...props} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {IconRight && (
                <button type="button" onClick={onIconClick} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <IconRight className="w-5 h-5" />
                </button>
            )}
        </div>
    </div>
);

export default AuthPage;
