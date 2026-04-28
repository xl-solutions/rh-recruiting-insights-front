import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import ExecutiveView from './pages/ExecutiveView';
import MonthlyTrendsView from './pages/MonthlyTrendsView';
import DropoutsView from './pages/DropoutsView';
import { useDashboardData } from './hooks/useDashboardData';

function App() {
  const [activeTab, setActiveTab] = useState('executive');
  const { 
    executiveData, 
    summaryData, 
    monthlyData, 
    dropoutData,
    isLoading, 
    error 
  } = useDashboardData();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'executive' && (
          <ExecutiveView 
            data={executiveData} 
            summary={summaryData}
            isLoading={isLoading} 
            error={error} 
          />
        )}

        {activeTab === 'funnel' && (
          <MonthlyTrendsView 
            data={monthlyData}
            isLoading={isLoading}
            error={error}
          />
        )}

        {activeTab === 'dropouts' && (
          <DropoutsView 
            data={dropoutData}
            isLoading={isLoading}
            error={error}
          />
        )}
        
        {activeTab !== 'executive' && activeTab !== 'funnel' && activeTab !== 'dropouts' && (
          <div className="flex-1 p-8 flex flex-col items-center justify-center h-full text-center">
            <div className="bg-slate-100 p-6 rounded-full text-slate-400 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Em Desenvolvimento</h2>
            <p className="text-slate-500 max-w-sm">
              Esta aba ({activeTab}) será implementada nas próximas etapas do projeto.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
