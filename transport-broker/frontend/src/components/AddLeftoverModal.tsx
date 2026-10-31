import { useState, useEffect } from 'react';
import { X, PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultPartyType?: 'CLIENT' | 'TRANSPORTER';
  defaultPartyName?: string;
  defaultBookingId?: string;
}

export default function AddLeftoverModal({
  isOpen,
  onClose,
  defaultPartyType = 'CLIENT',
  defaultPartyName = '',
  defaultBookingId = '',
}: Props) {
  const { clients, transporters, bookings, addLeftoverAdjustment } = useData();

  const [partyType, setPartyType] = useState<'CLIENT' | 'TRANSPORTER'>(defaultPartyType);
  const [partyName, setPartyName] = useState(defaultPartyName);
  const [category, setCategory] = useState<'PAST_BALANCE' | 'HALTING_DETENTION' | 'EXTRA_LOADING' | 'TOLL_CHALLAN' | 'OTHER'>('PAST_BALANCE');
  const [bookingId, setBookingId] = useState(defaultBookingId);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPartyType(defaultPartyType);
      setPartyName(defaultPartyName);
      setBookingId(defaultBookingId);
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setCategory('PAST_BALANCE');
    }
  }, [isOpen, defaultPartyType, defaultPartyName, defaultBookingId]);

  if (!isOpen) return null;

  const selectedClient = partyType === 'CLIENT' ? clients.find(c => c.name === partyName) : null;
  const selectedTransporter = partyType === 'TRANSPORTER' ? transporters.find(t => t.name === partyName) : null;

  const currentOutstanding = selectedClient
    ? selectedClient.outstanding
    : selectedTransporter
    ? selectedTransporter.outstandingPayable
    : 0;

  const numAmount = Number(amount) || 0;
  const newProjectedOutstanding = currentOutstanding + numAmount;

  // Filter bookings for this party
  const partyBookings = bookings.filter(b =>
    partyType === 'CLIENT'
      ? b.client.toLowerCase() === partyName.toLowerCase()
      : b.transporter.toLowerCase() === partyName.toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || numAmount <= 0) return;

    setIsSubmitting(true);
    await addLeftoverAdjustment({
      partyType,
      partyName,
      category,
      amount: numAmount,
      date: date || new Date().toISOString().split('T')[0] || '2026-10-10',
      notes: notes || `${category.replace(/_/g, ' ')} added manually`,
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
            <div className="p-2 bg-amber-600 text-white rounded-md">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Add Manual Leftover / Due</h2>
              <p className="text-xs text-gray-500">Record past balances, halting charges, or unbilled dues</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-mechanical">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="leftover-form" onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {/* Party Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Who has this leftover due?
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
                Client Dues (Money they owe you)
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
                Transporter Due (Money you owe them)
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
              className="w-full border border-gray-200 rounded-md p-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            >
              <option value="">-- Choose Party --</option>
              {partyType === 'CLIENT'
                ? clients.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} (Current Leftover: ₹{c.outstanding.toLocaleString('en-IN')})
                    </option>
                  ))
                : transporters.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} (Current Leftover: ₹{t.outstandingPayable.toLocaleString('en-IN')})
                    </option>
                  ))}
            </select>
          </div>

          {/* Reason / Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Leftover Category / Reason *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full border border-gray-200 rounded-md p-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="PAST_BALANCE">Previous Balance / Past Dues (Purana Khata / Opening Dues)</option>
              <option value="HALTING_DETENTION">Halting / Detention Charge (Vehicle Delay at Loading/Drop)</option>
              <option value="EXTRA_LOADING">Extra Loading / Unloading Charges (Hamali / Labour)</option>
              <option value="TOLL_CHALLAN">Route Variation / FASTag / Challan Adjustment</option>
              <option value="OTHER">Custom Leftover / Miscellaneous Unbilled Due</option>
            </select>
          </div>

          {/* Link to Booking (Optional) */}
          {partyName && partyBookings.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Attach to Specific Booking (Optional)
              </label>
              <select
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                <option value="">General Ledger Balance (No Booking Link)</option>
                {partyBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.route} ({b.vehicleNo})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount & Real-Time Balance Preview */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Leftover Amount To Add (₹) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              required
              min="1"
              className="w-full border border-gray-200 rounded-md p-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          {/* Live Preview Card */}
          {partyName && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Impact on Party Balance</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/60 text-xs">
                <div>
                  <p className="text-gray-500">Current Leftover</p>
                  <p className="font-semibold text-gray-900 font-mono mt-0.5">₹{currentOutstanding.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Adding Dues</p>
                  <p className="font-semibold text-amber-800 font-mono mt-0.5">+ ₹{numAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-bold">New Leftover</p>
                  <p className="font-bold text-red-700 font-mono text-sm mt-0.5">
                    ₹{newProjectedOutstanding.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Date & Detailed Notes */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Notes / Reference / Explanation
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 2 days vehicle halting at Gurgaon warehouse @ ₹1,500/day"
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
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
            form="leftover-form"
            disabled={isSubmitting || !partyName || numAmount <= 0}
            className="px-5 py-2 bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 rounded-md transition-mechanical btn-press disabled:opacity-50 flex items-center gap-2 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Adding...' : 'Add Leftover Due'}
          </button>
        </div>

      </div>
    </>
  );
}
