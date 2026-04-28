import React, { useMemo, useState } from 'react';
import { 
  Users, 
  Target, 
  Clock, 
  BarChart3, 
  Briefcase,
  PieChart as PieChartIcon,
  TrendingUp,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { KPICard } from '../components/KPICard';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ExecutiveView({ data, summary, isLoading, error }) {
  const [filterMonth, setFilterMonth] = useState('Todos');
  const [filterArea, setFilterArea] = useState('Todas');

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        <span className="ml-4 text-slate-600">Carregando insights...</span>
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
          className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Executiva</h1>
          <p className="text-slate-500">Acompanhamento de KPIs e metas de recrutamento</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
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
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
            >
              <option value="Todas">Área: Todas</option>
              {areasDisponiveis.filter(a => a !== 'Todas').map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-sky-500" />
            Distribuição por Motivo
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reasonData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reasonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            Fonte de Contratação
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Gargalo por Status do Processo</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10}
                  interval={0}
                />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Carga por Recrutador (Apenas Abertas)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recruiterData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip />
                <Legend />
                {areasDisponiveis.filter(a => a !== 'Todas').map((area, index) => (
                  <Bar 
                    key={area} 
                    dataKey={area} 
                    stackId="a" 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
