import { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultPartyType?: 'CLIENT' | 'TRANSPORTER';
  defaultPartyName?: string;
  defaultBookingId?: string;
  defaultAmount?: number;
}

export default function RecordPaymentModal({
  isOpen,
  onClose,
  defaultPartyType = 'CLIENT',
  defaultPartyName = '',
  defaultBookingId = '',
  defaultAmount = 0,
}: Props) {
  const { clients, transporters, bookings, recordPayment } = useData();

  const [partyType, setPartyType] = useState<'CLIENT' | 'TRANSPORTER'>(defaultPartyType);
  const [partyName, setPartyName] = useState(defaultPartyName);
  const [bookingId, setBookingId] = useState(defaultBookingId);
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : '');
  const [mode, setMode] = useState<'UPI' | 'NEFT' | 'CHEQUE' | 'CASH'>('NEFT');
  const [refNo, setRefNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPartyType(defaultPartyType);
      setPartyName(defaultPartyName);
      setBookingId(defaultBookingId);
      setAmount(defaultAmount ? String(defaultAmount) : '');
      setDate(new Date().toISOString().split('T')[0]);
      setRefNo('');
      setNotes('');
    }
  }, [isOpen, defaultPartyType, defaultPartyName, defaultBookingId, defaultAmount]);

  if (!isOpen) return null;

  // Selected party stats
  const selectedClient = partyType === 'CLIENT' ? clients.find(c => c.name === partyName) : null;
  const selectedTransporter = partyType === 'TRANSPORTER' ? transporters.find(t => t.name === partyName) : null;

  const currentOutstanding = selectedClient
    ? selectedClient.outstanding
    : selectedTransporter
    ? selectedTransporter.outstandingPayable
    : 0;

  const totalBilled = selectedClient
    ? selectedClient.totalBilled
    : selectedTransporter
    ? selectedTransporter.totalPayable
    : 0;

  const totalPaidSoFar = selectedClient
    ? selectedClient.totalPaid
    : selectedTransporter
    ? selectedTransporter.totalPaid
    : 0;

  const numAmount = Number(amount) || 0;
  const projectedLeftover = Math.max(0, currentOutstanding - numAmount);

  // Filter bookings for this party
  const partyBookings = bookings.filter(b =>
    partyType === 'CLIENT'
      ? b.client.toLowerCase() === partyName.toLowerCase()
      : b.transporter.toLowerCase() === partyName.toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || numAmount <= 0) {
      return;
    }

    setIsSubmitting(true);
    await recordPayment({
      partyType,
      partyName,
      amount: numAmount,
      mode,
      refNo: refNo || `REF-${Date.now().toString().slice(-6)}`,
      date: date || new Date().toISOString().split('T')[0] || '2026-10-10',
      notes: notes || (bookingId ? `Payment for ${bookingId}` : 'On-Account Payment'),
      bookingId: bookingId || undefined,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-[90] transition-mechanical" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-[520px] bg-white shadow-2xl z-[90] overflow-y-auto animate-in slide-in-from-right-8 duration-300 border-l border-gray-200 flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/70 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gray-900 text-white rounded-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Record Manual Payment</h2>
              <p className="text-xs text-gray-500">Settle invoices, record advances or leftover payments</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-mechanical">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="payment-form" onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {/* Party Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Payment Direction
            </label>
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-md">
              <button
                type="button"
                onClick={() => {
                  setPartyType('CLIENT');
                  setPartyName('');
                  setBookingId('');
                }}
                className={`py-2 text-xs font-semibold rounded transition-mechanical ${
                  partyType === 'CLIENT'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Client Receipt (Receivable)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPartyType('TRANSPORTER');
                  setPartyName('');
                  setBookingId('');
                }}
                className={`py-2 text-xs font-semibold rounded transition-mechanical ${
                  partyType === 'TRANSPORTER'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Transporter Payout (Payable)
              </button>
            </div>
          </div>

          {/* Party Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Select {partyType === 'CLIENT' ? 'Client' : 'Transporter'} *
            </label>
            <select
              value={partyName}
              onChange={(e) => {
                setPartyName(e.target.value);
                setBookingId('');
              }}
              required
              className="w-full border border-gray-200 rounded-md p-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-mechanical"
            >
              <option value="">-- Choose Party --</option>
              {partyType === 'CLIENT'
                ? clients.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} (Leftover: ₹{c.outstanding.toLocaleString('en-IN')})
                    </option>
                  ))
                : transporters.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} (Leftover: ₹{t.outstandingPayable.toLocaleString('en-IN')})
                    </option>
                  ))}
            </select>
          </div>

          {/* Party Financial Health Card */}
          {partyName && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span>Account Balance Summary</span>
                <span className="font-mono text-gray-700">{partyName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-center">
                <div>
                  <p className="text-[11px] text-gray-500">Total Billed</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">₹{totalBilled.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Paid So Far</p>
                  <p className="text-sm font-semibold text-emerald-700 mt-0.5">₹{totalPaidSoFar.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Current Leftover</p>
                  <p className="text-sm font-semibold text-amber-700 mt-0.5">₹{currentOutstanding.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Link to Booking (Optional) */}
          {partyName && partyBookings.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Allocate to Specific Booking (Optional)
              </label>
              <select
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              >
                <option value="">General On-Account Payment (No Booking Link)</option>
                {partyBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.route} ({partyType === 'CLIENT' ? `Billed ₹${b.clientRate}` : `Cost ₹${b.transporterRate}`})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Amount & Live Leftover Calculation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Payment Amount (₹) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                min="1"
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Remaining Leftover
              </label>
              <div className="w-full border border-gray-100 bg-gray-50 rounded-md p-2.5 text-sm font-semibold text-amber-800 font-mono">
                ₹{projectedLeftover.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Payment Mode & Reference Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Payment Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              >
                <option value="NEFT">Bank Transfer / NEFT / RTGS</option>
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Transaction / UTR No.
              </label>
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="e.g. UTR / Chq No."
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
          </div>

          {/* Date & Remarks */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Payment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Remarks / Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Part payment received via HDFC, balance due upon POD submission"
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50/70 sticky bottom-0 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-mechanical btn-press"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="payment-form"
            disabled={isSubmitting || !partyName || numAmount <= 0}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-black rounded-md transition-mechanical btn-press disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Recording...' : 'Record Payment'}
          </button>
        </div>

      </div>
    </>
  );
}
