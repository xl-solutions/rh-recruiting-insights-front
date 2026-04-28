/**
 * GOOGLE APPS SCRIPT - API MULTI-ABA RECRUITING INSIGHTS
 * 
 * Versão: 1.2 (Suporte para Aba 3 - Desistências)
 * Instruções: 
 * 1. Cole este código no Apps Script da sua Planilha.
 * 2. Clique em 'Implantar' > 'Nova Implantação'.
 * 3. Escolha 'App da Web' e 'Qualquer pessoa' em quem pode acessar.
 * 4. Copie a URL gerada e coloque no seu arquivo .env (VITE_APPS_SCRIPT_URL).
 */

const SECRET_TOKEN = "rh_analytics_2024_seguro"; 

function doGet(e) {
  const token = e.parameter.token;
  const tab = e.parameter.tab || "vagas"; 
  
  if (token !== SECRET_TOKEN) {
    return createJsonResponse({ error: "Token inválido ou ausente" });
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // ==========================================
    // ABA 1: REPORT DE VAGAS
    // ==========================================
    if (tab === "vagas") {
      const sheet = ss.getSheetByName("Report de Vagas");
      if (!sheet) return createJsonResponse({ error: "Aba 'Report de Vagas' não encontrada" });
      
      const allValues = sheet.getDataRange().getValues();
      
      // Captura de KPIs consolidados (Baseado no layout da planilha do cliente)
      const resumoRH = {
        total_vagas_trabalhadas: sheet.getRange("M9").getValue(),
        tempo_medio_fechamento: sheet.getRange("M10").getValue(),
        tempo_medio_aberto: sheet.getRange("M17").getValue(),
        fontes: {
          "Indicação": sheet.getRange("P11").getValue(),
          "Candidatura": sheet.getRange("Q11").getValue(),
          "Hunting": sheet.getRange("R11").getValue(),
          "Terceirizada": sheet.getRange("S11").getValue(),
          "Interna": sheet.getRange("T11").getValue()
        }
      };

      let currentArea = "Geral";
      const jobs = [];
      
      allValues.forEach((row, index) => {
        if (index < 1) return; // Pula cabeçalho
        
        const colA = row[0] ? row[0].toString().trim() : "";
        const nomeVaga = row[2] ? row[2].toString().trim() : "";
        const status = row[3] ? row[3].toString().trim() : "";
        
        // Lógica de detecção de área (linhas que contém o nome da área)
        if (colA !== "" && colA.length < 50 && !colA.includes("Juliana")) {
          currentArea = colA.split('\n')[0].replace("Total:", "").trim();
        }
        
        // Filtra apenas linhas que são de fato vagas
        if (nomeVaga !== "" && nomeVaga.length > 3 && !nomeVaga.includes("Vagas Abertas")) {
          jobs.push({
            area: currentArea,
            motivo_abertura: row[1] || "N/A",
            nome_vaga: nomeVaga,
            status_processo: status,
            status_final: (status === "Concluída" || status === "Fechada") ? "Fechada" : "Aberta",
            recrutador: row[6] || "Time RH",
            mes_referencia: row[10] || "" // Caso precise filtrar por mês na visão executiva
          });
        }
      });
      
      return createJsonResponse({ summary: resumoRH, jobs: jobs });
    } 
    
    // ==========================================
    // ABA 2: MENSAL (HISTÓRICO)
    // ==========================================
    else if (tab === "mensal") {
      const sheet = ss.getSheetByName("Mensal");
      if (!sheet) return createJsonResponse({ error: "Aba 'Mensal' não encontrada" });
      
      const rawData = sheet.getDataRange().getValues();
      return createJsonResponse({ rawMatrix: rawData });
    }

    // ==========================================
    // ABA 3: DESISTÊNCIAS (NOVO)
    // ==========================================
    else if (tab === "desistencias") {
      const sheet = ss.getSheetByName("Desistência Candidatos");
      if (!sheet) return createJsonResponse({ error: "Aba 'Desistência Candidatos' não encontrada" });
      
      const rawData = sheet.getDataRange().getValues();
      
      // Retorna a matriz bruta para processamento no frontend (PapaParse style)
      return createJsonResponse({ rawMatrix: rawData });
    }

    // Caso a aba não seja reconhecida
    return createJsonResponse({ error: "Parâmetro 'tab' inválido ou não suportado" });

  } catch (err) {
    return createJsonResponse({ error: "Erro no Servidor: " + err.toString() });
  }
}

/**
 * Utilitário para formatar resposta JSON com Headers de CORS
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
