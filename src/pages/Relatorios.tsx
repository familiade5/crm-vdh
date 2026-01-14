import { MainLayout } from '@/components/layout/MainLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Download, Calendar, TrendingUp, Users, Building2, DollarSign, Flame, ThermometerSun, Snowflake, Bot, UserCheck } from 'lucide-react';
import { mockSourceMetrics } from '@/data/mockData';

const leadsPerMonth = [
  { month: 'Jan', leads: 45, conversoes: 8 },
  { month: 'Fev', leads: 52, conversoes: 10 },
  { month: 'Mar', leads: 61, conversoes: 12 },
  { month: 'Abr', leads: 48, conversoes: 9 },
  { month: 'Mai', leads: 73, conversoes: 15 },
  { month: 'Jun', leads: 89, conversoes: 18 },
  { month: 'Jul', leads: 95, conversoes: 20 },
  { month: 'Ago', leads: 78, conversoes: 14 },
  { month: 'Set', leads: 102, conversoes: 22 },
  { month: 'Out', leads: 118, conversoes: 25 },
  { month: 'Nov', leads: 134, conversoes: 28 },
  { month: 'Dez', leads: 156, conversoes: 32 },
];

const sourceData = [
  { name: 'Facebook', value: 28, color: '#1877f2' },
  { name: 'Instagram', value: 22, color: '#e4405f' },
  { name: 'Google', value: 20, color: '#34a853' },
  { name: 'WhatsApp', value: 18, color: '#25d366' },
  { name: 'OLX', value: 7, color: '#f97316' },
  { name: 'Site', value: 5, color: '#10b981' },
];

const temperatureData = [
  { name: 'Quentes', value: 45, color: '#ef4444' },
  { name: 'Mornos', value: 89, color: '#f59e0b' },
  { name: 'Frios', value: 23, color: '#3b82f6' },
];

const aiPerformance = [
  { month: 'Jan', iaChats: 120, humanChats: 45, transfers: 12 },
  { month: 'Fev', iaChats: 145, humanChats: 52, transfers: 15 },
  { month: 'Mar', iaChats: 168, humanChats: 48, transfers: 18 },
  { month: 'Abr', iaChats: 189, humanChats: 55, transfers: 14 },
  { month: 'Mai', iaChats: 210, humanChats: 62, transfers: 20 },
  { month: 'Jun', iaChats: 245, humanChats: 58, transfers: 22 },
];

const conversionData = [
  { stage: 'Novos', value: 100, color: '#3b82f6' },
  { stage: 'Em Contato', value: 75, color: '#f59e0b' },
  { stage: 'Qualificados', value: 45, color: '#10b981' },
  { stage: 'Visita', value: 30, color: '#8b5cf6' },
  { stage: 'Proposta', value: 18, color: '#ec4899' },
  { stage: 'Fechados', value: 12, color: '#10b981' },
];

const sourceIcons: Record<string, string> = {
  facebook: '📘',
  instagram: '📸',
  google: '🔍',
  olx: '📦',
  site: '🏠',
  whatsapp: '💬',
  indicacao: '🤝',
};

const Relatorios = () => {
  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl lg:text-4xl">Relatórios</h1>
            <p className="text-muted-foreground mt-1">
              Análise completa do desempenho por fonte e temperatura
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Último ano</span>
            </div>
            <button className="px-4 py-2.5 bg-gradient-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-glow">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Leads</p>
                <p className="font-display font-bold text-2xl">1.251</p>
                <p className="text-xs text-success">+23% vs. ano anterior</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leads Quentes</p>
                <p className="font-display font-bold text-2xl">45</p>
                <p className="text-xs text-success">+18% este mês</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atendidos por IA</p>
                <p className="font-display font-bold text-2xl">82%</p>
                <p className="text-xs text-success">+5% eficiência</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="font-display font-bold text-2xl">12.5%</p>
                <p className="text-xs text-success">+2.3% vs. ano anterior</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Origem dos Leads */}
          <div className="bg-card rounded-2xl p-6 shadow-md">
            <h3 className="font-display font-bold text-lg mb-6">Leads por Origem</h3>
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={250}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {sourceData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Temperatura dos Leads */}
          <div className="bg-card rounded-2xl p-6 shadow-md">
            <h3 className="font-display font-bold text-lg mb-6">Temperatura dos Leads</h3>
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={250}>
                <PieChart>
                  <Pie
                    data={temperatureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {temperatureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Quentes</span>
                  </div>
                  <span className="font-bold text-red-500">45</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="w-5 h-5 text-amber-500" />
                    <span className="font-medium">Mornos</span>
                  </div>
                  <span className="font-bold text-amber-500">89</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Snowflake className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Frios</span>
                  </div>
                  <span className="font-bold text-blue-500">23</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Source Metrics Table */}
        <div className="bg-card rounded-2xl p-6 shadow-md">
          <h3 className="font-display font-bold text-lg mb-6">Métricas por Fonte</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-4 text-sm font-semibold text-muted-foreground">Fonte</th>
                  <th className="text-right pb-4 text-sm font-semibold text-muted-foreground">Leads</th>
                  <th className="text-right pb-4 text-sm font-semibold text-muted-foreground">Conversões</th>
                  <th className="text-right pb-4 text-sm font-semibold text-muted-foreground">Taxa</th>
                  <th className="text-right pb-4 text-sm font-semibold text-muted-foreground">Tempo Resposta</th>
                </tr>
              </thead>
              <tbody>
                {mockSourceMetrics.map((metric) => (
                  <tr key={metric.source} className="border-b border-border/50">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{sourceIcons[metric.source]}</span>
                        <span className="font-medium capitalize">{metric.source}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right font-semibold">{metric.leads}</td>
                    <td className="py-4 text-right font-semibold text-success">{metric.conversions}</td>
                    <td className="py-4 text-right font-semibold">{metric.conversionRate}%</td>
                    <td className="py-4 text-right text-muted-foreground">{metric.avgResponseTime}min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Performance */}
        <div className="bg-card rounded-2xl p-6 shadow-md">
          <h3 className="font-display font-bold text-lg mb-6">Performance IA vs Humano</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={aiPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="iaChats" stackId="1" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.6} name="Chats IA" />
              <Area type="monotone" dataKey="humanChats" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} name="Chats Humano" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel */}
        <div className="bg-card rounded-2xl p-6 shadow-md">
          <h3 className="font-display font-bold text-lg mb-6">Funil de Conversão</h3>
          <div className="flex items-center justify-between gap-2">
            {conversionData.map((item, index) => (
              <div key={item.stage} className="flex-1 text-center">
                <div
                  className="mx-auto rounded-xl flex items-center justify-center font-display font-bold text-white text-xl mb-2 transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: item.color,
                    width: `${100 - index * 10}%`,
                    height: '80px',
                  }}
                >
                  {item.value}%
                </div>
                <p className="text-sm font-medium">{item.stage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Relatorios;
