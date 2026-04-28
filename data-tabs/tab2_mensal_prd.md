# 📝 PRODUCT REQUIREMENTS DOCUMENT (PRD) - TASK: ABA 2 (TENDÊNCIAS HISTÓRICAS)

## 👤 1. USER STORY PRINCIPAL
**Como** membro da Diretoria (C-Level) e Liderança de RH, 
**Quero** visualizar a evolução histórica dos KPIs de Recrutamento ao longo dos meses num painel de tendências, 
**Para que** eu possa identificar gargalos sistémicos, avaliar a capacidade de entrega da equipa (throughput) e tomar decisões sobre o aumento ou redução do ritmo de contratações.

---

## 🔗 2. INTEGRAÇÃO DE DADOS E PARSING (A REGRA DE OURO DESTA ABA)
O ficheiro CSV de origem ("Mensal") possui cabeçalhos duplos e linhas de separação de ano. O `PapaParse` NÃO deve tentar inferir as chaves (keys) pelos cabeçalhos.

**Regras estritas para o PapaParse e Normalização:**
1. Configure o `PapaParse` para ler o CSV como um Array de Arrays (ex: `header: false`).
2. Crie a função `normalizeMensalData(rawMatrix)`.
3. **Descarte** as linhas de índice 0 e 1 (que são os cabeçalhos visuais).
4. **Filtre** linhas onde a primeira coluna (Mês) esteja vazia ou contenha apenas um ano (ex: "2024", "2025"). Mantenha apenas as linhas onde a coluna 0 seja o nome de um mês (ex: "Janeiro", "Fevereiro").
5. **Mapeamento por Índice (Index Mapping):** Transforme cada linha válida num objeto JSON com a seguinte estrutura e faça o *parse* para números (substituindo células vazias por `0`):
   - `mes`: `row[0]` (string)
   - `vagas_abertas_legado`: `Number(row[1])`
   - `vagas_abertas_mes_vigente`: `Number(row[2])`
   - `vagas_abertas_total`: `Number(row[3])`
   - `vagas_fechadas_total`: `Number(row[10])`
   - `tempo_medio_fechamento`: `row[18]` (Fazer um `.replace(/\D/g, '')` para extrair apenas os números da string "32 dias", "44", etc. Se vazio, `0`).
   - `tempo_medio_abertas`: `row[19]` (Extrair apenas números. Se vazio, `0`).
   - `fonte_indicacao`: `Number(row[20])`
   - `fonte_candidatura`: `Number(row[21])`
   - `fonte_hunting`: `Number(row[22])`
   - `fonte_terceirizada`: `Number(row[23])`
   - `fonte_interna`: `Number(row[24])`

---

## 📊 3. ARQUITETURA DE INTERFACE E GRÁFICOS (UI/UX LAYOUT)
Utilize Tailwind CSS e renderize os gráficos numa disposição de Dashboard (Recharts ou Plotly.js).

### 🎛️ CABEÇALHO (Header)
- Título da Página: "Tendências e Evolução (Histórico Mensal)".
- *Nota: Não há filtros globais complexos aqui, pois o objetivo é ver a série temporal completa. Apenas um controlo de "Ano" se quiser implementar como bónus, assumindo os dados do último ano como padrão.*

### 📈 LINHA 1: EFICIÊNCIA DE FUNIL E CAPACIDADE (Grid 2 Colunas)
- **Gráfico 1 (Line Chart ou Bar Chart Duplo): "Demanda vs. Capacidade"**
  - Eixo X: `mes`
  - Série 1 (Linha/Barra): `vagas_abertas_total` (Cor: Vermelho ou Laranja)
  - Série 2 (Linha/Barra): `vagas_fechadas_total` (Cor: Verde ou Azul)
  - Objetivo: Comparar a velocidade com que as vagas entram vs. a velocidade com que são fechadas.

- **Gráfico 2 (Stacked Bar Chart): "Saúde do Backlog (Envelhecimento)"**
  - Eixo X: `mes`
  - Série Empilhada 1 (Base): `vagas_abertas_mes_vigente` (Vagas novas)
  - Série Empilhada 2 (Topo): `vagas_abertas_legado` (Vagas arrastadas do mês anterior)
  - Objetivo: Identificar se o volume de vagas "presas" de meses passados está a crescer.

### 📉 LINHA 2: SLA E ORIGEM DE TALENTOS (Grid 2 Colunas)
- **Gráfico 3 (Line Chart): "Tendência de SLA (Tempo de Fechamento)"**
  - Eixo X: `mes`
  - Série 1: `tempo_medio_fechamento` (Em dias)
  - Série 2: `tempo_medio_abertas` (Em dias)
  - Objetivo: Mostrar se a equipa de recrutamento está a ficar mais rápida ou mais lenta ao longo do ano.

- **Gráfico 4 (100% Stacked Bar Chart ou Area Chart): "Evolução da Fonte de Contratação"**
  - Eixo X: `mes`
  - Séries Empilhadas: `fonte_indicacao`, `fonte_candidatura`, `fonte_hunting`, `fonte_terceirizada`, `fonte_interna`.
  - Objetivo: Visualizar como a dependência dos canais de atração de talento mudou ao longo do tempo.

---

## ✅ 4. CRITÉRIOS DE ACEITE (Definition of Done)
1. O código NÃO deve quebrar por causa das strings misturadas com números na coluna de SLA (ex: o RH digitou "32 dias úteis" no CSV). O sistema deve isolar rigorosamente a componente numérica.
2. Células vazias nas contagens das fontes ou motivos devem ser lidas matematicamente como `0` e não como `NaN` ou `null` nos gráficos.
3. Seguir restritamente a stack de tecnologias Serverless/Frontend ditada no `system_prompt.md`.