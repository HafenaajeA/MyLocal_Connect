import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const getSizeClasses = (size) => {
    switch (size) {
      case 'small':
        return 'w-5 h-5 border-2';
      case 'large':
        return 'w-16 h-16 border-4';
      default:
        return 'w-10 h-10 border-3';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-5">
      <div className={`border-gray-200 border-t-indigo-600 rounded-full animate-spin ${getSizeClasses(size)}`}></div>
      {text && <p className="mt-4 text-gray-500 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
