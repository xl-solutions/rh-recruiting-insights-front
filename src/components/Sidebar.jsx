import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  ChevronRight,
  PieChart,
  AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';

export function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'executive', label: 'Visão Executiva', icon: LayoutDashboard },
    { id: 'funnel', label: 'Histórico Mensal', icon: BarChart3 },
    { id: 'dropouts', label: 'Desistências', icon: AlertTriangle },
    { id: 'diversity', label: 'Diversidade', icon: Users },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-600 p-2 rounded-lg">
            <PieChart className="text-white" size={24} />
          </div>
          <h1 className="font-bold text-slate-900 text-lg leading-tight">
            Recruiting<br/>
            <span className="text-brand-600">Insights</span>
          </h1>
        </div>

        <nav className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">
            Menu Principal
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group",
                  isActive 
                    ? "bg-brand-50 text-brand-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={clsx(isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600")} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-brand-400" />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100">
        <button className="flex items-center gap-3 text-slate-500 hover:text-slate-900 px-3 py-2 transition-colors">
          <Settings size={18} />
          <span className="text-sm font-medium">Configurações</span>
        </button>
      </div>
    </div>
  );
}
