'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  Users, 
  Compass, 
  MapPin, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Activity, 
  Calendar,
  Briefcase,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { 
    leads, 
    itineraries, 
    bookings, 
    invoices, 
    payments, 
    expenses, 
    users, 
    auditLogs, 
    currentAgency 
  } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <span className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></span>
      </div>
    );
  }

  // Filter calculations based on current agency
  const agencyLeads = leads.filter(l => l.agencyId === currentAgency.id);
  const agencyItineraries = itineraries.filter(i => i.agencyId === currentAgency.id);
  const agencyBookings = bookings.filter(b => b.agencyId === currentAgency.id);
  const agencyInvoices = invoices.filter(i => i.agencyId === currentAgency.id);
  const agencyPayments = payments.filter(p => p.agencyId === currentAgency.id);
  const agencyExpenses = expenses.filter(e => e.agencyId === currentAgency.id);

  // Computations
  const totalLeadsCount = agencyLeads.length;
  const activeItinCount = agencyItineraries.length;
  const bookingsCount = agencyBookings.length;
  
  // Financial metrics
  const totalRevenue = agencyPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalInvoiced = agencyInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const pendingPayments = Math.max(0, totalInvoiced - totalRevenue);
  
  // Lead Conversions Data for Pie Chart
  const stageCounts = agencyLeads.reduce((acc: Record<string, number>, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const conversionData = [
    { name: 'New', value: stageCounts['NEW'] || 0, color: '#6366f1' },
    { name: 'Contacted', value: stageCounts['CONTACTED'] || 0, color: '#38bdf8' },
    { name: 'Proposal Sent', value: stageCounts['PROPOSAL_SENT'] || 0, color: '#f59e0b' },
    { name: 'Negotiation', value: stageCounts['NEGOTIATION'] || 0, color: '#ec4899' },
    { name: 'Confirmed', value: stageCounts['CONFIRMED'] || 0, color: '#10b981' },
    { name: 'Lost', value: stageCounts['LOST'] || 0, color: '#6b7280' },
  ].filter(item => item.value > 0);

  // Default fallback data if empty
  const finalPieData = conversionData.length > 0 ? conversionData : [
    { name: 'No Leads', value: 1, color: '#374151' }
  ];

  // Revenue Trends Data (Mocked weekly breakdown from payments)
  const revenueTrendData = [
    { date: 'Week 1', Revenue: totalRevenue * 0.15, Expenses: totalRevenue * 0.05 },
    { date: 'Week 2', Revenue: totalRevenue * 0.35, Expenses: totalRevenue * 0.15 },
    { date: 'Week 3', Revenue: totalRevenue * 0.60, Expenses: totalRevenue * 0.20 },
    { date: 'Week 4', Revenue: totalRevenue, Expenses: totalRevenue * 0.32 },
  ];

  // Employee Performance calculations (sales agent leaderboard)
  const salesAgents = users.filter(u => u.agencyId === currentAgency.id && u.role === 'Sales Agent');
  const agentPerformance = salesAgents.map(agent => {
    const assigned = agencyLeads.filter(l => l.assignedToId === agent.id);
    const confirmed = assigned.filter(l => l.status === 'CONFIRMED');
    const salesVolume = confirmed.reduce((sum, l) => sum + Number(l.value), 0);
    const rate = assigned.length > 0 ? Math.round((confirmed.length / assigned.length) * 100) : 0;

    return {
      name: agent.name,
      assigned: assigned.length,
      confirmed: confirmed.length,
      rate,
      volume: salesVolume
    };
  }).sort((a, b) => b.volume - a.volume);

  return (
    <div className="space-y-6">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
            Agency Command Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Overview of client pipelines, active bookings, and multi-tenant ledger accounts for {currentAgency.name}.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-card border border-border px-3 py-1.5 rounded-lg text-xs font-semibold">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <span>Active Period: May 2026</span>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Leads Card */}
        <div className="p-4 bg-card border border-border rounded-xl hover-card-trigger flex flex-col justify-between min-h-[100px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Leads CRM</span>
            <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold mt-2">{totalLeadsCount}</div>
            <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-emerald-500 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4% weekly growth</span>
            </div>
          </div>
        </div>

        {/* Active Itineraries Card */}
        <div className="p-4 bg-card border border-border rounded-xl hover-card-trigger flex flex-col justify-between min-h-[100px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Plans</span>
            <div className="p-1.5 rounded bg-sky-500/10 text-sky-400">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold mt-2">{activeItinCount}</div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {agencyItineraries.filter(i => i.status === 'SENT').length} proposal drafts sent
            </div>
          </div>
        </div>

        {/* Bookings Operations Card */}
        <div className="p-4 bg-card border border-border rounded-xl hover-card-trigger flex flex-col justify-between min-h-[100px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ops Bookings</span>
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold mt-2">{bookingsCount}</div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {agencyBookings.filter(b => b.status === 'PROCESSING').length} in processing queue
            </div>
          </div>
        </div>

        {/* Gross Revenue Card */}
        <div className="p-4 bg-card border border-border rounded-xl hover-card-trigger flex flex-col justify-between min-h-[100px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Collected Revenue</span>
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold mt-2">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-emerald-500 font-medium mt-1">
              From {agencyPayments.length} transactions
            </div>
          </div>
        </div>

        {/* Pending Invoices Card */}
        <div className="p-4 bg-card border border-border rounded-xl hover-card-trigger flex flex-col justify-between min-h-[100px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Outstanding Dues</span>
            <div className="p-1.5 rounded bg-amber-500/10 text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold mt-2">₹{pendingPayments.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-amber-400 font-medium mt-1">
              Unpaid invoices balance
            </div>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 p-5 bg-card border border-border rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Revenue vs. Expenses Trend</h2>
            <Activity className="w-4 h-4 text-primary shrink-0" />
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1f2937', borderColor: '#374151' }} />
                <Area type="monotone" dataKey="Revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                <Area type="monotone" dataKey="Expenses" stroke="#ec4899" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Stages Pie Chart */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lead Conversion Pipeline</h2>
            <Award className="w-4 h-4 text-primary shrink-0" />
          </div>
          <div className="h-56 relative flex items-center justify-center text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {finalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1f2937', borderColor: '#374151' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold">{totalLeadsCount}</span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Leads Total</span>
            </div>
          </div>
          {/* Custom legend */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px] pt-1">
            {finalPieData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Performance Leaderboard */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sales Rep Performance</h2>
            <Award className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                  <th className="pb-2">Agent Name</th>
                  <th className="pb-2 text-center">Assigned</th>
                  <th className="pb-2 text-center">Won</th>
                  <th className="pb-2 text-center">Conv. %</th>
                  <th className="pb-2 text-right">Revenue Won</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {agentPerformance.length > 0 ? (
                  agentPerformance.map((rep, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20">
                      <td className="py-2.5 font-medium flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                          {rep.name.charAt(0)}
                        </div>
                        <span>{rep.name}</span>
                      </td>
                      <td className="py-2.5 text-center text-muted-foreground">{rep.assigned}</td>
                      <td className="py-2.5 text-center text-emerald-500 font-semibold">{rep.confirmed}</td>
                      <td className="py-2.5 text-center font-medium">{rep.rate}%</td>
                      <td className="py-2.5 text-right font-bold text-emerald-500">₹{rep.volume.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No Sales Agent metrics recorded for this tenant.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Security Audit Log / Recent Activities */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Security Audit Trail</h2>
            <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold uppercase">
              RLS Secured
            </span>
          </div>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {auditLogs.length > 0 ? (
              auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex justify-between items-start p-2 rounded-lg bg-secondary/30 border border-border/40 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-foreground">{log.userName}</span>
                      <span className={`text-[8px] px-1 rounded font-bold ${
                        log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500' :
                        log.action === 'UPDATE' ? 'bg-indigo-500/10 text-indigo-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {log.action}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{log.details}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground text-right shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">No audit trails logged.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
