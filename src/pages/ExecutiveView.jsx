import React, { useMemo, useState } from 'react';
import { 
  Users, Target, Clock, BarChart3, Briefcase,
  PieChart as PieChartIcon, TrendingUp, Filter,
  Maximize2, X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { clsx } from 'clsx';
import { KPICard } from '../components/KPICard';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4', '#f43f5e'];

export default function ExecutiveView({ data, summary, isLoading, error }) {
  const [filterMonth, setFilterMonth] = useState('Todos');
  const [filterArea, setFilterArea] = useState('Todas');
  const [expandedChart, setExpandedChart] = useState(null);
  const [hiddenSeries, setHiddenSeries] = useState(new Set());

  // Cálculo de Métricas Estratégicas
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return { total: 0, fechadas: 0, abertas: 0, taxaFechamento: 0, avgSla: 'N/A', avgOpen: 'N/A' };
    
    const isFiltered = filterMonth !== 'Todos' || filterArea !== 'Todas';
    
    if (!isFiltered && summary) {
      const fechadas = data.filter(d => d.status_final === 'Fechada').length;
      const totalOficial = parseInt(summary.total_vagas_trabalhadas) || data.length;
      
      return {
        total: totalOficial,
        fechadas: fechadas,
        abertas: data.filter(d => d.status_final === 'Aberta').length,
        taxaFechamento: (fechadas / (totalOficial || 1)) * 100,
        avgSla: summary.tempo_medio_fechamento || 'N/A',
        avgOpen: summary.tempo_medio_aberto || 'N/A'
      };
    }

    const filtered = data.filter(d => {
      const matchMonth = filterMonth === 'Todos' || d.mes_referencia === filterMonth;
      const matchArea = filterArea === 'Todas' || d.area === filterArea;
      return matchMonth && matchArea;
    });

    const total = filtered.length;
    const fechadas = filtered.filter(d => d.status_final === 'Fechada').length;
    const abertas = filtered.filter(d => d.status_final === 'Aberta').length;

    return {
      total,
      fechadas,
      abertas,
      taxaFechamento: (fechadas / (total || 1)) * 100,
      avgSla: 'Filtrado',
      avgOpen: 'Filtrado'
    };
  }, [data, summary, filterMonth, filterArea]);

  // Dados para os Gráficos
  const reasonData = useMemo(() => {
    const filtered = data.filter(d => {
      const matchMonth = filterMonth === 'Todos' || d.mes_referencia === filterMonth;
      const matchArea = filterArea === 'Todas' || d.area === filterArea;
      return matchMonth && matchArea;
    });
    const counts = filtered.reduce((acc, curr) => {
      const motivo = curr.motivo_abertura || 'Outros';
      acc[motivo] = (acc[motivo] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data, filterMonth, filterArea]);

  const sourceData = useMemo(() => {
    const isFiltered = filterMonth !== 'Todos' || filterArea !== 'Todas';
    if (!isFiltered && summary && summary.fontes) {
      return Object.entries(summary.fontes)
        .filter(([_, value]) => value !== "" && value !== 0 && !isNaN(parseInt(value)))
        .map(([name, value]) => ({ name, value: parseInt(value) }));
    }
    return [];
  }, [summary, filterMonth, filterArea]);

  const statusData = useMemo(() => {
    const filtered = data.filter(d => {
      const matchMonth = filterMonth === 'Todos' || d.mes_referencia === filterMonth;
      const matchArea = filterArea === 'Todas' || d.area === filterArea;
      return matchMonth && matchArea;
    });
    const counts = filtered.reduce((acc, curr) => {
      const status = curr.status_processo || 'N/A';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data, filterMonth, filterArea]);

  const recruiterData = useMemo(() => {
    const abertas = data.filter(d => d.status_final === 'Aberta');
    const counts = abertas.reduce((acc, curr) => {
      const rec = curr.recrutador || 'Não Atribuído';
      const area = curr.area || 'Outras';
      if (!acc[rec]) acc[rec] = { name: rec };
      acc[rec][area] = (acc[rec][area] || 0) + 1;
      return acc;
    }, {});
    return Object.values(counts);
  }, [data]);

  const areasDisponiveis = useMemo(() => {
    return ['Todas', ...new Set(data.map(d => d.area))];
  }, [data]);

  const toggleSeries = (e) => {
    const key = e.dataKey;
    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderChart = (id, title, Icon, color, ChartComponent, chartData, children, isExpanded = false, layout = 'horizontal') => {
    const Component = ChartComponent;
    const iconColor = isExpanded ? color.replace('text-', 'bg-').replace('500', '100') : "";

    return (
      <div className={clsx(
        "bg-white rounded-2xl border border-slate-100 flex flex-col transition-all",
        isExpanded ? "w-full h-full p-8" : "p-6 shadow-sm h-[400px]"
      )}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={clsx("font-bold text-slate-900 flex items-center gap-2", isExpanded ? "text-2xl" : "text-base")}>
            <div className={clsx("p-2 rounded-lg", isExpanded ? iconColor : "")}>
              <Icon className={clsx(color, isExpanded ? "w-8 h-8" : "w-5 h-5")} />
            </div>
            {title}
          </h3>
          <div className="flex items-center gap-2">
            {!isExpanded ? (
              <button 
                onClick={() => setExpandedChart(id)} 
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                title="Expandir gráfico"
              >
                <Maximize2 size={18} />
              </button>
            ) : (
              <button 
                onClick={() => setExpandedChart(null)} 
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
                title="Fechar"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <Component data={chartData} layout={layout}>
              {ChartComponent !== PieChart && (
                <>
                  <CartesianGrid strokeDasharray="3 3" vertical={layout === 'vertical' ? true : false} horizontal={layout === 'vertical' ? false : true} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey={layout === 'vertical' ? undefined : "name"} 
                    type={layout === 'vertical' ? 'number' : 'category'}
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={isExpanded ? 12 : 10} 
                    interval={0}
                    hide={layout === 'vertical'}
                    angle={id === 'status' && !isExpanded ? -15 : 0}
                    textAnchor={id === 'status' && !isExpanded ? "end" : "middle"}
                    height={id === 'status' && !isExpanded ? 50 : 30}
                  />
                  <YAxis 
                    dataKey={layout === 'vertical' ? "name" : undefined}
                    type={layout === 'vertical' ? 'category' : 'number'}
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={11}
                    width={layout === 'vertical' ? 100 : 30}
                  />
                </>
              )}
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend 
                onClick={id === 'recruiter' ? toggleSeries : undefined}
                iconType="circle" 
                verticalAlign="bottom" 
                height={36} 
                wrapperStyle={{ fontSize: '11px', cursor: id === 'recruiter' ? 'pointer' : 'default' }}
              />
              {children && Array.isArray(children) ? children.map((child, idx) => (
                React.cloneElement(child, { 
                  key: idx,
                  hide: id === 'recruiter' ? hiddenSeries.has(child.props.dataKey) : false
                })
              )) : children}
            </Component>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        <span className="ml-4 text-slate-600 font-medium">Carregando visão executiva...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <div className="bg-red-100 p-6 rounded-full text-red-600 mb-4">
          <TrendingUp className="w-12 h-12 rotate-180" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Erro na conexão</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors shadow-lg shadow-sky-100"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const chartsConfig = [
    { 
      id: 'reasons', 
      title: 'Distribuição por Motivo', 
      icon: PieChartIcon, 
      color: 'text-sky-500', 
      component: PieChart, 
      data: reasonData,
      children: (
        <Pie
          data={reasonData}
          innerRadius="60%"
          outerRadius="80%"
          paddingAngle={5}
          dataKey="value"
        >
          {reasonData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      )
    },
    { 
      id: 'sources', 
      title: 'Fonte de Contratação', 
      icon: BarChart3, 
      color: 'text-emerald-500', 
      component: BarChart, 
      data: sourceData,
      layout: 'vertical',
      children: [
        <Bar name="Contratações" dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
      ]
    },
    { 
      id: 'status', 
      title: 'Gargalo por Status do Processo', 
      icon: TrendingUp, 
      color: 'text-indigo-500', 
      component: BarChart, 
      data: statusData,
      children: [
        <Bar name="Vagas" dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
      ]
    },
    { 
      id: 'recruiter', 
      title: 'Carga por Recrutador (Apenas Abertas)', 
      icon: Briefcase, 
      color: 'text-amber-500', 
      component: BarChart, 
      data: recruiterData,
      children: areasDisponiveis.filter(a => a !== 'Todas').map((area, index) => (
        <Bar 
          key={area} 
          name={area}
          dataKey={area} 
          stackId="a" 
          fill={COLORS[index % COLORS.length]} 
        />
      ))
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header com Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visão Executiva</h1>
          <p className="text-slate-500">Acompanhamento de KPIs e metas estratégicas</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Mês: Todos</option>
              <option value="Janeiro/2026">Janeiro</option>
              <option value="Fevereiro/2026">Fevereiro</option>
              <option value="Março/2026">Março</option>
              <option value="Abril/2026">Abril</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <select 
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="Todas">Área: Todas</option>
              {areasDisponiveis.filter(a => a !== 'Todas').map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Vagas Trabalhadas" 
          value={metrics.total} 
          subtitle="Total no período" 
          icon={Briefcase}
          color="blue"
        />
        <KPICard 
          title="Taxa de Fechamento" 
          value={`${metrics.taxaFechamento.toFixed(1)}%`} 
          subtitle={`${metrics.fechadas} fechadas / ${metrics.total} total`}
          icon={Target}
          color="green"
        />
        <KPICard 
          title="SLA Médio" 
          value={metrics.avgSla} 
          subtitle="Tempo p/ fechamento" 
          icon={Clock}
          color="amber"
        />
        <KPICard 
          title="Aging Médio" 
          value={metrics.avgOpen} 
          subtitle="Vagas em aberto" 
          icon={Clock}
          color="slate"
        />
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {chartsConfig.map(config => (
          <div key={config.id}>
            {renderChart(
              config.id, 
              config.title, 
              config.icon, 
              config.color, 
              config.component, 
              config.data, 
              config.children,
              false,
              config.layout
            )}
          </div>
        ))}
      </div>

      {/* Modal de Gráfico Expandido */}
      {expandedChart && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 md:p-12 flex items-center justify-center animate-in fade-in duration-300">
          <div className="w-full h-full max-w-7xl animate-in zoom-in-95 duration-300">
            {chartsConfig.filter(c => c.id === expandedChart).map(config => (
              <div key={config.id} className="h-full">
                {renderChart(
                  config.id, 
                  config.title, 
                  config.icon, 
                  config.color, 
                  config.component, 
                  config.data, 
                  config.children, 
                  true,
                  config.layout
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
