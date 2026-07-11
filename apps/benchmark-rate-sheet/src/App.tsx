import { useState } from 'react'
import { AppStateProvider } from './context/AppStateContext'
import { Sidebar, type Page } from './components/layout/Sidebar'
import { ThemeToggle } from './components/layout/ThemeToggle'
import { EstimatorPage } from './components/estimator/EstimatorPage'
import { ScenariosPage } from './components/scenarios/ScenariosPage'
import { BidHistoryPage } from './components/history/BidHistoryPage'
import { ProductivityLibraryPage } from './components/productivity/ProductivityLibraryPage'
import { SettingsPage } from './components/settings/SettingsPage'

function PageContent({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
  switch (page) {
    case 'estimator':
      return <EstimatorPage />
    case 'scenarios':
      return <ScenariosPage onOpenEstimator={() => onNavigate('estimator')} />
    case 'history':
      return <BidHistoryPage />
    case 'productivity':
      return <ProductivityLibraryPage />
    case 'settings':
      return <SettingsPage />
  }
}

function Dashboard() {
  const [page, setPage] = useState<Page>('estimator')

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar page={page} onNavigate={setPage} />
      <div className="flex-1 lg:h-screen lg:overflow-y-auto">
        <header className="no-print sticky top-0 z-10 flex items-center justify-end gap-3 border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <ThemeToggle />
        </header>
        <main className="animate-fade-in p-4 sm:p-6">
          <PageContent page={page} onNavigate={setPage} />
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AppStateProvider>
      <Dashboard />
    </AppStateProvider>
  )
}

export default App
