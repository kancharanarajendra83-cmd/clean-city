import React from 'react';
import { ActiveTab } from '../types';
import { Sparkles, PlusCircle, Search, BarChart3, Lightbulb, Info, ShieldCheck, Flame } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openReportsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openReportsCount,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Community Pulse', icon: BarChart3 },
    { id: 'hotspots', label: 'AI Hotspots', icon: Flame },
    { id: 'report', label: 'Report Waste', icon: PlusCircle },
    { id: 'tracker', label: 'Track Tickets', icon: Search, badge: openReportsCount },
    { id: 'insights', label: 'AI Directives', icon: Lightbulb },
    { id: 'about', label: 'Viva & Architecture', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            id="nav-brand-logo"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight text-zinc-900">
                  Clean<span className="text-emerald-600">City</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                  Ward 4 Civic Hub
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium hidden sm:block">
                AI Waste Reporting & Citizen Accountability
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-zinc-500'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick CTA */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-zinc-100 rounded-full text-xs font-medium text-zinc-700">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gemini 3.8 AI & Rule Engine</span>
            </div>
            <button
              id="header-quick-report-btn"
              onClick={() => setActiveTab('report')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Waste</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
