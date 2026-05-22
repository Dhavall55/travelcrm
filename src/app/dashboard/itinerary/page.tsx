'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Itinerary, ItineraryDay, ItineraryItem, Customer } from '@/lib/store';
import { 
  Compass, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Printer, 
  Share2, 
  ArrowUp, 
  ArrowDown, 
  Hotel, 
  Plane, 
  MapPin, 
  Coffee, 
  Car, 
  FileText, 
  CheckCircle,
  X,
  User,
  Percent,
  PlusCircle,
  BookOpen
} from 'lucide-react';

const iconMap = {
  HOTEL: Hotel,
  FLIGHT: Plane,
  TRANSFER: Car,
  ACTIVITY: MapPin,
  MEAL: Coffee,
  NOTE: FileText
};

export default function ItineraryPage() {
  const { 
    itineraries, 
    currentAgency, 
    customers, 
    addItinerary, 
    updateItinerary, 
    addItineraryDay, 
    deleteItineraryDay, 
    addItineraryItem, 
    deleteItineraryItem, 
    reorderItineraryDays,
    logAction 
  } = useStore();

  const agencyItineraries = itineraries.filter(i => i.agencyId === currentAgency.id);
  const agencyCustomers = customers.filter(c => c.agencyId === currentAgency.id);

  // States
  const [selectedItinId, setSelectedItinId] = useState<string>('');
  const [showAddItinModal, setShowAddItinModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState<{ dayId: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Add Itinerary form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCustId, setNewCustId] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  // Add Itinerary Item form
  const [itemType, setItemType] = useState<ItineraryItem['type']>('HOTEL');
  const [itemTitle, setItemTitle] = useState('');
  const [itemDetails, setItemDetails] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [itemSelling, setItemSelling] = useState('');

  // Select first itinerary on mount if exists
  useEffect(() => {
    if (agencyItineraries.length > 0 && !selectedItinId) {
      setSelectedItinId(agencyItineraries[0].id);
    }
  }, [agencyItineraries, selectedItinId]);

  const activeItinerary = agencyItineraries.find(i => i.id === selectedItinId);
  const clientProfile = agencyCustomers.find(c => c.id === activeItinerary?.customerId);

  const handleCreateItin = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addItinerary({
      title: newTitle,
      description: newDesc,
      customerId: newCustId || undefined,
      startDate: newStartDate || undefined,
      endDate: newEndDate || undefined,
      status: 'DRAFT',
      totalPrice: 0,
      markupMargin: 15,
      taxRate: 10,
      isTemplate: false,
      days: []
    });

    setNewTitle('');
    setNewDesc('');
    setNewCustId('');
    setNewStartDate('');
    setNewEndDate('');
    setShowAddItinModal(false);
    setSelectedItinId(created.id);
  };

  const handleAddDay = () => {
    if (!activeItinerary) return;
    const dayNum = activeItinerary.days.length + 1;
    addItineraryDay(activeItinerary.id, `Day ${dayNum}: Tour Schedule`, 'Describe the sights to visit.');
  };

  const handleMoveDay = (index: number, direction: 'up' | 'down') => {
    if (!activeItinerary) return;
    const days = [...activeItinerary.days];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= days.length) return;
    
    // Swap
    const temp = days[index];
    days[index] = days[targetIndex];
    days[targetIndex] = temp;
    
    reorderItineraryDays(activeItinerary.id, days);
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItinerary || !showAddItemModal) return;

    addItineraryItem(activeItinerary.id, showAddItemModal.dayId, {
      type: itemType,
      title: itemTitle,
      details: itemDetails,
      costPrice: Number(itemCost) || 0,
      sellingPrice: Number(itemSelling) || 0,
    });

    setItemTitle('');
    setItemDetails('');
    setItemCost('');
    setItemSelling('');
    setShowAddItemModal(null);
  };

  // Simulating AI itinerary generation
  const handleAIGeneration = () => {
    if (!activeItinerary || !aiPrompt.trim()) return;
    setAiGenerating(true);

    setTimeout(() => {
      // Create a day
      const dayNum = activeItinerary.days.length + 1;
      addItineraryDay(
        activeItinerary.id, 
        `Day ${dayNum}: Custom AI Schedule`, 
        `AI generated schedule tailored for: "${aiPrompt}"`
      );

      // Re-query state to find the newly added day ID
      const updated = useStore.getState().itineraries.find(i => i.id === activeItinerary.id);
      const newDay = updated?.days[updated.days.length - 1];

      if (newDay) {
        addItineraryItem(activeItinerary.id, newDay.id, {
          type: 'HOTEL',
          title: 'Premium Jungle Villa Ubud Check-in',
          details: 'Welcome drinks and private plunge pool relaxation',
          costPrice: 280,
          sellingPrice: 320,
        });

        addItineraryItem(activeItinerary.id, newDay.id, {
          type: 'ACTIVITY',
          title: 'Private ATV Adventure & Sacred Temple Visit',
          details: 'Safety gear and English-speaking guide included',
          costPrice: 90,
          sellingPrice: 120,
        });

        addItineraryItem(activeItinerary.id, newDay.id, {
          type: 'MEAL',
          title: 'Fine Dining Sunset Degustation Menu',
          details: '5-course organic Balinese integration at Locavore Ubud',
          costPrice: 110,
          sellingPrice: 140,
        });
      }

      logAction('UPDATE', 'Itinerary', `Simulated AI Day Generation for prompt: ${aiPrompt}`);
      setAiPrompt('');
      setAiGenerating(false);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
            Interactive Itinerary Builder
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Construct Day-by-Day travel boards, calculate gross margins and markups, and export PDFs.
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedItinId}
            onChange={(e) => setSelectedItinId(e.target.value)}
            className="flex-1 sm:w-60 px-3 py-2 rounded-lg bg-card border border-border text-xs focus:outline-none"
          >
            {agencyItineraries.map((itin) => (
              <option key={itin.id} value={itin.id}>{itin.title}</option>
            ))}
            {agencyItineraries.length === 0 && (
              <option value="">No Active Plans</option>
            )}
          </select>

          <button
            onClick={() => setShowAddItinModal(true)}
            className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {activeItinerary ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs items-start">
          {/* Left panel: Build panel (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            {/* General info & Markup configurations */}
            <div className="p-5 bg-card border border-border rounded-xl space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Markup & Tax Configuration</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Markup Margin (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={activeItinerary.markupMargin}
                      onChange={(e) => updateItinerary(activeItinerary.id, { markupMargin: Number(e.target.value) })}
                      className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-secondary border border-border text-xs focus:outline-none text-right font-semibold"
                    />
                    <Percent className="w-3 h-3 text-muted-foreground absolute right-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    GST/Tax Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={activeItinerary.taxRate}
                      onChange={(e) => updateItinerary(activeItinerary.id, { taxRate: Number(e.target.value) })}
                      className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-secondary border border-border text-xs focus:outline-none text-right font-semibold"
                    />
                    <Percent className="w-3 h-3 text-muted-foreground absolute right-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={activeItinerary.status}
                    onChange={(e) => updateItinerary(activeItinerary.id, { status: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs focus:outline-none font-semibold"
                  >
                    <option value="DRAFT">Draft Plan</option>
                    <option value="SENT">Sent to Client</option>
                    <option value="APPROVED">Approved / Won</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Generator Simulator Block */}
            <div className="p-5 bg-card border border-border rounded-xl space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI Day Schedule Assistant</span>
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Create a 3-item adventure day in Ubud with waterfalls and local dinner..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                />
                <button
                  onClick={handleAIGeneration}
                  disabled={aiGenerating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white rounded-lg font-semibold shrink-0 flex items-center space-x-1"
                >
                  {aiGenerating ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Days Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Itinerary Day Cards</h2>
                <button
                  onClick={handleAddDay}
                  className="px-3 py-1.5 bg-secondary hover:bg-accent border border-border rounded-lg font-bold flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-primary" />
                  <span>Add Day</span>
                </button>
              </div>

              {activeItinerary.days.map((day, idx) => (
                <div key={day.id} className="p-4 bg-card border border-border rounded-xl space-y-4">
                  {/* Day Header */}
                  <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                        D{day.dayNumber}
                      </span>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => {
                          const daysCopy = [...activeItinerary.days];
                          daysCopy[idx] = { ...day, title: e.target.value };
                          updateItinerary(activeItinerary.id, { days: daysCopy });
                        }}
                        className="font-bold text-xs bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1"
                      />
                    </div>
                    {/* Shifting order & Delete tools */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleMoveDay(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-40"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDay(idx, 'down')}
                        disabled={idx === activeItinerary.days.length - 1}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-40"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteItineraryDay(activeItinerary.id, day.id)}
                        className="p-1 rounded hover:bg-secondary text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Day Description */}
                  <textarea
                    value={day.description}
                    onChange={(e) => {
                      const daysCopy = [...activeItinerary.days];
                      daysCopy[idx] = { ...day, description: e.target.value };
                      updateItinerary(activeItinerary.id, { days: daysCopy });
                    }}
                    rows={2}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/30 border border-border/40 focus:outline-none focus:border-primary resize-none text-[11px] text-muted-foreground"
                  />

                  {/* Day Items List */}
                  <div className="space-y-2">
                    {day.items.map((item) => {
                      const ItemIcon = iconMap[item.type] || FileText;
                      return (
                        <div key={item.id} className="flex justify-between items-center p-2.5 rounded-lg bg-secondary/20 border border-border/30">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="p-1.5 rounded bg-primary/10 text-primary">
                              <ItemIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate max-w-[200px]">{item.title}</p>
                              <span className="text-[9px] text-muted-foreground leading-none">{item.details}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 shrink-0">
                            <div className="text-right">
                              <span className="block font-bold text-foreground">${Number(item.sellingPrice).toLocaleString()}</span>
                              <span className="text-[8px] text-muted-foreground">cost: ${Number(item.costPrice).toLocaleString()}</span>
                            </div>
                            <button
                              onClick={() => deleteItineraryItem(activeItinerary.id, day.id, item.id)}
                              className="p-1 hover:bg-secondary rounded text-destructive"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={() => setShowAddItemModal({ dayId: day.id })}
                      className="w-full py-1.5 bg-secondary/15 hover:bg-secondary/40 border border-dashed border-border rounded-lg font-bold flex items-center justify-center space-x-1 text-primary text-[10px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Insert Segment Item</span>
                    </button>
                  </div>
                </div>
              ))}
              {activeItinerary.days.length === 0 && (
                <div className="text-center py-10 bg-card border border-dashed border-border rounded-xl text-muted-foreground">
                  No days mapped yet. Click "Add Day" above to start segmenting the tour schedule.
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Live Preview & Invoice computations (2 columns) */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-6 no-print">
            {/* Actions Block */}
            <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-xl flex gap-2 justify-between">
              <button
                onClick={handlePrint}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 rounded-lg font-bold flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Export PDF Itinerary</span>
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center justify-center space-x-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Proposal link</span>
              </button>
            </div>

            {/* Pricing details */}
            <div className="p-5 bg-card border border-border rounded-xl space-y-3.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Financial Summary Breakdown</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cumulative Items selling sum:</span>
                  <span className="font-semibold text-foreground">
                    ${activeItinerary.days.reduce((acc, d) => acc + d.items.reduce((s, i) => s + Number(i.sellingPrice), 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Markup calculation (+{activeItinerary.markupMargin}%):</span>
                  <span className="font-semibold text-foreground">
                    ${(activeItinerary.days.reduce((acc, d) => acc + d.items.reduce((s, i) => s + Number(i.sellingPrice), 0), 0) * (Number(activeItinerary.markupMargin) / 100)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Tax addition (+{activeItinerary.taxRate}%):</span>
                  <span className="font-semibold text-foreground">
                    ${(
                      (activeItinerary.days.reduce((acc, d) => acc + d.items.reduce((s, i) => s + Number(i.sellingPrice), 0), 0) * (1 + Number(activeItinerary.markupMargin) / 100)) * (Number(activeItinerary.taxRate) / 100)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-bold text-sm text-foreground">Final Client Price:</span>
                  <span className="font-bold text-sm text-emerald-500">
                    ${Number(activeItinerary.totalPrice).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Details info */}
            {clientProfile && (
              <div className="p-4 bg-card border border-border rounded-xl space-y-2">
                <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  Associated Traveler
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{clientProfile.firstName} {clientProfile.lastName}</span>
                  </div>
                  <span className="text-muted-foreground">{clientProfile.email}</span>
                </div>
              </div>
            )}

            {/* Itinerary Preview Board */}
            <div id="itinerary-preview-element" className="p-6 bg-card border border-border rounded-xl space-y-6 bg-gradient-to-b from-card to-secondary/10">
              <div className="text-center space-y-1.5 border-b border-border pb-4">
                <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-wider">
                  Customer Proposal View
                </span>
                <h3 className="text-sm font-bold text-foreground uppercase">{activeItinerary.title}</h3>
                <p className="text-[10px] text-muted-foreground italic px-4">{activeItinerary.description}</p>
              </div>

              <div className="space-y-4">
                {activeItinerary.days.map((day) => (
                  <div key={day.id} className="space-y-2.5">
                    <h4 className="font-bold text-xs text-foreground flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      <span>Day {day.dayNumber}: {day.title}</span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed pl-3 border-l border-border/40">
                      {day.description}
                    </p>

                    <div className="pl-3 space-y-1.5">
                      {day.items.map((item) => {
                        const ItemIcon = iconMap[item.type] || FileText;
                        return (
                          <div key={item.id} className="flex justify-between items-center text-[10px] bg-secondary/15 p-1.5 rounded">
                            <span className="flex items-center space-x-1.5">
                              <ItemIcon className="w-3.5 h-3.5 text-primary" />
                              <span className="font-medium">{item.title}</span>
                            </span>
                            <span className="text-muted-foreground font-mono">{item.details}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-2 border border-dashed border-border rounded-xl text-muted-foreground">
          <Compass className="w-8 h-8 text-muted-foreground/30 animate-spin-slow" />
          <p>No itinerary plans constructed for this agency tenant.</p>
        </div>
      )}

      {/* Add Itinerary Modal */}
      {showAddItinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-xl shadow-2xl space-y-4 animate-scale-in text-xs">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-sm font-bold">New Itinerary Proposal</h2>
              <button onClick={() => setShowAddItinModal(false)} className="p-1 rounded hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItin} className="space-y-4">
              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Itinerary Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Signature Luxury Bali Escape"
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Plan Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief description summarizing the sights covered."
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:border-primary"
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Associate Traveler / Customer Profile
                </label>
                <select
                  value={newCustId}
                  onChange={(e) => setNewCustId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                >
                  <option value="">None (Standalone Template)</option>
                  {agencyCustomers.map((cust) => (
                    <option key={cust.id} value={cust.id}>{cust.firstName} {cust.lastName} ({cust.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddItinModal(false)}
                  className="px-4 py-2 rounded-lg hover:bg-secondary border border-border font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Build Base Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-xl shadow-2xl space-y-4 animate-scale-in text-xs">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-sm font-bold">Add Itinerary Segment Segment</h2>
              <button onClick={() => setShowAddItemModal(null)} className="p-1 rounded hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Segment Type
                  </label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                  >
                    <option value="FLIGHT">Flight Ticket</option>
                    <option value="HOTEL">Hotel Stay</option>
                    <option value="TRANSFER">Vehicle Transfer</option>
                    <option value="ACTIVITY">Excursion Activity</option>
                    <option value="MEAL">Meal / dining</option>
                    <option value="NOTE">Custom Note</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Title / Description
                  </label>
                  <input
                    type="text"
                    required
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    placeholder="e.g. Grand Hyatt Deluxe Suite"
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Booking Details / Reference No
                </label>
                <input
                  type="text"
                  required
                  value={itemDetails}
                  onChange={(e) => setItemDetails(e.target.value)}
                  placeholder="e.g. Booking Code: GHB-8765. 1 Room, 7 Nights."
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Vendor Cost Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={itemCost}
                    onChange={(e) => setItemCost(e.target.value)}
                    placeholder="250"
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={itemSelling}
                    onChange={(e) => setItemSelling(e.target.value)}
                    placeholder="290"
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(null)}
                  className="px-4 py-2 rounded-lg hover:bg-secondary border border-border font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Insert Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share proposal modal */}
      {showShareModal && activeItinerary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-xl shadow-2xl space-y-4 animate-scale-in text-xs">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-sm font-bold">Share Customer Proposal</h2>
              <button onClick={() => setShowShareModal(false)} className="p-1 rounded hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Customers can review their hand-crafted itinerary, download vouchers, and make payments in their secure Customer Portal.
            </p>

            <div className="p-3 bg-secondary rounded-lg border border-border/80 flex items-center justify-between gap-2 font-mono">
              <span className="truncate text-primary text-[10px]">
                {typeof window !== 'undefined' ? `${window.location.origin}/portal/customer?itin=${activeItinerary.id}` : `/portal/customer?itin=${activeItinerary.id}`}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    typeof window !== 'undefined' ? `${window.location.origin}/portal/customer?itin=${activeItinerary.id}` : `/portal/customer?itin=${activeItinerary.id}`
                  );
                  alert('Share Link copied to Clipboard!');
                }}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[10px] shrink-0"
              >
                Copy Link
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
