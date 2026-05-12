import React from 'react';
import { X } from 'lucide-react';

interface TagChipProps {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'selected';
}

export function TagChip({ label, onRemove, variant = 'default' }: TagChipProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        variant === 'selected'
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-700 border border-gray-200'
      }`}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
