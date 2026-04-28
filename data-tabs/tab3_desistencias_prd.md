# 📝 PRODUCT REQUIREMENTS DOCUMENT (PRD) - TASK: ABA 3 (ANÁLISE DE DESISTÊNCIAS)

## 👤 1. USER STORY PRINCIPAL
**Como** Gestor de Talent Acquisition, 
**Quero** identificar os principais motivos pelos quais os candidatos declinam nossas propostas ou abandonam o processo, 
**Para que** eu possa ajustar a estratégia de remuneração, melhorar a experiência do candidato ou alinhar expectativas com os gestores das vagas.

---

## 📥 2. ESTRUTURA DE DADOS (SCHEMA)
O componente consumirá a aba "Desistência Candidatos". O CSV deve ser mapeado para as seguintes chaves:
- `recrutador`: (string)
- `mes_referencia`: (string: ex "janeiro/2025") -> *Nota: Tratar para formato de data se necessário para ordenação.*
- `area`: (string)
- `gestor`: (string)
- `vaga`: (string)
- `candidato`: (string)
- `motivo`: (string: ex "Expectativa Salarial", "Contraproposta", "Outro")
- `explicacao`: (string: Texto longo com o detalhamento)

---

## 🧮 3. REGRAS DE NEGÓCIO E LÓGICA
O processamento deve focar em volumes e proporções:

1. **VAR total_desistencias:** Contagem total de registros no período filtrado.
2. **VAR principal_motivo:** O motivo que aparece com maior frequência no dataset filtrado.
3. **VAR taxa_perda_salarial:** Percentual de desistências onde o motivo contém "Salarial" ou "Remuneração".
4. **Normalização de Motivos:** O código deve agrupar motivos similares (ex: "Expectativa Salarial" e "Pretensão Salarial") para evitar duplicidade nos gráficos.

---

## 📊 4. ARQUITETURA DE INTERFACE (UI/UX LAYOUT)

### 🎛️ FILTROS GLOBAIS
- Filtro por Mês (Baseado em `mes_referencia`).
- Filtro por Área.
- Filtro por Recrutador.

### 📈 SEÇÃO 1: METRIC CARDS (Big Numbers)
- **Card 1:** Total de Desistências.
- **Card 2:** Motivo Mais Frequente (Exibir o nome do motivo e a contagem).
- **Card 3:** % Impacto Financeiro (Desistências por salário / Total).

### 📊 SEÇÃO 2: ANÁLISE QUALITATIVA (Grid 2 Colunas)
- **Gráfico 1 (Pareto / Bar Chart Horizontal): "Ranking de Motivos"**
  - Eixo Y: Motivo de Desistência.
  - Eixo X: Quantidade de Candidatos.
  - *Insight:* Qual é a principal "dor" do recrutamento?
- **Gráfico 2 (Bar Chart Vertical): "Desistências por Área"**
  - Eixo X: Área.
  - Eixo Y: Quantidade.
  - *Insight:* Existe alguma área específica com maior dificuldade de fechamento?

### 📉 SEÇÃO 3: TENDÊNCIA TEMPORAL
- **Gráfico 3 (Line Chart): "Evolução de Desistências"**
  - Eixo X: Mês.
  - Eixo Y: Quantidade de desistências.
  - *Insight:* O volume de perdas está aumentando?

### 📋 SEÇÃO 4: DETALHAMENTO (A "Voz do Candidato")
- **Tabela de Feedbacks:** Lista contendo `Vaga`, `Candidato`, `Motivo` e a `Explicação` completa.
- **Dica de UI:** A coluna "Explicação" deve ter suporte a expansão de texto ou Tooltip, pois os textos podem ser longos.

---

## ✅ 5. CRITÉRIOS DE ACEITE (DoD)
1. O gráfico de motivos deve ignorar registros onde o campo "Motivo" esteja vazio.
2. A tabela de detalhes deve ser pesquisável por nome de vaga ou candidato.
3. O design deve manter a consistência com as Abas 1 e 2 (cores, tipografia e espaçamento) conforme o `system_prompt.md`.