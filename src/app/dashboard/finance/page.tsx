'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { 
  DollarSign, 
  Plus, 
  Search, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingDown, 
  Activity, 
  CreditCard,
  X,
  PieChart as ChartIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

export default function FinancePage() {
  const { 
    invoices, 
    payments, 
    expenses, 
    vendorPayouts, 
    currentAgency, 
    vendors,
    recordPayment, 
    recordExpense 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses' | 'payouts'>('invoices');
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Forms states
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [payRef, setPayRef] = useState('');

  const [expAmount, setExpAmount] = useState('');
  const [expCat, setExpCat] = useState('MARKETING');
  const [expDesc, setExpDesc] = useState('');

  // RLS Isolation
  const agencyInvoices = invoices.filter(i => i.agencyId === currentAgency.id);
  const agencyPayments = payments.filter(p => p.agencyId === currentAgency.id);
  const agencyExpenses = expenses.filter(e => e.agencyId === currentAgency.id);
  const agencyPayouts = vendorPayouts.filter(vp => vp.agencyId === currentAgency.id);

  // Totals
  const totalInvoiced = agencyInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const cashCollected = agencyPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalExpenses = agencyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPayouts = agencyPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
  const netProfit = cashCollected - totalExpenses;

  // Expense breakdown for Chart
  const expenseSummary = agencyExpenses.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

  const chartData = Object.keys(expenseSummary).map((cat) => ({
    name: cat,
    value: expenseSummary[cat],
  }));

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal || !payAmount) return;

    recordPayment(showPaymentModal, Number(payAmount), payMethod, payRef);
    setPayAmount('');
    setPayRef('');
    setShowPaymentModal(null);
    alert('Payment transaction recorded successfully.');
  };

  const handleRecordExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount) return;

    recordExpense(Number(expAmount), expCat, expDesc);
    setExpAmount('');
    setExpDesc('');
    setShowExpenseModal(false);
    alert('Expense logged successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
            Billing & ERP Ledger Accounts
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Log partial payments, track vendor disbursement payouts, record company utilities, and calculate net margins.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-white text-xs font-semibold flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
        {/* Gross Invoiced */}
        <div className="p-4 bg-card border border-border rounded-xl flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gross Invoiced</span>
          <div>
            <span className="block text-xl font-bold mt-2 text-foreground">₹{totalInvoiced.toLocaleString('en-IN')}</span>
            <span className="text-[9px] text-muted-foreground">Total billings generated</span>
          </div>
        </div>

        {/* Cash Collected */}
        <div className="p-4 bg-card border border-border rounded-xl flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cash Receipts</span>
          <div>
            <span className="block text-xl font-bold mt-2 text-emerald-500">₹{cashCollected.toLocaleString('en-IN')}</span>
            <span className="text-[9px] text-emerald-500 font-semibold">
              {totalInvoiced > 0 ? Math.round((cashCollected / totalInvoiced) * 100) : 0}% collection index
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-4 bg-card border border-border rounded-xl flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Operational Expenses</span>
          <div>
            <span className="block text-xl font-bold mt-2 text-pink-500">₹{totalExpenses.toLocaleString('en-IN')}</span>
            <span className="text-[9px] text-muted-foreground">Logistics + Admin overheads</span>
          </div>
        </div>

        {/* Vendor Payouts */}
        <div className="p-4 bg-card border border-border rounded-xl flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Disbursed Payouts</span>
          <div>
            <span className="block text-xl font-bold mt-2 text-indigo-400">₹{totalPayouts.toLocaleString('en-IN')}</span>
            <span className="text-[9px] text-muted-foreground">Paid to service providers</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-4 bg-card border border-border rounded-xl flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gross Cash Profit</span>
          <div>
            <span className={`block text-xl font-bold mt-2 ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              ₹{netProfit.toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] text-muted-foreground">Net current cash liquidity</span>
          </div>
        </div>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs items-start">
        {/* Left pane: Logs tabs (2 columns) */}
        <div className="lg:col-span-2 p-5 bg-card border border-border rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            {/* Tabs triggers */}
            <div className="flex space-x-1 bg-secondary/80 p-0.5 rounded-lg border border-border">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === 'invoices' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Client Invoices
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === 'expenses' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Expense Log
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === 'payouts' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Vendor Payouts
              </button>
            </div>
            
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {activeTab === 'invoices' && 'Accounts Receivable'}
              {activeTab === 'expenses' && 'Accounts Payable'}
              {activeTab === 'payouts' && 'Vendor Disbursements'}
            </span>
          </div>

          {/* Tab 1: Invoices */}
          {activeTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                    <th className="pb-2">Invoice Number</th>
                    <th className="pb-2">Total Price</th>
                    <th className="pb-2">Due Date</th>
                    <th className="pb-2 text-center">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {agencyInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-secondary/10">
                      <td className="py-2.5 font-semibold text-foreground flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{inv.invoiceNumber}</span>
                      </td>
                      <td className="py-2.5 font-bold">₹{Number(inv.amount).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 text-muted-foreground">{inv.dueDate}</td>
                      <td className="py-2.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                          inv.status === 'PARTIALLY_PAID' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        {inv.status !== 'PAID' && (
                          <button
                            onClick={() => setShowPaymentModal(inv.id)}
                            className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded font-bold text-[10px] transition-colors"
                          >
                            Record Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {agencyInvoices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">No invoices recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Expenses */}
          {activeTab === 'expenses' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Date Logged</th>
                    <th className="pb-2 text-right">Debit Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {agencyExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-secondary/10">
                      <td className="py-2.5 font-semibold text-foreground">
                        <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-500 text-[9px] font-bold uppercase">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-muted-foreground">{exp.description || 'General expense'}</td>
                      <td className="py-2.5 text-muted-foreground">
                        {new Date(exp.expenseDate).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 text-right font-bold text-pink-500">
                        -₹{Number(exp.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  {agencyExpenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">No business expenses logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Vendor Payouts */}
          {activeTab === 'payouts' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                    <th className="pb-2">Disbursement Vendor</th>
                    <th className="pb-2">Payout Date</th>
                    <th className="pb-2 text-right">Debit Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {agencyPayouts.map((pout) => {
                    const vendor = vendors.find(v => v.id === pout.vendorId);
                    return (
                      <tr key={pout.id} className="hover:bg-secondary/10">
                        <td className="py-2.5 font-semibold text-foreground flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                            {vendor?.name.charAt(0) || 'V'}
                          </div>
                          <span>{vendor?.name || 'Partner Provider'}</span>
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {new Date(pout.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 text-right font-bold text-indigo-400">
                          -₹{Number(pout.amount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                  {agencyPayouts.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-muted-foreground">No vendor payouts recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right pane: Expense breakdown graph (1 column) */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expenses Allocation Chart</h2>
            <ChartIcon className="w-4 h-4 text-primary shrink-0" />
          </div>
          
          <div className="h-44 relative flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1f2937', borderColor: '#374151' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-muted-foreground/60 italic">No charts coordinates.</span>
            )}
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-bold">₹{totalExpenses.toLocaleString('en-IN')}</span>
              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Debit Total</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[10px]">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-1 rounded bg-secondary/20">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-medium uppercase">{item.name}</span>
                </div>
                <span className="font-bold text-foreground">₹{item.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card border border-border p-6 rounded-xl shadow-2xl space-y-4 animate-scale-in text-xs">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-sm font-bold">Record Customer Receipt</h2>
              <button onClick={() => setShowPaymentModal(null)} className="p-1 rounded hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Received Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="120000"
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="CASH">Cash Payment</option>
                  <option value="UPI">UPI Gateway</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Transaction Reference ID
                </label>
                <input
                  type="text"
                  required
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="TXN-908123912"
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(null)}
                  className="px-4 py-2 rounded hover:bg-secondary border border-border font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Log Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card border border-border p-6 rounded-xl shadow-2xl space-y-4 animate-scale-in text-xs">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-sm font-bold">Log Business Overhead</h2>
              <button onClick={() => setShowExpenseModal(false)} className="p-1 rounded hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordExpenseSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Overhead Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="15000"
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Overhead Category
                </label>
                <select
                  value={expCat}
                  onChange={(e) => setExpCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                >
                  <option value="MARKETING">Marketing & Client Ads</option>
                  <option value="SALARIES">Employee Salaries</option>
                  <option value="UTILITIES">Database & Software Subscriptions</option>
                  <option value="TRAVEL_DOCS">Visa and Travel Passports Procurement</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Overhead Details
                </label>
                <input
                  type="text"
                  required
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. Kashmir campaign creative spend"
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded hover:bg-secondary border border-border font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
