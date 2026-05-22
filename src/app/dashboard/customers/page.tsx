/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
'use client';

import React, { useState } from 'react';
import { useStore, Customer } from '@/lib/store';
import { 
  Users,
  Plus,
  Search,
  FileText,
  Upload,
  History,
  X,
  Trash2,
  Link as LinkIcon
} from 'lucide-react';

export default function CustomersPage() {
  const { customers, currentAgency, addCustomer, updateCustomer, uploadCustomerDoc } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');

  // Upload fields
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('Passport');
  const [docUploaded, setDocUploaded] = useState(false);

  const agencyCustomers = customers.filter(
    (c) =>
      c.agencyId === currentAgency.id &&
      (c.firstName + ' ' + c.lastName + ' ' + c.email)
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer({
      firstName,
      lastName,
      email,
      phone,
      passportNumber: passportNumber || undefined,
      passportExpiry: passportExpiry ? passportExpiry : undefined,
    });
    
    // Reset Form
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPassportNumber('');
    setPassportExpiry('');
    setShowAddModal(false);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !docName.trim()) return;

    // Simulate upload metadata
    uploadCustomerDoc(selectedCustomer.id, {
      name: docName,
      category: docCategory,
      size: `${(1 + Math.random() * 2).toFixed(1)} MB`,
    });

    // Re-select customer to update details view
    const updated = useStore.getState().customers.find(c => c.id === selectedCustomer.id);
    if (updated) setSelectedCustomer(updated);

    setDocName('');
    setDocUploaded(true);
    setTimeout(() => setDocUploaded(false), 2000);
  };

  const isPassportExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate).getTime() < new Date().getTime();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
            Customer Database Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage profiles, record passport records, upload visas, and view booking histories.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/10 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="relative text-xs">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter customers by name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border focus:border-primary focus:outline-none"
        />
      </div>

      {/* Customers Table / Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Customers list table */}
        <div className="lg:col-span-2 p-5 bg-card border border-border rounded-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Customer Registry</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/50 text-[10px] text-muted-foreground uppercase font-bold">
                  <th className="pb-2">Customer Profile</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Phone</th>
                  <th className="pb-2">Passport No.</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {agencyCustomers.map((cust) => {
                  const expired = isPassportExpired(cust.passportExpiry);
                  
                  return (
                    <tr 
                      key={cust.id} 
                      onClick={() => setSelectedCustomer(cust)}
                      className={`hover:bg-secondary/20 cursor-pointer ${selectedCustomer?.id === cust.id ? 'bg-primary/5' : ''}`}
                    >
                      <td className="py-3 font-semibold text-foreground flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {cust.firstName.charAt(0)}{cust.lastName.charAt(0)}
                        </div>
                        <span>{cust.firstName} {cust.lastName}</span>
                      </td>
                      <td className="py-3 text-muted-foreground">{cust.email}</td>
                      <td className="py-3 text-muted-foreground">{cust.phone || 'None'}</td>
                      <td className="py-3 font-mono">
                        {cust.passportNumber ? (
                          <span className={`inline-flex items-center space-x-1 ${expired ? 'text-red-400 font-bold' : ''}`}>
                            <span>{cust.passportNumber}</span>
                            {expired && (
                              <span title="Passport Expired" className="inline-flex shrink-0">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 italic">Not set</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(cust);
                          }}
                          className="text-[10px] text-primary font-semibold hover:underline"
                        >
                          Manage Documents
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {agencyCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No customer profiles match this search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Documents & Details Panel */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-6">
          {selectedCustomer ? (
            <div className="space-y-6 text-xs animate-scale-in">
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {selectedCustomer.firstName.charAt(0)}{selectedCustomer.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{selectedCustomer.firstName} {selectedCustomer.lastName}</h3>
                    <span className="text-[10px] text-muted-foreground">{selectedCustomer.email}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-1 rounded hover:bg-secondary">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Passport details */}
              <div className="space-y-2">
                <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  Passport Information
                </span>
                <div className="p-3 bg-secondary/30 border border-border/40 rounded-xl grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-muted-foreground">Passport No:</span>
                    <p className="font-semibold font-mono">{selectedCustomer.passportNumber || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Expiry Date:</span>
                    <p className={`font-semibold ${isPassportExpired(selectedCustomer.passportExpiry) ? 'text-red-400 font-bold' : ''}`}>
                      {selectedCustomer.passportExpiry || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Travel history */}
              <div className="space-y-2">
                <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-1.5">
                  <History className="w-3.5 h-3.5 text-primary" />
                  <span>Historical Travel History</span>
                </span>
                <div className="space-y-1">
                  {selectedCustomer.travelHistory.map((hist, idx) => (
                    <div key={idx} className="p-2 rounded bg-secondary/50 border border-border/30">
                      {hist}
                    </div>
                  ))}
                  {selectedCustomer.travelHistory.length === 0 && (
                    <span className="text-muted-foreground/60 italic">No travel history logged.</span>
                  )}
                </div>
              </div>

              {/* Documents lists */}
              <div className="space-y-2">
                <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  Uploaded Document Scans
                </span>
                <div className="space-y-2">
                  {selectedCustomer.documents.map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-secondary/20 border border-border/40">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold truncate max-w-[130px]">{doc.name}</p>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold">{doc.category} ({doc.size})</span>
                        </div>
                      </div>
                      <a href="#" className="p-1 hover:bg-secondary rounded text-primary text-[10px] font-bold flex items-center space-x-1">
                        <LinkIcon className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                  {selectedCustomer.documents.length === 0 && (
                    <span className="text-muted-foreground/60 italic">No documents uploaded.</span>
                  )}
                </div>
              </div>

              {/* Upload Form simulator */}
              <form onSubmit={handleUploadSubmit} className="p-3 bg-secondary/35 border border-border rounded-lg space-y-3">
                <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  Simulate Document Upload
                </span>
                
                {docUploaded && (
                  <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold text-center border border-emerald-500/20">
                    File uploaded & RLS encrypted successfully!
                  </div>
                )}

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value)}
                      className="px-2 py-1 bg-card border border-border rounded text-[11px] focus:outline-none"
                    >
                      <option value="Passport">Passport Copy</option>
                      <option value="Visa">Visa Letter</option>
                      <option value="Flight Ticket">Flight Ticket</option>
                      <option value="Hotel Voucher">Hotel Voucher</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="e.g. visa_france.pdf"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      className="px-2 py-1 bg-card border border-border rounded text-[11px] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-[10px] flex items-center justify-center space-x-1 shadow shadow-indigo-600/10"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 text-muted-foreground">
              <Users className="w-8 h-8 text-muted-foreground/40" />
              <p>Select a customer profile to view documents, passports, and upload files.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-xl shadow-2xl space-y-4 animate-scale-in text-xs">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-sm font-bold">Register Customer Profile</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Robert"
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Carter"
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-9871"
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Passport No. (Optional)
                  </label>
                  <input
                    type="text"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    placeholder="US87654321"
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Passport Expiration
                  </label>
                  <input
                    type="date"
                    value={passportExpiry}
                    onChange={(e) => setPassportExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none"
                  />
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
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
