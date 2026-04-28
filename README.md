# Recruiting Insights Dashboard

Dashboard estratégico para acompanhamento de KPIs de recrutamento, integrado diretamente com o Google Sheets através de uma API Serverless.

## 🚀 Tecnologias
- **Frontend:** React + Vite + TailwindCSS
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **Integração:** Google Apps Script (Backend as a Service)

## 🏗️ Arquitetura de Dados
O sistema utiliza uma arquitetura baseada em **Google Apps Script** para transformar planilhas complexas de RH em dados JSON estruturados.

### Fluxo de Dados:
1. O RH atualiza a planilha **"Report de Vagas"**.
2. O Dashboard (React) faz uma requisição HTTPS para o Web App do Google.
3. O Script valida o `SECRET_TOKEN`.
4. O Script extrai métricas oficiais (M9, M10, M17) e a lista de vagas (Colunas A-D).
5. O Dashboard renderiza os KPIs e gráficos dinâmicos.

## ⚙️ Configuração Local

### 1. Requisitos
- Node.js (v18+)
- Conta Google (para o Apps Script)

### 2. Variáveis de Ambiente (`.env`)
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
VITE_APPS_SCRIPT_TOKEN=seu_token_aqui
```

### 3. Instalação
```bash
npm install
npm run dev
```

## 📊 Estrutura da Planilha Suportada
O sistema espera uma aba chamada `Report de Vagas` com a seguinte estrutura:
- **Célula M9:** Total de vagas trabalhadas no mês.
- **Célula M10:** SLA médio de fechamento.
- **Célula M17:** Aging médio (vagas em aberto).
- **Colunas A-D:** Lista de vagas (Área, Motivo, Nome da Vaga, Status).

## 🔒 Segurança
A integração é protegida por um token de segurança validado no lado do servidor (Apps Script), impedindo que usuários externos acessem os dados sem a chave correta.

---
*Para detalhes sobre decisões de design, consulte [docs/decisoes_arquiteturais_historicas.md](./docs/decisoes_arquiteturais_historicas.md).*
