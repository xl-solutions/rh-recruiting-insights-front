import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { TrendingUp, Activity, Clock, Share2, Calendar, Maximize2, X, PieChart } from 'lucide-react';
import { clsx } from 'clsx';

export default function MonthlyTrendsView({ data, isLoading, error }) {
  const [filterYear, setFilterYear] = useState('Todos');
  const [expandedChart, setExpandedChart] = useState(null);
  const [hiddenSeries, setHiddenSeries] = useState(new Set());

  const years = useMemo(() => {
    return ['Todos', ...new Set(data.map(d => d.ano))];
  }, [data]);

  const filteredData = useMemo(() => {
    if (filterYear === 'Todos') return data;
    return data.filter(d => d.ano === filterYear);
  }, [data, filterYear]);

  const toggleSeries = (e) => {
    const key = e.dataKey;
    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const formatXAxis = (tickItem, index, isExpanded) => {
    if (isExpanded) return tickItem;
    if (tickItem.startsWith('Jan') || tickItem.startsWith('Jul')) return tickItem;
    return "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Sem dados históricos</h3>
        <p className="text-slate-500">Verifique a aba 'Mensal' na planilha.</p>
      </div>
    );
  }

  const renderChart = (id, title, Icon, color, ChartComponent, children, isExpanded = false) => {
    const Component = ChartComponent;
    return (
      <div className={clsx(
        "bg-white rounded-2xl border border-slate-100 flex flex-col transition-all",
        isExpanded ? "w-full h-full p-8" : "p-6 shadow-sm h-[380px]"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={clsx("font-bold text-slate-900 flex items-center gap-2", isExpanded ? "text-2xl" : "text-base")}>
            <Icon className={clsx(color, isExpanded ? "w-8 h-8" : "w-5 h-5")} />
            {title}
          </h3>
          <div className="flex items-center gap-2">
            {!isExpanded ? (
              <button onClick={() => setExpandedChart(id)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <Maximize2 size={18} />
              </button>
            ) : (
              <button onClick={() => setExpandedChart(null)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <X size={24} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <Component data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="mes" 
                axisLine={false} 
                tickLine={false} 
                fontSize={isExpanded ? 11 : 9} 
                tickFormatter={(tick, idx) => formatXAxis(tick, idx, isExpanded)}
                interval={0}
              />
              <YAxis axisLine={false} tickLine={false} fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Legend 
                onClick={toggleSeries}
                iconType="circle" 
                verticalAlign="bottom" 
                height={36} 
                wrapperStyle={{ fontSize: '11px', cursor: 'pointer' }}
              />
              {children.map((child, idx) => (
                React.cloneElement(child, { 
                  key: idx,
                  hide: hiddenSeries.has(child.props.dataKey) 
                })
              ))}
            </Component>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const chartsConfig = [
    { id: 'demand', title: 'Demanda vs. Capacidade', icon: TrendingUp, color: 'text-emerald-500', component: BarChart, children: [
      <Bar name="Abertas" dataKey="vagas_abertas_total" fill="#f97316" radius={[4, 4, 0, 0]} />,
      <Bar name="Fechadas" dataKey="vagas_fechadas_total" fill="#10b981" radius={[4, 4, 0, 0]} />
    ]},
    { id: 'reasons', title: 'Evolução dos Motivos', icon: PieChart, color: 'text-indigo-500', component: AreaChart, children: [
      <Area type="monotone" name="Substituição" dataKey="motivos.substituicao" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />,
      <Area type="monotone" name="Aumento" dataKey="motivos.aumento" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />,
      <Area type="monotone" name="Alocação" dataKey="motivos.alocacao" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
    ]},
    { id: 'backlog', title: 'Saúde do Backlog', icon: Activity, color: 'text-sky-500', component: BarChart, children: [
      <Bar name="Novas" dataKey="vagas_abertas_mes_vigente" stackId="a" fill="#0ea5e9" />,
      <Bar name="Legado" dataKey="vagas_abertas_legado" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
    ]},
    { id: 'sla', title: 'Tendência de SLA', icon: Clock, color: 'text-amber-500', component: LineChart, children: [
      <Line name="Fechamento" type="monotone" dataKey="tempo_medio_fechamento" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />,
      <Line name="Aging" type="monotone" dataKey="tempo_medio_abertas" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" />
    ]},
    { id: 'sources', title: 'Mix de Fontes', icon: Share2, color: 'text-indigo-500', component: AreaChart, children: [
      <Area type="monotone" name="Indicação" dataKey="fontes.indicacao" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />,
      <Area type="monotone" name="Candidatura" dataKey="fontes.candidatura" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />,
      <Area type="monotone" name="Hunting" dataKey="fontes.hunting" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />,
      <Area type="monotone" name="Terceirizada" dataKey="fontes.terceirizada" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />,
      <Area type="monotone" name="Interna" dataKey="fontes.interna" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
    ]}
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tendências e Evolução</h1>
          <p className="text-slate-500">Histórico mensal de performance e demanda</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none">
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {chartsConfig.map(config => (
          <div key={config.id}>
            {renderChart(config.id, config.title, config.icon, config.color, config.component, config.children)}
          </div>
        ))}
      </div>

      {expandedChart && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 md:p-12 flex items-center justify-center animate-in fade-in duration-300">
          <div className="w-full h-full max-w-7xl animate-in zoom-in-95 duration-300">
            {chartsConfig.filter(c => c.id === expandedChart).map(config => (
              renderChart(config.id, config.title, config.icon, config.color, config.component, config.children, true)
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
