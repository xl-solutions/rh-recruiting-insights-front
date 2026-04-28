import { useState, useEffect, useCallback } from 'react';

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;
const SECRET_TOKEN = import.meta.env.VITE_APPS_SCRIPT_TOKEN;

export function useDashboardData() {
  const [executiveData, setExecutiveData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dropoutData, setDropoutData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeDropoutData = (rawMatrix) => {
    if (!rawMatrix || rawMatrix.length < 2) return [];

    return rawMatrix.slice(1).map(row => {
      const motivoRaw = row[6] ? row[6].toString().trim() : 'Não informado';
      
      // Normalização de Motivos (Regra de Negócio PRD)
      let motivoNormalizado = motivoRaw;
      if (motivoRaw.toLowerCase().includes('salarial') || motivoRaw.toLowerCase().includes('remuneração')) {
        motivoNormalizado = 'Salarial / Remuneração';
      } else if (motivoRaw.toLowerCase().includes('contraproposta')) {
        motivoNormalizado = 'Contraproposta';
      }

      return {
        recrutador: row[0] || 'N/A',
        mes_referencia: row[1] || 'N/A',
        area: row[2] || 'Outros',
        gestor: row[3] || 'N/A',
        vaga: row[4] || 'N/A',
        candidato: row[5] || 'N/A',
        motivo: motivoNormalizado,
        motivo_original: motivoRaw,
        explicacao: row[7] || 'Sem detalhamento'
      };
    }).filter(item => item.candidato !== 'N/A');
  };

  const normalizeMensalData = (rawMatrix) => {
    if (!rawMatrix || rawMatrix.length < 3) return [];
    const monthMap = {
      'janeiro': { short: 'Jan', order: 1 }, 'fevereiro': { short: 'Fev', order: 2 }, 
      'março': { short: 'Mar', order: 3 }, 'abril': { short: 'Abr', order: 4 }, 
      'maio': { short: 'Mai', order: 5 }, 'junho': { short: 'Jun', order: 6 }, 
      'julho': { short: 'Jul', order: 7 }, 'agosto': { short: 'Ago', order: 8 }, 
      'setembro': { short: 'Set', order: 9 }, 'outubro': { short: 'Out', order: 10 }, 
      'novembro': { short: 'Nov', order: 11 }, 'dezembro': { short: 'Dez', order: 12 }
    };

    let currentYear = "2026"; 
    const result = [];

    rawMatrix.slice(2).forEach(row => {
      const firstCol = row[0] ? row[0].toString().trim() : '';
      if (!firstCol) return;
      const yearMatch = firstCol.match(/20\d{2}/);
      if (yearMatch) { currentYear = yearMatch[0]; return; }
      const monthLower = firstCol.toLowerCase();
      const monthKey = Object.keys(monthMap).find(m => monthLower.startsWith(m));
      if (monthKey) {
        const vAbertas = Number(row[3]) || 0;
        const vFechadas = Number(row[10]) || 0;
        if (vAbertas === 0 && vFechadas === 0) return;
        const parseSLA = (val) => {
          if (!val) return 0;
          const cleaned = val.toString().replace(/\D/g, '');
          return parseInt(cleaned) || 0;
        };
        const mInfo = monthMap[monthKey];
        result.push({
          mes: `${mInfo.short}/${currentYear.slice(-2)}`,
          ano: currentYear,
          mes_index: mInfo.order,
          vagas_abertas_total: vAbertas,
          vagas_fechadas_total: vFechadas,
          motivos: {
            substituicao: Number(row[4]) || 0,
            aumento: Number(row[5]) || 0,
            alocacao: Number(row[6]) || 0
          },
          tempo_medio_fechamento: parseSLA(row[18]),
          tempo_medio_abertas: parseSLA(row[19]),
          fontes: {
            indicacao: Number(row[20]) || 0,
            candidatura: Number(row[21]) || 0,
            hunting: Number(row[22]) || 0,
            terceirizada: Number(row[23]) || 0,
            interna: Number(row[24]) || 0
          }
        });
      }
    });

    return result.sort((a, b) => {
      if (a.ano !== b.ano) return parseInt(a.ano) - parseInt(b.ano);
      return a.mes_index - b.mes_index;
    });
  };

  const fetchData = useCallback(async () => {
    if (!APPS_SCRIPT_URL) {
      setError("VITE_APPS_SCRIPT_URL não configurada");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // ABA 1
      const respVagas = await fetch(`${APPS_SCRIPT_URL}?token=${SECRET_TOKEN}&tab=vagas`);
      const dataVagas = await respVagas.json();
      setExecutiveData(dataVagas.jobs || []);
      setSummaryData(dataVagas.summary || null);

      // ABA 2
      const respMensal = await fetch(`${APPS_SCRIPT_URL}?token=${SECRET_TOKEN}&tab=mensal`);
      const dataMensal = await respMensal.json();
      if (!dataMensal.error) setMonthlyData(normalizeMensalData(dataMensal.rawMatrix));

      // ABA 3
      const respDesistencias = await fetch(`${APPS_SCRIPT_URL}?token=${SECRET_TOKEN}&tab=desistencias`);
      const dataDesistencias = await respDesistencias.json();
      if (!dataDesistencias.error) setDropoutData(normalizeDropoutData(dataDesistencias.rawMatrix));

      setError(null);
    } catch (err) {
      setError(err.message || "Erro ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { 
    executiveData, 
    summaryData, 
    monthlyData, 
    dropoutData, 
    isLoading, 
    error, 
    refresh: fetchData 
  };
}
