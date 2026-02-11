import React from 'react';

interface IndicatorProps {
  value: number; // Value between 0 and 5
  max: number; // Maximum number of bars
}

const Indicator: React.FC<IndicatorProps> = ({ value, max }) => {
  const getColor = (index: number) => {
    return index < value ? 'bg-black' : 'bg-gray-300';
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
