import React from 'react';
import {
  getCategoryStyle,
  getPriorityDotStyle,
  getPriorityStyle,
  getStatusBadgeStyle,
  getStatusStyle,
} from '../utils/styleMaps';

interface StatusBadgeProps {
  status: string;
  withDot?: boolean;
}

interface PriorityBadgeProps {
  priority: string;
}

interface CategoryBadgeProps {
  category: string;
}

interface PriorityDotProps {
  priority: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, withDot = false }) => {
  const style = getStatusStyle(status);

  if (withDot) {
    return (
      <span className={`flex items-center text-[12px] leading-4 tracking-[0.05em] font-semibold ${style.badge}`}>
        <span className={`w-2 h-2 rounded-full mr-2 ${style.dot}`} />
        {status}
      </span>
    );
  }

  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold flex w-fit items-center gap-1 ${style.badge}`}>
      <span className="material-symbols-outlined text-[14px]">{style.icon}</span>{' '}
      {status}
    </span>
  );
};

export const StatusPill: React.FC<StatusBadgeProps> = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-[12px] leading-4 tracking-[0.05em] font-semibold flex items-center gap-1.5 ${getStatusBadgeStyle(status)}`}>
    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
      check_circle
    </span>
    {status}
  </span>
);

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => (
  <span className={`px-3 py-1 rounded-full text-[12px] leading-4 tracking-[0.05em] font-semibold ${getPriorityStyle(priority)}`}>
    {priority}
  </span>
);

export const PriorityPill: React.FC<PriorityBadgeProps> = ({ priority }) => (
  <span className={`px-3 py-1 rounded-full text-[12px] leading-4 tracking-[0.05em] font-semibold flex items-center gap-1.5 ${getPriorityStyle(priority)}`}>
    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
      priority_high
    </span>
    {priority}
  </span>
);

export const PriorityDot: React.FC<PriorityDotProps> = ({ priority }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${getPriorityDotStyle(priority)}`} />
    <span className="text-[13px] leading-[18px] font-medium text-[#191c1e]">
      {priority}
    </span>
  </div>
);

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => (
  <span className={`px-3 py-1 rounded-full text-[12px] leading-4 tracking-[0.05em] font-semibold ${getCategoryStyle(category)}`}>
    {category}
  </span>
);