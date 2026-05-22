'use client';

import React, { useState } from 'react';
import { useStore, Vendor } from '@/lib/store';
import { 
  Building2, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  DollarSign, 
  ShieldAlert, 
  X,
  TrendingUp,
  CreditCard
} from 'lucide-react';

export default function VendorsPage() {
  const { vendors, currentAgency, addVendor, recordVendorPayout } = useStore();
  const [search, setSearch] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  // Add form fields
  const [vName, setVName] = useState('');
  const [vType, setVType] = useState<'SERVICE' | 'PACKAGE'>('SERVICE');
  const [vEmail, setVEmail] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vAddress, setVAddress] = useState('');

  // Rates add fields
  const [rateName, setRateName] = useState('');
  const [rateType, setRateType] = useState('HOTEL');
  const [ratePrice, setRatePrice] = useState('');

  const agencyVendors = vendors.filter(
    (v) =>
      v.agencyId === currentAgency.id &&
      (v.name + ' ' + v.type).toLowerCase().includes(search.toLowerCase())
  );

  // Set default selected vendor
  React.useEffect(() => {
    if (agencyVendors.length > 0 && !selectedVendorId) {
      setSelectedVendorId(agencyVendors[0].id);
    }
  }, [agencyVendors, selectedVendorId]);

  const activeVendor = agencyVendors.find((v) => v.id === selectedVendorId);

  const handleRegisterVendor = (e: React.FormEvent) => {
    e.preventDefault();
    addVendor({
      name: vName,
      type: vType,
      email: vEmail,
      phone: vPhone,
      address: vAddress,
      rates: [
        { name: 'Standard Room Rate', type: 'HOTEL', price: 120 }
      ],
    });

    setVName('');
    setVEmail('');
    setVPhone('');
    setVAddress('');
    setShowAddModal(false);
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVendor || !payoutAmount) return;

    recordVendorPayout(activeVendor.id, Number(payoutAmount));
    setPayoutAmount('');
    alert(`Payout of $${payoutAmount} registered. Vendor balance updated.`);
  };

  const handleAddRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVendor || !rateName.trim() || !ratePrice) return;

    const currentRates = activeVendor.rates || [];
    const updatedRates = [
      ...currentRates,
      { name: rateName, type: rateType, price: Number(ratePrice) }
    ];

    useStore.getState().updateVendor(activeVendor.id, {
      rates: updatedRates
    });

    setRateName('');
    setRatePrice('');
    alert('Rate segment recorded.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
            Vendor accounts & rates
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor service provider rate registries, track outstanding vendor payouts, and maintain ledgers.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/10 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vendor</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative text-xs">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter vendors by name or service category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border focus:border-primary focus:outline-none"
        />
      </div>

      {/* Grid workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs items-start">
        {/* Left Side: Table of vendors */}
        <div className="lg:col-span-2 p-5 bg-card border border-border rounded-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registered Partners Directory</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                  <th className="pb-2">Vendor Name</th>
                  <th className="pb-2">Service Type</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2 text-right">Owed Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {agencyVendors.map((vendor) => (
                  <tr 
                    key={vendor.id} 
                    onClick={() => setSelectedVendorId(vendor.id)}
                    className={`hover:bg-secondary/20 cursor-pointer ${selectedVendorId === vendor.id ? 'bg-primary/5' : ''}`}
                  >
                    <td className="py-3 font-semibold text-foreground flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {vendor.name.charAt(0)}
                      </div>
                      <span>{vendor.name}</span>
                    </td>
                    <td className="py-3 text-muted-foreground uppercase font-bold text-[9px] tracking-wider">
                      {vendor.type}
                    </td>
                    <td className="py-3 text-muted-foreground">{vendor.email || 'None'}</td>
                    <td className="py-3 text-right font-bold text-amber-500">
                      ${Number(vendor.ledgerBalance).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {agencyVendors.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No vendors match this query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Ledger & Rate card details */}
        <div className="space-y-6">
          {activeVendor ? (
            <div className="p-5 bg-card border border-border rounded-xl space-y-6 animate-scale-in">
              <div className="border-b border-border pb-4">
                <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-wider">
                  Partner Profile Details
                </span>
                <h3 className="text-sm font-bold mt-1 text-foreground">{activeVendor.name}</h3>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  {activeVendor.type} Vendor Account
                </span>
              </div>

              {/* Vendor details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{activeVendor.email || 'No email registered'}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{activeVendor.phone || 'No phone registered'}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{activeVendor.address || 'No address registered'}</span>
                </div>
              </div>

              {/* Ledger Outstanding Balance Payouts */}
              <div className="p-4 rounded-xl bg-secondary/35 border border-border/80 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[9px] text-muted-foreground uppercase tracking-wider">
                    Ledger Account Balance
                  </span>
                  <span className="font-bold text-amber-500">
                    ${Number(activeVendor.ledgerBalance).toLocaleString()} Owed
                  </span>
                </div>

                <form onSubmit={handlePayoutSubmit} className="flex gap-2">
                  <input
                    type="number"
                    required
                    placeholder="Disburse Amount ($)"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded bg-card border border-border focus:outline-none text-[11px]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px] flex items-center space-x-1 shrink-0"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Disburse Payout</span>
                  </button>
                </form>
              </div>

              {/* Rates registry */}
              <div className="space-y-3">
                <h4 className="font-bold text-[9px] text-muted-foreground uppercase tracking-wider">
                  Contract Rate Schedules
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {activeVendor.rates?.map((rate, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded bg-secondary/20 border border-border/30">
                      <div>
                        <p className="font-semibold text-foreground">{rate.name}</p>
                        <span className="text-[8px] text-muted-foreground uppercase font-bold">{rate.type}</span>
                      </div>
                      <span className="font-bold text-emerald-500">${Number(rate.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Add new rate form */}
                <form onSubmit={handleAddRate} className="p-3 bg-secondary/20 border border-border/60 rounded-lg space-y-2">
                  <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-wider">
                    Register New Rate Card
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={rateType}
                      onChange={(e) => setRateType(e.target.value)}
                      className="px-2 py-1 bg-card border border-border rounded text-[10px] focus:outline-none"
                    >
                      <option value="HOTEL">Hotel stay</option>
                      <option value="FLIGHT">Flight Seat</option>
                      <option value="VEHICLE">Transfer Car</option>
                      <option value="ACTIVITY">Excursion</option>
                    </select>
                    <input
                      type="number"
                      required
                      placeholder="Price ($)"
                      value={ratePrice}
                      onChange={(e) => setRatePrice(e.target.value)}
                      className="px-2 py-1 bg-card border border-border rounded text-[10px] focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deluxe Room Season-High"
                    value={rateName}
                    onChange={(e) => setRateName(e.target.value)}
                    className="w-full px-2 py-1 bg-card border border-border rounded text-[10px] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[9px]"
                  >
                    Log Rate Schedule
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-muted-foreground border border-dashed border-border rounded-xl">
              Select a vendor profile to inspect ledger rates and accounts.
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-xl shadow-2xl space-y-4 animate-scale-in text-xs">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-sm font-bold">Register Service Vendor</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterVendor} className="space-y-4">
              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  required
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  placeholder="e.g. Four Seasons Resort Ubud"
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Vendor Type
                </label>
                <select
                  value={vType}
                  onChange={(e) => setVType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                >
                  <option value="SERVICE">Service Vendor (Individual Flights, Hotels, Guides)</option>
                  <option value="PACKAGE">Package Vendor (Total fixed package tours)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={vEmail}
                  onChange={(e) => setVEmail(e.target.value)}
                  placeholder="reservations@hotel.com"
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={vPhone}
                  onChange={(e) => setVPhone(e.target.value)}
                  placeholder="+62 361-98765"
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Physical HQ Address
                </label>
                <input
                  type="text"
                  value={vAddress}
                  onChange={(e) => setVAddress(e.target.value)}
                  placeholder="Ubud High Street, Bali"
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none"
                />
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
                  Add Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
