import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { LeadsPipeline } from '@/components/dashboard/LeadsPipeline';
import { PortalStatus } from '@/components/dashboard/PortalStatus';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { mockLeads, mockPortals, mockDashboardStats } from '@/data/mockData';
import { Users, UserPlus, Target, TrendingUp, MessageSquare, Calendar } from 'lucide-react';

const Index = () => {
  const stats = mockDashboardStats;

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl lg:text-4xl">
              Bom dia, <span className="text-gradient-primary">João</span> 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Aqui está o resumo do seu CRM imobiliário hoje
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-accent/10 rounded-xl">
              <p className="text-xs text-muted-foreground">Comissões do mês</p>
              <p className="font-display font-bold text-accent text-lg">R$ 45.250,00</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            title="Total de Leads"
            value={stats.totalLeads}
            change={12}
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            title="Novos Hoje"
            value={stats.newLeadsToday}
            change={23}
            icon={<UserPlus className="w-6 h-6" />}
            variant="primary"
          />
          <StatCard
            title="Qualificados"
            value={stats.qualifiedLeads}
            change={8}
            icon={<Target className="w-6 h-6" />}
          />
          <StatCard
            title="Taxa Conversão"
            value={`${stats.conversionRate}%`}
            change={5}
            icon={<TrendingUp className="w-6 h-6" />}
            variant="accent"
          />
          <StatCard
            title="Chats Ativos"
            value={stats.activeChats}
            icon={<MessageSquare className="w-6 h-6" />}
          />
          <StatCard
            title="Visitas Agendadas"
            value={stats.scheduledVisits}
            change={15}
            icon={<Calendar className="w-6 h-6" />}
            variant="success"
          />
        </div>

        {/* Pipeline */}
        <LeadsPipeline leads={mockLeads} />

        {/* Two Columns */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PortalStatus portals={mockPortals} />
          <RecentActivity />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
