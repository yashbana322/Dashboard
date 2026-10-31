import { useState, useMemo } from 'react';
import { X, Building2, CreditCard, PlusCircle, FileSpreadsheet, FileText, Truck, Edit3, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Client, Booking } from '../context/DataContext';
import RecordPaymentModal from './RecordPaymentModal';
import AddLeftoverModal from './AddLeftoverModal';
import PartyStatementModal from './PartyStatementModal';
import BiltyModal from './BiltyModal';
import NewBookingDrawer from './NewBookingDrawer';
import GstEditorModal from './GstEditorModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function ClientDetailDrawer({ isOpen, onClose, client: initialClient }: Props) {
  const { bookings, payments, leftovers, clients } = useData();
  const client = (initialClient ? clients.find(c => c.id === initialClient.id) : null) || initialClient;

  const [activeTab, setActiveTab] = useState<'TRIPS' | 'LEFTOVERS' | 'PAYMENTS' | 'INFO'>('TRIPS');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isLeftoverOpen, setIsLeftoverOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedBookingForBilty, setSelectedBookingForBilty] = useState<Booking | null>(null);
  const [isGstModalOpen, setIsGstModalOpen] = useState(false);

  // All bookings for this client
  const clientBookings = useMemo(() => {
    if (!client) return [];
    return bookings.filter(b => b.client.toLowerCase() === client.name.toLowerCase());
  }, [bookings, client]);

  // All payments received from this client
  const clientPayments = useMemo(() => {
    if (!client) return [];
    return payments.filter(
      p => p.partyType === 'CLIENT' && p.partyName.toLowerCase() === client.name.toLowerCase()
    );
  }, [payments, client]);

  // All leftovers recorded for this client
  const clientLeftovers = useMemo(() => {
    if (!client) return [];
    const list = leftovers || [];
    return list.filter(
      l => l.partyType === 'CLIENT' && l.partyName.toLowerCase() === client.name.toLowerCase()
    );
  }, [leftovers, client]);

  if (!isOpen || !client) return null;

  const totalBilled = client.totalBilled || 0;
  const totalPaid = client.totalPaid || 0;
  const outstanding = client.outstanding || 0;
  const creditLimit = client.creditLimit || 500000;
  const creditUsagePercent = creditLimit > 0 ? Math.min(100, Math.round((outstanding / creditLimit) * 100)) : 0;

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-[80] transition-mechanical" onClick={onClose} />

      <RecordPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        defaultPartyType="CLIENT"
        defaultPartyName={client.name}
        defaultAmount={outstanding}
      />

      <AddLeftoverModal
        isOpen={isLeftoverOpen}
        onClose={() => setIsLeftoverOpen(false)}
        defaultPartyType="CLIENT"
        defaultPartyName={client.name}
      />

      <PartyStatementModal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        initialPartyType="CLIENT"
        initialPartyName={client.name}
      />

      <BiltyModal
        isOpen={Boolean(selectedBookingForBilty)}
        onClose={() => setSelectedBookingForBilty(null)}
        booking={selectedBookingForBilty}
      />

      <NewBookingDrawer
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
      />

      <GstEditorModal
        isOpen={isGstModalOpen}
        onClose={() => setIsGstModalOpen(false)}
        entityType="CLIENT"
        entityId={client.id}
        entityName={client.name}
        currentGst={client.gst}
        currentPan={client.pan}
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-3xl bg-white shadow-2xl z-[80] overflow-y-auto animate-in slide-in-from-right-8 duration-300 border-l border-gray-200 flex flex-col justify-between">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-gray-50/90 border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-lg bg-gray-900 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                {client.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">{client.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    outstanding > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {outstanding > 0 ? `₹${outstanding.toLocaleString('en-IN')} Leftover Due` : 'Account Settled'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mt-1 font-mono">
                  <span>Client ID: <strong className="text-gray-900">{client.id}</strong></span>
                  {client.joinDate && <span>Partner Since: <strong className="text-gray-900">{client.joinDate}</strong></span>}
                  {client.gst && client.gst !== 'UNREGISTERED' ? (
                    <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded text-gray-800 border border-gray-200">
                      GST: <strong className="text-gray-900 font-bold">{client.gst}</strong>
                      <button
                        onClick={() => setIsGstModalOpen(true)}
                        className="text-gray-400 hover:text-black transition-colors"
                        title="Edit GST Number"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsGstModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 rounded text-[11px] font-bold transition-mechanical"
                    >
                      <Plus className="w-3 h-3 text-amber-700" />
                      + Add GST Number
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-200 transition-mechanical shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Ribbon */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-200/80">
            <button
              onClick={() => setIsPaymentOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded hover:bg-black transition-mechanical btn-press shadow-2xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Record Payment
            </button>
            <button
              onClick={() => setIsLeftoverOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold rounded hover:bg-amber-100 transition-mechanical btn-press shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
              + Add Leftover Due
            </button>
            <button
              onClick={() => setIsStatementOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-800 text-xs font-semibold rounded hover:bg-gray-100 transition-mechanical btn-press shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-gray-600" />
              Statement / Khata
            </button>
            <button
              onClick={() => setIsNewBookingOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold rounded hover:bg-blue-100 transition-mechanical btn-press shadow-2xs ml-auto"
            >
              <Truck className="w-3.5 h-3.5 text-blue-700" />
              Book Trip for Party
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 flex-1">

          {/* Key Financial Command Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Billed</span>
              <p className="text-xl font-bold font-mono text-gray-900 mt-1">₹{totalBilled.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-gray-500">{clientBookings.length} total shipments</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Cleared</span>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-1">₹{totalPaid.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-emerald-600">Payments deposited</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">Leftover Balance</span>
              <p className="text-xl font-black font-mono text-amber-900 mt-1">₹{outstanding.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-amber-800 font-semibold">{outstanding > 0 ? 'Pending Collection' : 'Zero Dues'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Credit Limit</span>
              <p className="text-xl font-bold font-mono text-gray-900 mt-1">₹{creditLimit.toLocaleString('en-IN')}</p>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full ${creditUsagePercent > 80 ? 'bg-red-600' : 'bg-gray-800'}`}
                  style={{ width: `${creditUsagePercent}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">{creditUsagePercent}% used</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 gap-4 sm:gap-6 text-xs font-semibold uppercase tracking-wider overflow-x-auto touch-scroll no-scrollbar whitespace-nowrap">
            <button
              onClick={() => setActiveTab('TRIPS')}
              className={`pb-3 transition-mechanical flex items-center gap-1.5 border-b-2 -mb-px shrink-0 ${
                activeTab === 'TRIPS'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Trips & Shipments ({clientBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('LEFTOVERS')}
              className={`pb-3 transition-mechanical flex items-center gap-1.5 border-b-2 -mb-px shrink-0 ${
                activeTab === 'LEFTOVERS'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Leftovers & Extra Dues ({clientLeftovers.length})
            </button>
            <button
              onClick={() => setActiveTab('PAYMENTS')}
              className={`pb-3 transition-mechanical flex items-center gap-1.5 border-b-2 -mb-px shrink-0 ${
                activeTab === 'PAYMENTS'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Payment Receipts ({clientPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('INFO')}
              className={`pb-3 transition-mechanical flex items-center gap-1.5 border-b-2 -mb-px shrink-0 ${
                activeTab === 'INFO'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Company Dossier
            </button>
          </div>

          {/* TAB 1: TRIPS & SHIPMENTS */}
          {activeTab === 'TRIPS' && (
            <div className="space-y-4">
              <div className="w-full overflow-x-auto touch-scroll border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs whitespace-nowrap min-w-[550px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                      <th className="py-2.5 px-3">Booking ID</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Route</th>
                      <th className="py-2.5 px-3">Vehicle & Transporter</th>
                      <th className="py-2.5 px-3 text-right">Freight (₹)</th>
                      <th className="py-2.5 px-3 text-center">Payment</th>
                      <th className="py-2.5 px-3 text-center">Bilty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/70 transition-mechanical">
                        <td className="py-3 px-3 font-mono font-bold text-gray-900">{b.id}</td>
                        <td className="py-3 px-3 font-mono text-gray-600">{b.pickupDate}</td>
                        <td className="py-3 px-3 font-medium text-gray-900">{b.route}</td>
                        <td className="py-3 px-3">
                          <p className="font-mono text-gray-800">{b.vehicleNo}</p>
                          <p className="text-[10px] text-gray-400">{b.transporter}</p>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-gray-900">
                          ₹{b.clientRate.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.clientPaymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.clientPaymentStatus === 'Partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {b.clientPaymentStatus} {b.clientPaidAmount < b.clientRate && `(Leftover: ₹${(b.clientRate - b.clientPaidAmount).toLocaleString('en-IN')})`}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setSelectedBookingForBilty(b)}
                            className="px-2 py-1 bg-white border border-gray-300 text-gray-800 font-semibold rounded hover:bg-gray-100 transition-mechanical text-[10px] inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-gray-600" />
                            LR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {clientBookings.length === 0 && (
                  <div className="text-center py-10 text-xs text-gray-400">
                    No trips booked for {client.name} yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LEFTOVERS & EXTRA CHARGES */}
          {activeTab === 'LEFTOVERS' && (
            <div className="space-y-4">
              <div className="w-full overflow-x-auto touch-scroll border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs whitespace-nowrap min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Booking Ref</th>
                      <th className="py-2.5 px-3">Reason / Particulars</th>
                      <th className="py-2.5 px-3 text-right">Leftover Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientLeftovers.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50/70 transition-mechanical">
                        <td className="py-3 px-3 font-mono text-gray-600">{l.date}</td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            {l.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-gray-500">{l.bookingId || 'Direct Khata'}</td>
                        <td className="py-3 px-3 text-gray-800 max-w-xs truncate">{l.notes || 'Manual Leftover Adjustment'}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-900">
                          +₹{l.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {clientLeftovers.length === 0 && (
                  <div className="text-center py-10 text-xs text-gray-400">
                    No extra leftovers, halting or detention charges recorded for {client.name}.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT RECEIPTS */}
          {activeTab === 'PAYMENTS' && (
            <div className="space-y-4">
              <div className="w-full overflow-x-auto touch-scroll border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs whitespace-nowrap min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Payment Mode</th>
                      <th className="py-2.5 px-3">UTR / Ref No.</th>
                      <th className="py-2.5 px-3">Booking / Notes</th>
                      <th className="py-2.5 px-3 text-right">Amount Received (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition-mechanical">
                        <td className="py-3 px-3 font-mono text-gray-600">{p.date}</td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {p.mode}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-gray-800 font-semibold">{p.refNo}</td>
                        <td className="py-3 px-3 text-gray-600 max-w-xs truncate">
                          {p.notes || (p.bookingId ? `Against Booking ${p.bookingId}` : 'Khata settlement')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {clientPayments.length === 0 && (
                  <div className="text-center py-10 text-xs text-gray-400">
                    No payment receipts logged yet for {client.name}.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COMPANY & LEGAL PROFILE */}
          {activeTab === 'INFO' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest">Contact & Operations</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-gray-400 block">Primary Contact Person:</span>
                      <span className="font-semibold text-gray-900">{client.contact}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Phone / Mobile:</span>
                      <span className="font-mono font-semibold text-gray-900">{client.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Invoicing Email:</span>
                      <span className="font-mono text-gray-800">{client.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Shipping Corridors / Routes:</span>
                      <span className="text-gray-800 font-medium">{client.routes || 'All India Routes'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest">Compliance & Financials</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">GSTIN:</span>
                        <button
                          onClick={() => setIsGstModalOpen(true)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-900 flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          {client.gst ? 'Edit GST' : '+ Add GST'}
                        </button>
                      </div>
                      <span className="font-mono font-bold text-gray-900 text-sm mt-0.5 block">
                        {client.gst || 'Not Provided'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">PAN Number:</span>
                      <span className="font-mono font-bold text-gray-900 text-sm">{client.pan || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Default Payment Terms:</span>
                      <span className="font-semibold text-gray-900">{client.paymentTerms}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Approved Credit Limit:</span>
                      <span className="font-mono font-bold text-gray-900">₹{(client.creditLimit || 500000).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {client.address && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs">
                  <span className="text-gray-400 uppercase font-bold text-[10px] block mb-1">Plant / Dispatch Address</span>
                  <p className="text-gray-800">{client.address}</p>
                </div>
              )}

              {client.notes && (
                <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200 text-xs">
                  <span className="text-amber-800 uppercase font-bold text-[10px] block mb-1">Operational Guidelines</span>
                  <p className="text-amber-900">{client.notes}</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
          <span className="text-gray-500 font-mono">
            {client.name} • {clientBookings.length} Trips • Due: ₹{outstanding.toLocaleString('en-IN')}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white font-medium rounded hover:bg-black transition-mechanical btn-press text-xs"
          >
            Close Profile
          </button>
        </div>

      </div>
    </>
  );
}