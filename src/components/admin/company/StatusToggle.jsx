import { useState, useEffect } from 'react';

export default function StatusToggle({ active, onChange }) {
  const [isActive, setIsActive] = useState(active);

  useEffect(() => {
    setIsActive(active);
  }, [active]);

  const handleToggle = () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    onChange(newStatus);
  };

  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={isActive}
          onChange={handleToggle}
        />
        <div
          className={`block w-12 h-6 rounded-full transition-colors ${
            isActive ? 'bg-green-500' : 'bg-gray-300'
          }`}
        ></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
            isActive ? 'transform translate-x-6' : ''
          }`}
        ></div>
      </div>
    </label>
  );
}