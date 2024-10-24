import React from 'react';

interface IndicatorProps {
  value: number; // Value between 0 and 5
  max: number; // Maximum number of bars
}

const Indicator: React.FC<IndicatorProps> = ({ value, max }) => {
  const getColor = (index: number) => {
    if (index < value) {
      switch (value) {
        case 5:
          return 'bg-green-500';
        case 4:
          return 'bg-lime-500'; // Updated to lime for 4/5
        case 3:
          return 'bg-yellow-400';
        case 2:
          return 'bg-orange-500';
        case 1:
          return 'bg-red-500';
        default:
          return 'bg-gray-700';
      }
    }
    return 'bg-gray-700';
  };

  return (
    <div className="flex">
      {Array.from({ length: max }, (_, index) => (
        <div
          key={index}
          className={`w-[3px] h-[16px] mx-0.5 rounded-sm ${getColor(index)}`}
        />
      ))}
    </div>
  );
};

export default Indicator;
