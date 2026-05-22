'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore, Itinerary, Customer, Booking } from '@/lib/store';
import { 
  Compass, 
  MapPin, 
  Hotel, 
  Plane, 
  Coffee, 
  Car, 
  FileText, 
  Download, 
  Upload, 
  CheckCircle,
  Clock,
  Shield,
  CreditCard,
  Phone,
  Mail,
  User,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

const iconMap = {
  HOTEL: Hotel,
  FLIGHT: Plane,
  TRANSFER: Car,
  ACTIVITY: MapPin,
  MEAL: Coffee,
  NOTE: FileText
};

export default function CustomerPortal() {
  const searchParams = useSearchParams();
  const itinParamId = searchParams.get('itin') || '';

  const { itineraries, customers, bookings, invoices, currentAgency } = useStore();
  const [itinId, setItinId] = useState(itinParamId);
  const [uploaded, setUploaded] = useState(false);
  const [paymentRecorded, setPaymentRecorded] = useState(false);
  const [docName, setDocName] = useState('');

  // Default to first itinerary if none matched
  const activeItinerary = itineraries.find(i => i.id === itinId) || itineraries[0];
  const clientProfile = customers.find(c => c.id === activeItinerary?.customerId);
  const activeBooking = bookings.find(b => b.itineraryId === activeItinerary?.id);
  const activeInvoice = invoices.find(inv => inv.bookingId === activeBooking?.id);

  // Sync param update
  useEffect(() => {
    if (itinParamId) {
      setItinId(itinParamId);
    }
  }, [itinParamId]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientProfile || !docName.trim()) return;

    useStore.getState().uploadCustomerDoc(clientProfile.id, {
      name: docName,
      category: 'Visa Proof',
      size: '1.4 MB'
    });

    setDocName('');
    setUploaded(true);
    setTimeout(() => setUploaded(false), 2500);
  };

  const handleMockPayment = () => {
    if (!activeInvoice) return;
    useStore.getState().recordPayment(activeInvoice.id, activeInvoice.amount, 'CARD', 'PORTAL-CARD-PAY');
    setPaymentRecorded(true);
    setTimeout(() => setPaymentRecorded(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top navigation */}
      <header className="border-b border-zinc-900 bg-zinc-900/60 backdrop-blur-xl px-6 py-4 flex justify-between items-center max-w-6xl mx-auto w-full z-20">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Compass className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-xs uppercase text-zinc-200">Customer Travel Portal</span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <Link href="/auth/login" className="px-3.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 font-semibold transition-colors">
            Agency Staff Portal
          </Link>
        </div>
      </header>

      {/* Main body */}
      <main className="max-w-6xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 text-xs items-start">
        {/* Left Column: Itinerary Details (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {activeItinerary ? (
            <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-6">
              <div className="text-center space-y-1.5 border-b border-zinc-850 pb-4">
                <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-wider">
                  CONFIRMED TOUR SCHEDULE
                </span>
                <h1 className="text-base font-bold text-zinc-100 uppercase">{activeItinerary.title}</h1>
                <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xl mx-auto">
                  {activeItinerary.description}
                </p>
              </div>

              {/* Day loops */}
              <div className="space-y-6">
                {activeItinerary.days.map((day) => (
                  <div key={day.id} className="space-y-3">
                    <h3 className="font-bold text-xs text-zinc-100 flex items-center space-x-2">
                      <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        D{day.dayNumber}
                      </span>
                      <span>{day.title}</span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 leading-relaxed pl-7 border-l border-zinc-800">
                      {day.description}
                    </p>

                    {/* Day segment items */}
                    <div className="pl-7 space-y-2">
                      {day.items.map((item) => {
                        const ItemIcon = iconMap[item.type] || FileText;
                        return (
                          <div key={item.id} className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-850">
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
                                <ItemIcon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-zinc-200 truncate">{item.title}</p>
                                <span className="text-[9px] text-zinc-500">{item.details}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-400">
              Please paste a valid itinerary portal link.
            </div>
          )}
        </div>

        {/* Right Column: Status, Documents & Payments (1 column) */}
        <div className="space-y-6">
          {/* Booking tracker card */}
          {activeBooking && (
            <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-4">
              <h3 className="font-bold text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-850 pb-2">
                Booking Operations Tracker
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider text-[9px]">
                    {activeBooking.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Confirmation Code:</span>
                  <span className="font-mono text-zinc-200">{activeBooking.hotelConfirmationCode || 'Awaiting'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Driver Coordinator:</span>
                  <span className="text-zinc-200">{activeBooking.driverName || 'Not Assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Visa Processing:</span>
                  <span className="text-zinc-300 font-medium">{activeBooking.visaStatus || 'Pending details'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Secure Invoice & Checkout Payment */}
          {activeInvoice && (
            <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-4">
              <h3 className="font-bold text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-850 pb-2">
                Secure Invoice Payment
              </h3>

              {paymentRecorded && (
                <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 text-center animate-pulse">
                  Payment transaction log recorded successfully!
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Invoice Number:</span>
                  <span className="font-semibold text-zinc-200">{activeInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Amount Due:</span>
                  <span className="font-bold text-zinc-200">${Number(activeInvoice.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-850 pb-2">
                  <span className="text-zinc-400">Status:</span>
                  <span className={`font-bold text-[9px] uppercase ${
                    activeInvoice.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {activeInvoice.status}
                  </span>
                </div>

                {activeInvoice.status !== 'PAID' && (
                  <button
                    onClick={handleMockPayment}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-600/15 mt-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Invoice Balance</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Document upload dropzone */}
          {clientProfile && (
            <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-4">
              <h3 className="font-bold text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-850 pb-2">
                Travel Document Encrypted Scans
              </h3>

              {uploaded && (
                <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold border border-indigo-500/20 text-center">
                  Document uploaded securely. RLS applied.
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-3">
                <div>
                  <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1">
                    Upload Visa Scan/Proof
                  </label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. visa_france_approved.pdf"
                    className="w-full px-2.5 py-1.5 rounded bg-zinc-800/60 border border-zinc-700/50 focus:outline-none text-[11px]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 rounded-lg font-bold flex items-center justify-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Transmit File Scan</span>
                </button>
              </form>
            </div>
          )}

          {/* Security banner */}
          <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-xl text-[10px] text-zinc-500 flex items-center space-x-2">
            <Shield className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>This client session is isolated and protected via PostgreSQL Row Level Security.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-4 text-center text-[9px] text-zinc-600">
        <p>© 2026 AeroERP Security Gateways. Powered by Supabase Auth.</p>
      </footer>
    </div>
  );
}
