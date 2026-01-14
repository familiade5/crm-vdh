import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  Settings,
  Plug,
  ChevronLeft,
  ChevronRight,
  Bot,
  TrendingUp,
  Calendar,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Leads', path: '/leads' },
  { icon: Building2, label: 'Imóveis', path: '/imoveis' },
  { icon: MessageSquare, label: 'Chat IA', path: '/chat' },
  { icon: Calendar, label: 'Agenda', path: '/agenda' },
  { icon: Plug, label: 'Integrações', path: '/integracoes' },
  { icon: TrendingUp, label: 'Relatórios', path: '/relatorios' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-gradient-dark z-50 transition-all duration-300 flex flex-col',
          // Desktop
          'hidden lg:flex',
          collapsed ? 'lg:w-20' : 'lg:w-64 xl:w-64',
          // Mobile
          mobileOpen && 'flex w-72'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="animate-fade-in">
                <h1 className="font-display font-bold text-lg text-sidebar-foreground">ImobiCRM</h1>
                <p className="text-xs text-sidebar-foreground/60">Gestão Inteligente</p>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors lg:hidden"
            >
              <X className="w-5 h-5 text-sidebar-foreground" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'animate-pulse-glow')} />
                {(!collapsed || mobileOpen) && (
                  <span className="font-medium text-sm animate-fade-in">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button - Desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground items-center justify-center shadow-lg hover:scale-110 transition-transform hidden lg:flex"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User Info */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-accent-foreground">{getInitials()}</span>
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="animate-fade-in flex-1 min-w-0">
                <p className="font-medium text-sm text-sidebar-foreground truncate">{user?.email}</p>
                <p className="text-xs text-sidebar-foreground/60">Administrador</p>
              </div>
            )}
            {(!collapsed || mobileOpen) && (
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
