# Registro de Decisões Arquiteturais (ADR)

Este documento registra as mudanças fundamentais na arquitetura do Recruiting Insights Dashboard.

## 1. Migração de CSV Público para Google Apps Script API
**Data:** 28/04/2026  
**Contexto:** Inicialmente, o dashboard consumia dados de uma planilha do Google via exportação CSV pública. Isso apresentava riscos de segurança (dados expostos) e limitações de formatação (células mescladas quebravam o CSV).  
**Decisão:** Implementar um "Backend Serverless" usando **Google Apps Script**.  
**Consequência:** 
- **Segurança:** Acesso protegido por `SECRET_TOKEN`.
- **Integridade:** O script agora trata células mescladas e lógica de negócios complexa antes de enviar o JSON para o frontend.
- **Performance:** Menor carga de processamento no cliente.

## 2. Abordagem de Dados Híbrida (Summary + Jobs)
**Data:** 28/04/2026  
**Contexto:** A planilha de RH possui tabelas de resumo (KPIs calculados manualmente) e uma lista detalhada de vagas. Recalcular tudo no frontend gerava divergências de números com o relatório oficial.  
**Decisão:** O Apps Script retorna um objeto com duas chaves: `summary` (números oficiais das tabelas roxas) e `jobs` (lista bruta para gráficos dinâmicos e filtros).  
**Consequência:** O Dashboard agora reflete exatamente os números do RH, mantendo a capacidade de filtragem dinâmica por área e mês.

## 3. Segurança via Token em URL
**Data:** 28/04/2026  
**Contexto:** Precisávamos de uma forma simples de autenticação sem forçar o login do usuário no Google (o que causaria redirecionamentos 302/CORS).  
**Decisão:** Uso de um `SECRET_TOKEN` passado como parâmetro de query na requisição para o Apps Script Web App.  
**Consequência:** Simplicidade de implementação e proteção contra acessos não autorizados ao endpoint da API.

## 4. Estratégia de Busca Declarativa vs Dinâmica
**Data:** 28/04/2026  
**Contexto:** Tentativas de busca dinâmica por texto na planilha falharam em capturar métricas específicas devido a variações de digitação humana.  
**Decisão:** Adoção de **mapeamento declarativo de coordenadas** (ex: M9, M10) para métricas fixas do relatório, mantendo a busca dinâmica apenas para a lista de vagas.  
**Consequência:** Estabilidade absoluta nos Big Numbers do Dashboard.
