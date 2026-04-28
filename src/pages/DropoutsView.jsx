import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  Users, AlertTriangle, DollarSign, Search, 
  ChevronDown, ChevronUp, Filter, MessageSquare,
  Calendar, UserCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { KPICard } from '../components/KPICard';

export default function DropoutsView({ data, isLoading, error }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    mes: 'Todos',
    area: 'Todos',
    recrutador: 'Todos'
  });
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Utilitário para converter "mês/ano" em valor comparável para ordenação
  const getMonthScore = (mesRef) => {
    if (!mesRef || mesRef === 'N/A') return 0;
    const [mes, ano] = mesRef.toLowerCase().split('/');
    const months = {
      'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4, 'maio': 5, 'junho': 6,
      'julho': 7, 'agosto': 8, 'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
    };
    const monthNum = months[mes] || 0;
    const yearNum = parseInt(ano) || 0;
    return (yearNum * 100) + monthNum;
  };

  // Opções de Filtro
  const filterOptions = useMemo(() => {
    const uniqueMonths = [...new Set(data.map(d => d.mes_referencia))].sort((a, b) => getMonthScore(a) - getMonthScore(b));
    const uniqueAreas = [...new Set(data.map(d => d.area))].sort();
    const uniqueRecs = [...new Set(data.map(d => d.recrutador))].sort();
    
    return {
      meses: ['Todos', ...uniqueMonths],
      areas: ['Todos', ...uniqueAreas],
      recrutadores: ['Todos', ...uniqueRecs]
    };
  }, [data]);

  // Aplicação de Filtros e Busca
  const filteredData = useMemo(() => {
    return data.filter(d => {
      const matchMes = filters.mes === 'Todos' || d.mes_referencia === filters.mes;
      const matchArea = filters.area === 'Todos' || d.area === filters.area;
      const matchRec = filters.recrutador === 'Todos' || d.recrutador === filters.recrutador;
      const matchSearch = 
        d.candidato.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.vaga.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchMes && matchArea && matchRec && matchSearch;
    });
  }, [data, filters, searchTerm]);

  // Métricas (Big Numbers)
  const metrics = useMemo(() => {
    const total = filteredData.length;
    
    const counts = {};
    let maxCount = 0;
    let mainReason = 'N/A';
    let financialImpactCount = 0;

    filteredData.forEach(d => {
      if (!d.motivo || d.motivo === 'N/A') return;
      counts[d.motivo] = (counts[d.motivo] || 0) + 1;
      if (counts[d.motivo] > maxCount) {
        maxCount = counts[d.motivo];
        mainReason = d.motivo;
      }
      // Regra PRD: Motivo contém "Salarial" ou "Remuneração"
      if (d.motivo.toLowerCase().includes('salarial') || d.motivo.toLowerCase().includes('remuneração')) {
        financialImpactCount++;
      }
    });

    const financialPercent = total > 0 ? ((financialImpactCount / total) * 100).toFixed(1) : 0;
    const mainReasonDisplay = total > 0 ? `${mainReason} (${maxCount})` : 'N/A';

    return { total, mainReasonDisplay, financialPercent };
  }, [filteredData]);

  // Dados para Gráfico: Ranking de Motivos
  const chartReasons = useMemo(() => {
    const counts = {};
    filteredData.forEach(d => { 
      if (d.motivo && d.motivo !== 'N/A') {
        counts[d.motivo] = (counts[d.motivo] || 0) + 1; 
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Dados para Gráfico: Desistências por Área
  const chartAreas = useMemo(() => {
    const counts = {};
    filteredData.forEach(d => { counts[d.area] = (counts[d.area] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Dados para Gráfico: Evolução Temporal
  const chartTimeline = useMemo(() => {
    const counts = {};
    filteredData.forEach(d => {
      counts[d.mes_referencia] = (counts[d.mes_referencia] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([mes, value]) => ({ mes, value }))
      .sort((a, b) => getMonthScore(a.mes) - getMonthScore(b.mes));
  }, [filteredData]);

  const toggleRow = (idx) => {
    const next = new Set(expandedRows);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedRows(next);
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Carregando análise de desistências...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-medium">Erro: {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Cabeçalho com Filtros */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Análise de Desistências</h1>
          <p className="text-slate-500 mt-1">Monitoramento de motivos de declínio e evasão no funil</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Vaga ou candidato..."
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all w-48 xl:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="h-8 w-px bg-slate-100 mx-1" />

          {/* Filtro Mês */}
          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select 
              className="text-xs font-bold text-slate-600 bg-transparent outline-none cursor-pointer"
              value={filters.mes}
              onChange={(e) => setFilters({...filters, mes: e.target.value})}
            >
              {filterOptions.meses.map(m => <option key={m} value={m}>{m === 'Todos' ? 'Meses (Todos)' : m}</option>)}
            </select>
          </div>

          {/* Filtro Área */}
          <div className="flex items-center gap-2 px-2 border-l border-slate-100">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="text-xs font-bold text-slate-600 bg-transparent outline-none cursor-pointer"
              value={filters.area}
              onChange={(e) => setFilters({...filters, area: e.target.value})}
            >
              {filterOptions.areas.map(a => <option key={a} value={a}>{a === 'Todos' ? 'Áreas (Todas)' : a}</option>)}
            </select>
          </div>

          {/* Filtro Recrutador */}
          <div className="flex items-center gap-2 px-2 border-l border-slate-100">
            <UserCheck className="w-4 h-4 text-slate-400" />
            <select 
              className="text-xs font-bold text-slate-600 bg-transparent outline-none cursor-pointer"
              value={filters.recrutador}
              onChange={(e) => setFilters({...filters, recrutador: e.target.value})}
            >
              {filterOptions.recrutadores.map(r => <option key={r} value={r}>{r === 'Todos' ? 'Recrutadores (Todos)' : r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Total Desistências" value={metrics.total} icon={Users} color="blue" />
        <KPICard title="Motivo Mais Frequente" value={metrics.mainReasonDisplay} icon={AlertTriangle} color="amber" />
        <KPICard title="Impacto Financeiro" value={`${metrics.financialPercent}%`} icon={DollarSign} color="red" />
      </div>

      {/* Gráficos de Motivo e Área */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Ranking de Motivos</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase">Pareto</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartReasons} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={11} width={130} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Desistências por Área</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartAreas}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráfico de Evolução Temporal */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6">Evolução de Desistências (Histórico)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartTimeline} margin={{ left: -20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} fontSize={11} />
              <YAxis axisLine={false} tickLine={false} fontSize={11} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Detalhes */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-brand-100 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-none">Voz do Candidato</h3>
              <p className="text-xs text-slate-500 mt-1">Detalhamento qualitativo dos feedbacks</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 shadow-sm">
            {filteredData.length} REGISTROS ENCONTRADOS
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b border-slate-100">Vaga / Candidato</th>
                <th className="px-6 py-4 border-b border-slate-100">Motivo</th>
                <th className="px-6 py-4 border-b border-slate-100">Área / Gestor</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length > 0 ? filteredData.map((row, idx) => (
                <React.Fragment key={idx}>
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">{row.vaga}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Users size={10} className="text-slate-300" />
                        {row.candidato}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2 py-1 rounded-md text-[10px] font-bold inline-block",
                        row.motivo.includes('Salarial') ? "bg-red-50 text-red-600 border border-red-100" : 
                        row.motivo.includes('Contraproposta') ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        "bg-slate-100 text-slate-600 border border-slate-200"
                      )}>
                        {row.motivo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-700">{row.area}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{row.gestor}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleRow(idx)}
                        className={clsx(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                          expandedRows.has(idx) 
                            ? "bg-brand-600 text-white shadow-lg shadow-brand-200" 
                            : "bg-brand-50 text-brand-600 hover:bg-brand-100"
                        )}
                      >
                        {expandedRows.has(idx) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {expandedRows.has(idx) ? 'Fechar' : 'Explicação'}
                      </button>
                    </td>
                  </tr>
                  {expandedRows.has(idx) && (
                    <tr className="bg-slate-50/40">
                      <td colSpan="4" className="px-6 py-6">
                        <div className="relative p-5 bg-white border border-brand-100 rounded-2xl shadow-inner animate-in slide-in-from-top-2 duration-300">
                          <div className="absolute top-0 left-6 -translate-y-1/2 w-4 h-4 bg-white border-t border-l border-brand-100 rotate-45" />
                          <div className="flex gap-4">
                            <div className="mt-1 bg-brand-50 p-2 rounded-full h-fit">
                              <MessageSquare className="w-4 h-4 text-brand-600" />
                            </div>
                            <div className="flex-1">
                              <div className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-2">Feedback Detalhado</div>
                              <p className="text-sm text-slate-600 leading-relaxed italic pr-4">
                                "{row.explicacao}"
                              </p>
                              <div className="mt-4 flex items-center gap-4 text-[10px] text-slate-400 font-medium">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {row.mes_referencia}</span>
                                <span className="flex items-center gap-1"><UserCheck size={12} /> Recrutador: {row.recrutador}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
