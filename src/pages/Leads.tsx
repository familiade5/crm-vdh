import { MainLayout } from '@/components/layout/MainLayout';
import { LeadsList } from '@/components/leads/LeadsList';
import { mockLeads } from '@/data/mockData';

const Leads = () => {
  return (
    <MainLayout>
      <div className="p-6 lg:p-8">
        <LeadsList leads={mockLeads} />
      </div>
    </MainLayout>
  );
};

export default Leads;
