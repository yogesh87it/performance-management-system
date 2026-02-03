
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ElementType;
}

const Card: React.FC<CardProps> = ({ children, className, title, description, icon: Icon }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {(title || description) && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            {Icon && <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Icon className="w-6 h-6" /></div>}
            <div>
              {title && <h2 className="text-xl font-bold text-gray-800">{title}</h2>}
              {description && <p className="text-gray-600 mt-1">{description}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
