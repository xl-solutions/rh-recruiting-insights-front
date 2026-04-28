# 📝 PRODUCT REQUIREMENTS DOCUMENT (PRD) - TASK: ABA 1 (VISÃO EXECUTIVA) CONEXÃO REAL

## 👤 1. USER STORY PRINCIPAL
**Como** membro da Diretoria (C-Level), 
**Quero** visualizar um painel resumo consolidado com os principais KPIs de Recrutamento e Seleção do mês, 
**Para que** eu possa entender rapidamente o volume de contratações, o tempo médio de fechamento (SLA) e se estamos focando em expansão ou reposição, sem precisar ler linhas de planilhas.

---

## 🔗 2. INTEGRAÇÃO DE DADOS (API E FETCH)
**NÃO utilize mock data.** O sistema deve ser conectado em tempo real à planilha original.
- **Variável de Ambiente:** A URL da planilha exportada em CSV deve ser configurada através de uma variável de ambiente (ex: `import.meta.env.VITE_GOOGLE_SHEETS_URL` para Vite ou `process.env.REACT_APP_GOOGLE_SHEETS_URL`).
- **Biblioteca:** Utilize a função nativa `fetch()` combinada com a biblioteca `PapaParse` para realizar o download do CSV e a conversão imediata para JSON no navegador.
- **Feedback Visual:** Implemente estados explícitos de `isLoading` (com um spinner/skeleton) e `hasError` (com mensagem de falha de conexão).

---

## 🧹 3. ESTRUTURA E NORMALIZAÇÃO DE DADOS (PARSER)
A aba "Report de Vagas" é preenchida por humanos. Logo após o `PapaParse` ler o CSV, você DEVE criar uma função `normalizeData(rawData)` para higienizar o array. 

**Regras de Higienização:**
1. Ignorar linhas onde o "Nome da Vaga" ou "Motivo de Abertura" estejam totalmente em branco.
2. Mapear as colunas brutas do CSV para as seguintes chaves padrão (keys) no array final:
   - `mes_referencia` (string: ex "Março/2026")
   - `data_abertura` (string ISO ou local)
   - `data_fechamento` (string ISO ou local - tratar vazios como null)
   - `area` (string: ex "Growth Team", "Delivery Team")
   - `motivo_abertura` (string: ex "Aumento de quadro", "Substituição")
   - `nome_vaga` (string)
   - `status_processo` (string: ex "Triagem", "Entrevista Gestor")
   - `status_final` (string: "Aberta", "Fechada", "Cancelada")
   - `recrutador` (string)
   - `fonte_candidato` (string: ex "Hunting", "Indicação" - preenchido apenas se status_final for "Fechada")

---

## 🧮 4. REGRAS DE NEGÓCIO E CÁLCULO DE KPIs (LÓGICA)
O componente deve processar os dados higienizados e calcular as seguintes métricas dinamicamente (recalculando sempre que um filtro for alterado):

1. **VAR total_vagas_trabalhadas:** Contagem total de objetos no array no mês filtrado.
2. **VAR total_vagas_abertas:** Contagem de objetos onde `status_final` (ou similar) indique vaga em andamento.
3. **VAR total_vagas_fechadas:** Contagem de objetos onde `status_final` indique vaga concluída.
4. **VAR taxa_fechamento:** `(total_vagas_fechadas / total_vagas_trabalhadas) * 100` (exibir em %).
5. **VAR tempo_medio_fechamento:**
   - Filtrar apenas vagas fechadas.
   - Calcular a diferença em dias entre `data_fechamento` e `data_abertura`.
   - Retornar a média desses dias (número inteiro).
6. **VAR tempo_medio_em_aberto:**
   - Filtrar apenas vagas abertas.
   - Calcular a diferença em dias entre `HOJE` (data atual do sistema) e a `data_abertura`.
   - Retornar a média desses dias (número inteiro).

*(Nota para o Desenvolvedor: Caso a aba atual não contenha as colunas de "data" explicitamente prontas, trate o tempo médio como 'N/A' temporariamente, mas deixe a lógica preparada).*

---

## 📊 5. ARQUITETURA DE INTERFACE (UI/UX LAYOUT)
Construa o layout utilizando Tailwind CSS em um sistema de grids moderno.

### 🎛️ FILTROS GLOBAIS (Header ou Sidebar)
- **Select/Dropdown:** Filtro por "Mês de Referência" (Default: Todos os meses).
- **Multi-select:** Filtro por "Área" (Default: Todas).
- **Multi-select:** Filtro por "Recrutador" (Default: Todos).

### 📈 SEÇÃO 1: BIG NUMBERS (Cards de Topo)
Exibir 4 cards em linha no topo da tela (grid de 4 colunas):
- **Card 1:** Total de Vagas Trabalhadas.
- **Card 2:** Vagas Abertas vs Fechadas.
- **Card 3:** Tempo Médio de Fechamento (Sufixo: "dias").
- **Card 4:** Tempo Médio de Vagas em Aberto (Sufixo: "dias").

### 📊 SEÇÃO 2: VISÃO ESTRATÉGICA (Grid 2 Colunas)
- **Gráfico Esquerda (Donut/Pie Chart):** "Distribuição por Motivo"
  - Agrupamento: `motivo_abertura`.
- **Gráfico Direita (Bar Chart Horizontal):** "Fonte de Contratação"
  - Agrupamento: `fonte_candidato` (Renderizar APENAS para vagas fechadas).

### 📉 SEÇÃO 3: SAÚDE DO FUNIL E CARGA DE TRABALHO (Grid 2 Colunas)
- **Gráfico Esquerda (Bar Chart Vertical ou Funil):** "Gargalo por Status do Processo"
  - Eixo X: `status_processo` / Eixo Y: Contagem de vagas.
  - Ordenar da maior contagem para a menor.
- **Gráfico Direita (Stacked Bar Chart Vertical):** "Carga por Recrutador"
  - Eixo X: `recrutador` / Eixo Y: Contagem de vagas (apenas Abertas).
  - Legenda/Cores (Stacked): Dividido por `area`.

### 📋 SEÇÃO 4: TABELA DE DETALHES GERAIS
- Renderizar um Data Grid interativo na base da página exibindo a lista higienizada.

---

## ✅ 6. CRITÉRIOS DE ACEITE (Definition of Done)
1. O código NÃO deve usar nenhum Mock de dados. A variável de ambiente é obrigatória.
2. A aplicação não deve "quebrar" (White Screen of Death) se o CSV retornar com colunas extras, células vazias ou textos mal formatados. Use tratamento seguro (`optional chaining` e fallbacks).
3. Entregar o código do componente devidamente documentado para deploy serverless via Firebase Hosting.