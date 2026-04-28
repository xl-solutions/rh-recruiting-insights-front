import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function KPICard({ title, value, subtitle, icon: Icon, color = "blue", className }) {
  const colorVariants = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-green-600 bg-green-50 border-green-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    slate: "text-slate-600 bg-slate-50 border-slate-100",
  };

  return (
    <div className={twMerge(
      "bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={twMerge("p-2.5 rounded-lg border", colorVariants[color])}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
