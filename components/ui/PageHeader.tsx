
import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon: Icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center">
        <div className="p-3 bg-blue-100 rounded-lg mr-4">
          <Icon className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
