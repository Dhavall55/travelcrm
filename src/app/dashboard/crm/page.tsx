/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
'use client';

import React, { useState } from 'react';
import { useStore, Lead } from '@/lib/store';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  X,
  Activity,
  Trash2,
  Clock,
  Filter
} from 'lucide-react';

const stages = [
  { id: 'NEW', name: 'New Leads', color: 'border-t-indigo-500 bg-indigo-500/5' },
  { id: 'CONTACTED', name: 'Contacted', color: 'border-t-sky-500 bg-sky-500/5' },
  { id: 'PROPOSAL_SENT', name: 'Proposal Sent', color: 'border-t-amber-500 bg-amber-500/5' },
  { id: 'NEGOTIATION', name: 'Negotiation', color: 'border-t-pink-500 bg-pink-500/5' },
  { id: 'CONFIRMED', name: 'Confirmed', color: 'border-t-emerald-500 bg-emerald-500/5' },
  { id: 'LOST', name: 'Lost', color: 'border-t-zinc-500 bg-zinc-500/5' },
] as const;

export default function CRMPage() {
  const { 
    leads, 
    leadNotes, 
    leadActivities, 
    leadFollowups, 
    currentAgency, 
    users, 
    addLead, 
    updateLeadStatus, 
    updateLead,
    deleteLead, 
    addLeadNote, 
    addLeadFollowup 
  } = useStore();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterAgent, setFilterAgent] = useState('ALL');
  type SortBy = 'value' | 'date';
const [sortBy, setSortBy] = useState<SortBy>('date');

  // Modal / Selection state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // New Lead Form state
  const [newTitle, setNewTitle] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newSource, setNewSource] = useState('Website');
  const [newAssigned, setNewAssigned] = useState('');

  // Lead Details Notes/Reminders form state
  const [noteContent, setNoteContent] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [followupNotes, setFollowupNotes] = useState('');

  // filter leads based on search query, current agency, and selected filter options
  const agencyLeads = leads
    .filter(l => l.agencyId === currentAgency.id)
    .filter(l => {
      const matchSearch = (l.title + ' ' + l.firstName + ' ' + l.lastName)
        .toLowerCase()
        .includes(search.toLowerCase());
      
      const matchAgent = filterAgent === 'ALL' || l.assignedToId === filterAgent;
      
      return matchSearch && matchAgent;
    })
    .sort((a, b) => {
      if (sortBy === 'value') {
        return Number(b.value) - Number(a.value);
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Get staff for dropdown list
  const staff = users.filter(u => u.agencyId === currentAgency.id && u.role !== 'Customer' && u.role !== 'Vendor');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      title: newTitle,
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail || undefined,
      phone: newPhone || undefined,
      status: 'NEW',
      value: Number(newValue) || 0,
      source: newSource,
      assignedToId: newAssigned || undefined,
    });
    
    // Reset Form
    setNewTitle('');
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewPhone('');
    setNewValue('');
    setNewSource('Website');
    setNewAssigned('');
    setShowAddModal(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !noteContent.trim()) return;
    addLeadNote(selectedLead.id, noteContent);
    setNoteContent('');
  };

  const handleAddFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !followupDate) return;
    addLeadFollowup(selectedLead.id, new Date(followupDate).toISOString(), followupNotes);
    setFollowupDate('');
    setFollowupNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
            Lead CRM Pipeline
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualize client conversions. Drag or select status dropdowns to transition stages.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/10 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Lead</span>
        </button>
      </div>

      {/* Search, Filter, Sort Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads by customer name or destination request..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border focus:border-primary focus:outline-none"
          />
        </div>
        
        {/* Filter Agent */}
        <div className="flex items-center space-x-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Assignee:</span>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-card border border-border focus:outline-none"
          >
            <option value="ALL">All Agents</option>
            {staff.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {/* Sort options */}
        <div className="flex items-center space-x-2 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-2.5 py-1.5 rounded-lg bg-card border border-border focus:outline-none"
          >
            <option value="date">Date Added</option>
            <option value="value">Lead Value</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = agencyLeads.filter(l => l.status === stage.id);
          const stageTotalValue = stageLeads.reduce((sum, l) => sum + Number(l.value), 0);

          return (
            <div 
              key={stage.id} 
              className={`flex flex-col rounded-xl border border-border min-w-[200px] max-h-[70vh] ${stage.color} overflow-hidden`}
            >
              {/* Stage Header */}
              <div className="p-3 border-b border-border/40 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-semibold text-xs text-foreground tracking-tight">{stage.name}</h3>
                  <span className="text-[10px] text-muted-foreground font-bold">
                    ${stageTotalValue.toLocaleString()}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-bold">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="p-2 space-y-2 overflow-y-auto flex-1">
                {stageLeads.map((lead) => {
                  const assignee = staff.find(u => u.id === lead.assignedToId);
                  
                  return (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="p-3 bg-card border border-border/60 rounded-lg hover:border-indigo-500/40 hover:shadow-md cursor-pointer transition-all hover-card-trigger space-y-2 relative"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded truncate max-w-[80px]">
                          {lead.source || 'Direct'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500">
                          ${Number(lead.value).toLocaleString()}
                        </span>
                      </div>

                      <h4 className="font-semibold text-xs leading-tight tracking-tight text-foreground line-clamp-1">
                        {lead.title}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                        <span className="truncate">
                          {lead.firstName} {lead.lastName}
                        </span>
                        
                        {assignee && (
                          <div className="w-5 h-5 rounded-full bg-indigo-600/10 text-primary flex items-center justify-center font-bold text-[8px]" title={`Assigned to ${assignee.name}`}>
                            {assignee.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {stageLeads.length === 0 && (
                  <div className="text-center py-8 text-[10px] text-muted-foreground/60 border border-dashed border-border/30 rounded-lg">
                    Stage empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border p-6 rounded-xl shadow-2xl space-y-4 animate-scale-in text-xs">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-sm font-bold">Record Customer Lead</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Lead Goal / Destination Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Honeymoon Maldives Explorer"
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Client First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="Robert"
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Client Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Carter"
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@gmail.com"
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 555-0192"
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Est. Deal Value ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="4500"
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Lead Source
                  </label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                  >
                    <option value="Website">Website Form</option>
                    <option value="Referral">Client Referral</option>
                    <option value="Instagram">Social Ads</option>
                    <option value="WhatsApp">Direct WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Assign Agent
                  </label>
                  <select
                    value={newAssigned}
                    onChange={(e) => setNewAssigned(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {staff.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg hover:bg-secondary border border-border font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save Lead Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Details Drawer / Dialog */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-5 text-xs h-[85vh] animate-scale-in">
            {/* Left details panel (3 columns) */}
            <div className="md:col-span-3 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border h-full overflow-y-auto">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-wider">
                      Lead Card Details
                    </span>
                    <h2 className="text-base font-bold mt-1 text-foreground">{selectedLead.title}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedLead(null)}
                    className="p-1 rounded hover:bg-secondary md:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Edit Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                      Lead Status Pipeline
                    </label>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded bg-secondary border border-border text-xs focus:outline-none"
                    >
                      {stages.map((st) => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                      Est. Value ($)
                    </label>
                    <input
                      type="number"
                      value={selectedLead.value}
                      onChange={(e) => updateLead(selectedLead.id, { value: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-secondary border border-border text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                      Assign Employee
                    </label>
                    <select
                      value={selectedLead.assignedToId || ''}
                      onChange={(e) => updateLead(selectedLead.id, { assignedToId: e.target.value || undefined })}
                      className="w-full px-2.5 py-1.5 rounded bg-secondary border border-border text-xs focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {staff.map((st) => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                      Source Gateway
                    </label>
                    <input
                      type="text"
                      value={selectedLead.source || ''}
                      onChange={(e) => updateLead(selectedLead.id, { source: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-secondary border border-border text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
                  <h3 className="font-bold text-[10px] uppercase text-muted-foreground tracking-wider">
                    Customer Profile Contact
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Full Name:</span>
                      <p className="font-semibold">{selectedLead.firstName} {selectedLead.lastName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Source Channel:</span>
                      <p className="font-semibold">{selectedLead.source || 'Manual CRM input'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-semibold">{selectedLead.email || 'None'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-semibold">{selectedLead.phone || 'None'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger operations */}
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete lead record permanently?')) {
                      deleteLead(selectedLead.id);
                      setSelectedLead(null);
                    }
                  }}
                  className="px-3.5 py-2 rounded-lg bg-red-950/20 hover:bg-red-500/10 border border-red-900/30 text-red-500 font-semibold flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 rounded-lg hover:bg-secondary border border-border font-medium"
                >
                  Close Detail
                </button>
              </div>
            </div>

            {/* Right activities panel (2 columns) */}
            <div className="md:col-span-2 p-6 flex flex-col justify-between bg-secondary/15 h-full overflow-hidden">
              {/* Top - Activity history list */}
              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-primary" />
                    <span>CRM Activity Timeline</span>
                  </span>
                  <button 
                    onClick={() => setSelectedLead(null)}
                    className="p-1 rounded hover:bg-secondary hidden md:block"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {/* Lead notes */}
                  {leadNotes.filter(n => n.leadId === selectedLead.id).map(note => (
                    <div key={note.id} className="p-2.5 rounded-lg bg-card border border-border/40 text-xs">
                      <div className="flex justify-between text-[9px] text-muted-foreground">
                        <span className="font-semibold">{note.createdBy}</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-1 text-foreground leading-relaxed">{note.content}</p>
                    </div>
                  ))}

                  {/* Lead audit movements */}
                  {leadActivities.filter(a => a.leadId === selectedLead.id).map(act => (
                    <div key={act.id} className="flex space-x-2 text-[11px] text-muted-foreground p-1">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-foreground font-semibold">{act.createdBy}</span>: {act.description}
                        <span className="block text-[8px] text-muted-foreground/60">{new Date(act.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}

                  {/* Scheduled followups reminders */}
                  {leadFollowups.filter(f => f.leadId === selectedLead.id).map(fup => (
                    <div key={fup.id} className="p-2 bg-amber-500/10 border border-amber-500/20 text-[11px] rounded-lg text-amber-200">
                      <div className="flex justify-between font-semibold text-[9px]">
                        <span>FOLLOWUP REMINDER</span>
                        <span>{new Date(fup.scheduledAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-0.5 font-medium">{fup.notes}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom - Form adding note & reminders */}
              <div className="mt-4 pt-4 border-t border-border space-y-3 shrink-0">
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type call logs or notes here..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-card border border-border focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shrink-0"
                  >
                    Add Note
                  </button>
                </form>

                {/* Followup scheduler */}
                <form onSubmit={handleAddFollowup} className="p-3 bg-card border border-border/80 rounded-lg space-y-2">
                  <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Schedule Followup Call
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      value={followupDate}
                      onChange={(e) => setFollowupDate(e.target.value)}
                      className="px-2 py-1 rounded bg-secondary border border-border focus:outline-none text-[11px]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Discuss Bali deposits"
                      value={followupNotes}
                      onChange={(e) => setFollowupNotes(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded bg-secondary border border-border focus:outline-none text-[11px]"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded font-semibold text-[11px]"
                    >
                      Schedule
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
