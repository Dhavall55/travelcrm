'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Building2, 
  DollarSign, 
  ShieldAlert, 
  Map, 
  Search, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  Briefcase,
  Layers,
  ChevronDown,
  LogOut,
  Bell,
  CheckCircle2,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: string[];
}

const navigationItems: SidebarItem[] = [
  { name: 'Analytics Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Agency Admin', 'Sales Agent', 'Operations', 'Finance'] },
  { name: 'Lead Pipeline CRM', href: '/dashboard/crm', icon: Layers, roles: ['Agency Admin', 'Sales Agent'] },
  { name: 'Customer Directory', href: '/dashboard/customers', icon: Users, roles: ['Agency Admin', 'Sales Agent', 'Operations'] },
  { name: 'Itinerary Builder', href: '/dashboard/itinerary', icon: Map, roles: ['Agency Admin', 'Sales Agent', 'Operations'] },
  { name: 'Vendor Registry', href: '/dashboard/vendors', icon: Building2, roles: ['Agency Admin', 'Operations', 'Finance'] },
  { name: 'Billing & ERP Finance', href: '/dashboard/finance', icon: DollarSign, roles: ['Agency Admin', 'Finance'] },
  { name: 'Access Control & Staff', href: '/dashboard/employees', icon: ShieldAlert, roles: ['Agency Admin'] },
];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { 
    theme, 
    setTheme, 
    currentAgency, 
    agencies, 
    setCurrentAgency, 
    currentUser, 
    users, 
    setCurrentUser,
    auditLogs
  } = useStore();

  // Dark mode effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // If path is auth or portal, bypass layout shell
  const isAuthPage = pathname.startsWith('/auth') || pathname.startsWith('/portal');
  if (isAuthPage || pathname === '/') {
    return <>{children}</>;
  }

  // Filter menu items by active user role permissions
  const filteredNavigation = navigationItems.filter(item => {
    if (!currentUser) return false;
    return item.roles.includes(currentUser.role);
  });

  const handleLogout = () => {
    setCurrentUser(null);
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row transition-colors duration-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card p-4 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Logo / Branding */}
          <div className="flex items-center space-x-3 px-2 py-1">
            {currentAgency.logoUrl ? (
              <img 
                src={currentAgency.logoUrl} 
                alt={currentAgency.name} 
                className="w-10 h-10 rounded-lg object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {currentAgency.name.charAt(0)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold tracking-tight text-sm truncate w-40">{currentAgency.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                {currentAgency.subscriptionPlan} PLAN
              </span>
            </div>
          </div>

          {/* Tenant Switcher */}
          <div className="relative group px-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider px-2">Agency Tenant</span>
            <div className="mt-1 flex items-center justify-between p-2 rounded-lg bg-secondary hover:bg-accent cursor-pointer transition-all duration-200 border border-border">
              <span className="text-xs font-medium truncate">{currentAgency.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            {/* Dropdown menu */}
            <div className="absolute left-0 mt-1 w-full bg-card border border-border rounded-lg shadow-xl hidden group-hover:block z-50 overflow-hidden">
              {agencies.map((agency) => (
                <button
                  key={agency.id}
                  onClick={() => setCurrentAgency(agency.id)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors ${agency.id === currentAgency.id ? 'bg-primary/10 text-primary font-semibold' : ''}`}
                >
                  {agency.name}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider px-3 block mb-2">Management</span>
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' 
                      : 'hover:bg-secondary hover:text-foreground text-muted-foreground'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User context footer */}
        <div className="border-t border-border pt-4 mt-6">
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 border border-border/30">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate">{currentUser?.name}</span>
              <span className="text-[10px] text-muted-foreground truncate">{currentUser?.role}</span>
            </div>
            
            {/* Quick staff switch */}
            <div className="relative group">
              <button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground">
                <UserCheck className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 bottom-full mb-1 w-48 bg-card border border-border rounded-lg shadow-xl hidden group-hover:block z-50 max-h-60 overflow-y-auto">
                <span className="block px-3 py-1.5 text-[9px] text-muted-foreground font-bold uppercase tracking-wider border-b border-border bg-secondary/30">
                  Switch Persona
                </span>
                {users.map((usr) => (
                  <button
                    key={usr.id}
                    onClick={() => setCurrentUser(usr)}
                    className={`w-full text-left px-3 py-2 text-[11px] hover:bg-secondary transition-colors truncate ${usr.id === currentUser?.id ? 'bg-primary/10 text-primary font-semibold' : ''}`}
                  >
                    {usr.name} ({usr.role})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between border-b border-border bg-card p-4 z-40 shrink-0">
        <div className="flex items-center space-x-2">
          {currentAgency.logoUrl ? (
            <img src={currentAgency.logoUrl} alt={currentAgency.name} className="w-8 h-8 rounded object-cover" />
          ) : (
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {currentAgency.name.charAt(0)}
            </div>
          )}
          <span className="font-semibold text-xs truncate max-w-[120px]">{currentAgency.name}</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Slide-over navigation panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden flex justify-end">
          <div className="w-72 bg-card h-full p-4 flex flex-col justify-between border-l border-border animate-slide-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="font-semibold text-sm">Menu Options</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md hover:bg-secondary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="space-y-1">
                {filteredNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-secondary text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate">{currentUser?.name}</span>
                  <span className="text-[10px] text-muted-foreground">{currentUser?.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1 text-destructive hover:bg-destructive/10 rounded"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header bar */}
        <header className="hidden md:flex items-center justify-between border-b border-border bg-card/60 backdrop-blur-md px-6 py-3 z-30 shrink-0">
          {/* Dashboard welcome */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground font-medium">Enterprise CRM Suite</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 status-dot-active"></span>
          </div>

          {/* Quick links & Notifications */}
          <div className="flex items-center space-x-4">
            {/* Mode Switcher */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Notifications panel */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-xl z-50 p-2 text-xs">
                  <div className="flex justify-between items-center border-b border-border pb-2 mb-2 px-1">
                    <span className="font-semibold">Recent Security Audit Logs</span>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-primary hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {auditLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="p-1.5 rounded bg-secondary/50 border border-border/30">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span className="font-semibold">{log.userName}</span>
                          <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[11px] mt-0.5 text-foreground">{log.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Portal Switch Links */}
            <div className="flex items-center space-x-2 border-l border-border pl-4">
              <Link 
                href="/portal/customer" 
                className="text-[11px] font-semibold text-primary hover:underline px-2.5 py-1 rounded bg-primary/10"
              >
                Customer Portal
              </Link>
              <Link 
                href="/portal/vendor" 
                className="text-[11px] font-semibold text-teal-500 hover:underline px-2.5 py-1 rounded bg-teal-500/10"
              >
                Vendor Portal
              </Link>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-secondary transition-all"
              >
                <div className="w-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser?.name.charAt(0)}
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-border bg-secondary/30">
                    <span className="block text-xs font-semibold">{currentUser?.name}</span>
                    <span className="block text-[10px] text-muted-foreground">{currentUser?.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      router.push('/dashboard/employees');
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors"
                  >
                    My Access Rights
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors border-t border-border flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout Session</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background/50">
          {children}
        </main>
      </div>
    </div>
  );
}
