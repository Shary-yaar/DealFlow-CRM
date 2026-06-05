import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import KanbanBoard from './components/KanbanBoard';
import ContactManager from './components/ContactManager';
import AddDealModal from './components/AddDealModal';
import { 
  Briefcase, 
  Users, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  RefreshCw, 
  AlertTriangle,
  X,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals & Panels state
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  
  // Notification Toast state
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = 'error') => {
    setToast({ message, type });
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('Fetch Contacts Error:', err);
      triggerToast(err.message || 'Failed to load contacts.', 'error');
    }
  };

  const fetchDeals = async () => {
    try {
      // Join deals with contacts to get name, company, email on each deal card
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          contacts (
            id,
            name,
            company,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (err) {
      console.error('Fetch Deals Error:', err);
      triggerToast(err.message || 'Failed to load deals.', 'error');
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    await Promise.all([fetchContacts(), fetchDeals()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInitialData();

    // Set up Real-time subscriptions for immediate sync when database is edited elsewhere
    const dealsSubscription = supabase
      .channel('public:deals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => {
        fetchDeals();
      })
      .subscribe();

    const contactsSubscription = supabase
      .channel('public:contacts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
        fetchContacts();
        fetchDeals(); // Cascade change since deals reference contacts
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dealsSubscription);
      supabase.removeChannel(contactsSubscription);
    };
  }, []);

  // Compute CRM Dashboard Metrics
  const totalPipelineValue = deals
    .filter(d => d.stage !== 'Lost')
    .reduce((sum, d) => sum + Number(d.value), 0);

  const activeDealsCount = deals
    .filter(d => ['Lead', 'Qualified', 'Proposal'].includes(d.stage))
    .length;

  const wonDealsValue = deals
    .filter(d => d.stage === 'Won')
    .reduce((sum, d) => sum + Number(d.value), 0);

  const closedDeals = deals.filter(d => ['Won', 'Lost'].includes(d.stage));
  const wonCount = deals.filter(d => d.stage === 'Won').length;
  const winRate = closedDeals.length > 0 
    ? Math.round((wonCount / closedDeals.length) * 100) 
    : 0;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-gradient-mesh text-slate-800 flex flex-col md:flex-row">
      
      {/* Sidebar / Layout Navigation */}
      <aside className="w-full md:w-64 shrink-0 glass-panel border-r border-slate-200/60 flex flex-col md:h-screen sticky top-0 z-30 shadow-sm">
        
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <span className="font-bold text-lg text-white">DF</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">DealFlow</h1>
              <span className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase">CRM Studio</span>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" title="Database Connected"></span>
        </div>

        {/* Navigation / Actions */}
        <div className="flex-1 p-4 space-y-6">
          
          {/* Quick Actions Section */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-2">Quick Actions</span>
            
            <button
              onClick={() => setIsAddDealOpen(true)}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Deal
            </button>

            <button
              onClick={() => setIsContactsOpen(true)}
              className="w-full px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-500" />
              Manage Contacts
            </button>
          </div>

          {/* CRM Quick Stats Section */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-2">Summary Metrics</span>
            
            {/* Total Pipeline */}
            <div className="p-3 rounded-xl bg-white/70 border border-slate-200/50 flex items-center gap-3 shadow-sm">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Pipeline Value</p>
                <p className="text-sm font-bold text-slate-900">{formatCurrency(totalPipelineValue)}</p>
              </div>
            </div>

            {/* Active Deals */}
            <div className="p-3 rounded-xl bg-white/70 border border-slate-200/50 flex items-center gap-3 shadow-sm">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/50">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Deals</p>
                <p className="text-sm font-bold text-slate-900">{activeDealsCount} Leads</p>
              </div>
            </div>

            {/* Win Rate */}
            <div className="p-3 rounded-xl bg-white/70 border border-slate-200/50 flex items-center gap-3 shadow-sm">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Win Rate</p>
                <p className="text-sm font-bold text-slate-900">{winRate}%</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
          <p className="text-[10px] text-slate-400">DealFlow CRM v1.0.0</p>
          <p className="text-[9px] text-slate-500 mt-0.5">Powered by Supabase & Gemini</p>
        </div>
      </aside>

      {/* Main Content Space */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="px-6 py-4 glass-panel border-b border-slate-200/60 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sales Pipeline</h2>
            <p className="text-xs text-slate-500 mt-0.5">Drag and drop cards or select stages to advance deals.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadInitialData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Board Container */}
        <section className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            /* Premium Loading State (Skeleton Columns) */
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border border-slate-200/80 p-3 h-[500px] space-y-4 shadow-sm">
                  <div className="h-6 w-24 bg-slate-100 rounded-md animate-pulse"></div>
                  <div className="h-4 w-16 bg-slate-100 rounded-md animate-pulse"></div>
                  <hr className="border-slate-100" />
                  <div className="h-32 bg-slate-50 rounded-xl border border-slate-100 animate-pulse"></div>
                  <div className="h-32 bg-slate-50 rounded-xl border border-slate-100 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <KanbanBoard 
              deals={deals} 
              onRefreshDeals={fetchDeals} 
              onError={(msg) => triggerToast(msg, 'error')}
            />
          )}
        </section>

      </main>

      {/* Modals & Dialog Controllers */}
      <ContactManager
        isOpen={isContactsOpen}
        onClose={() => setIsContactsOpen(false)}
        contacts={contacts}
        onRefreshContacts={fetchContacts}
        onError={(msg) => triggerToast(msg, 'error')}
      />

      <AddDealModal
        isOpen={isAddDealOpen}
        onClose={() => setIsAddDealOpen(false)}
        contacts={contacts}
        onRefreshDeals={fetchDeals}
        onOpenContacts={() => setIsContactsOpen(true)}
        onError={(msg) => triggerToast(msg, 'error')}
      />

      {/* Elegant Toast Banners */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border flex items-center gap-3 shadow-xl animate-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          ) : (
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="p-0.5 rounded-lg hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
