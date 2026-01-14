import { MainLayout } from '@/components/layout/MainLayout';
import {
  User,
  Building,
  Bell,
  Shield,
  Palette,
  Bot,
  Save,
  Camera,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAISettings, useCompanySettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

const tabs = [
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'empresa', label: 'Empresa', icon: Building },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'ia', label: 'Assistente IA', icon: Bot },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'aparencia', label: 'Aparência', icon: Palette },
];

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { settings: aiSettings, loading: aiLoading, updateSettings: updateAISettings } = useAISettings();
  const { settings: companySettings, loading: companyLoading, updateSettings: updateCompanySettings } = useCompanySettings();
  
  const [saving, setSaving] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    creci: '',
  });

  // Company form state
  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    cnpj: '',
    address: '',
  });

  // AI settings state
  const [aiForm, setAiForm] = useState({
    auto_response: true,
    score_qualification: true,
    auto_scheduling: false,
    welcome_message: '',
  });

  // Update forms when data loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        creci: profile.creci || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (companySettings) {
      setCompanyForm({
        company_name: companySettings.company_name || '',
        cnpj: companySettings.cnpj || '',
        address: companySettings.address || '',
      });
    }
  }, [companySettings]);

  useEffect(() => {
    if (aiSettings) {
      setAiForm({
        auto_response: aiSettings.auto_response,
        score_qualification: aiSettings.score_qualification,
        auto_scheduling: aiSettings.auto_scheduling,
        welcome_message: aiSettings.welcome_message || '',
      });
    }
  }, [aiSettings]);

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfile(profileForm);
    setSaving(false);
  };

  const handleSaveCompany = async () => {
    setSaving(true);
    await updateCompanySettings(companyForm);
    setSaving(false);
  };

  const handleSaveAI = async () => {
    setSaving(true);
    await updateAISettings(aiForm);
    setSaving(false);
  };

  const handleToggleAISetting = async (key: 'auto_response' | 'score_qualification' | 'auto_scheduling') => {
    const newValue = !aiForm[key];
    setAiForm(prev => ({ ...prev, [key]: newValue }));
    await updateAISettings({ [key]: newValue });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-3xl lg:text-4xl">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas preferências e configurações do sistema
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Mobile horizontal scroll tabs */}
            <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
              <div className="flex gap-2 min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card hover:bg-muted'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Desktop vertical tabs */}
            <div className="hidden lg:block">
            <div className="bg-card rounded-2xl p-4 shadow-md space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-card rounded-2xl p-6 shadow-md">
            {activeTab === 'perfil' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-display font-bold text-xl">Informações do Perfil</h2>

                {profileLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                          {getInitials(profileForm.name)}
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{profileForm.name || 'Seu Nome'}</h3>
                        <p className="text-muted-foreground">{profile?.role || 'Corretor'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nome</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full mt-1 px-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full mt-1 px-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full mt-1 px-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">CRECI</label>
                        <input
                          type="text"
                          value={profileForm.creci}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, creci: e.target.value }))}
                          className="w-full mt-1 px-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-6 py-2.5 bg-gradient-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-glow disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Salvar Alterações
                    </button>
                  </>
                )}
              </div>
            )}

            {activeTab === 'ia' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-display font-bold text-xl">Configurações do Assistente IA</h2>

                {aiLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-gradient-primary/10 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Bot className="w-6 h-6 text-primary" />
                        <h3 className="font-semibold">Assistente de Pré-Qualificação</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        O assistente IA responde automaticamente às primeiras mensagens dos leads,
                        coletando informações importantes e qualificando-os antes do atendimento humano.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                        <div>
                          <h4 className="font-medium">Resposta Automática</h4>
                          <p className="text-sm text-muted-foreground">Responder automaticamente novas mensagens</p>
                        </div>
                        <button 
                          onClick={() => handleToggleAISetting('auto_response')}
                          className={cn(
                            "w-12 h-7 rounded-full relative transition-colors",
                            aiForm.auto_response ? "bg-primary" : "bg-muted"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all",
                            aiForm.auto_response ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                        <div>
                          <h4 className="font-medium">Qualificação por Score</h4>
                          <p className="text-sm text-muted-foreground">Atribuir score baseado nas respostas</p>
                        </div>
                        <button 
                          onClick={() => handleToggleAISetting('score_qualification')}
                          className={cn(
                            "w-12 h-7 rounded-full relative transition-colors",
                            aiForm.score_qualification ? "bg-primary" : "bg-muted"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all",
                            aiForm.score_qualification ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                        <div>
                          <h4 className="font-medium">Agendamento de Visitas</h4>
                          <p className="text-sm text-muted-foreground">Permitir que a IA agende visitas automaticamente</p>
                        </div>
                        <button 
                          onClick={() => handleToggleAISetting('auto_scheduling')}
                          className={cn(
                            "w-12 h-7 rounded-full relative transition-colors",
                            aiForm.auto_scheduling ? "bg-primary" : "bg-muted"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all",
                            aiForm.auto_scheduling ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mensagem de Boas-vindas</label>
                      <textarea
                        rows={4}
                        value={aiForm.welcome_message}
                        onChange={(e) => setAiForm(prev => ({ ...prev, welcome_message: e.target.value }))}
                        className="w-full mt-1 px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                    </div>

                    <button 
                      onClick={handleSaveAI}
                      disabled={saving}
                      className="px-6 py-2.5 bg-gradient-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-glow disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Salvar Configurações
                    </button>
                  </>
                )}
              </div>
            )}

            {activeTab === 'empresa' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-display font-bold text-xl">Dados da Empresa</h2>

                {companyLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nome da Imobiliária</label>
                        <input
                          type="text"
                          value={companyForm.company_name}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, company_name: e.target.value }))}
                          className="w-full mt-1 px-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">CNPJ</label>
                        <input
                          type="text"
                          value={companyForm.cnpj}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, cnpj: e.target.value }))}
                          className="w-full mt-1 px-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                        <input
                          type="text"
                          value={companyForm.address}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full mt-1 px-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleSaveCompany}
                      disabled={saving}
                      className="px-6 py-2.5 bg-gradient-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-glow disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Salvar Alterações
                    </button>
                  </>
                )}
              </div>
            )}

            {(activeTab === 'notificacoes' || activeTab === 'seguranca' || activeTab === 'aparencia') && (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Configurações de {tabs.find(t => t.id === activeTab)?.label} em desenvolvimento</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Configuracoes;
