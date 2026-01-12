// src/components/LoadingSpinner.jsx
import React from 'react';
import { Icon } from '@iconify/react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="flex flex-col items-center">
        <Icon 
          icon="svg-spinners:bars-scale" 
          className="w-12 h-12 text-blue-600 animate-spin" 
        />
        <span className="mt-2 text-white font-medium">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;