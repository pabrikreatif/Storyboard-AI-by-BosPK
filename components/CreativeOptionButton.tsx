
import React from 'react';

interface CreativeOptionButtonProps {
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const CreativeOptionButton: React.FC<CreativeOptionButtonProps> = ({ label, icon, isSelected, onClick }) => {
  const baseClasses = "flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface";
  const selectedClasses = "bg-brand-yellow/10 border-brand-yellow text-brand-yellow";
  const unselectedClasses = "bg-brand-surface border-brand-border text-brand-text-secondary hover:bg-brand-border/50 hover:border-brand-text-secondary";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default CreativeOptionButton;
