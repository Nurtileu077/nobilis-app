import React from 'react';

const EmptyState = ({ icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    {icon && (
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-gray-500 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-400 max-w-sm">{description}</p>}
  </div>
);

export default EmptyState;
