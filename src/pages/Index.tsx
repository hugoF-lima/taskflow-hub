import { SidebarProvider } from '@/components/ui/sidebar';
import { AppProvider, useAppContext } from '@/context/AppContext';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { CardView } from '@/components/views/CardView';
import { ListView } from '@/components/views/ListView';
import { EisenhowerView } from '@/components/views/EisenhowerView';
import { ManagerDashboard } from '@/components/ManagerDashboard';

function DashboardContent() {
  const { viewMode, settings } = useAppContext();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen max-h-screen overflow-hidden">
          <Header />
          <FilterBar />
          <SearchBar />
          {viewMode === 'card' && <CardView />}
          {viewMode === 'list' && <ListView />}
          {viewMode === 'eisenhower' && <EisenhowerView />}
        </div>
      </div>
      {settings.managerDashboard && <ManagerDashboard />}
    </SidebarProvider>
  );
}

export default function Index() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
