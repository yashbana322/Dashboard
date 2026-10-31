import { useState } from 'react';
import { X, Building2, Check, Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';
import { validateGSTIN, GST_STATE_CODES } from '../utils/gstUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewClientDrawer({ isOpen, onClose }: Props) {
  const { addClient } = useData();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gst, setGst] = useState('');
  const [pan, setPan] = useState('');
  const [routes, setRoutes] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 15 Days');
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().split('T')[0] || '2026-10-10');
  const [creditLimit, setCreditLimit] = useState('500000');
  const [openingBalance, setOpeningBalance] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Auto-fill PAN and validate GST
  const handleGstChange = (val: string) => {
    const upper = val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
    setGst(upper);
    if (upper.length >= 12) {
      setPan(upper.substring(2, 12));
    }
  };

  const gstValidation = validateGSTIN(gst);
  const stateCode = gst.length >= 2 ? gst.substring(0, 2) : '';
  const stateName = stateCode ? GST_STATE_CODES[stateCode] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    await addClient({
      name,
      contact,
      phone,
      email,
      gst,
      pan: pan || (gst.length >= 12 ? gst.substring(2, 12) : ''),
      routes,
      paymentTerms,
      joinDate,
      creditLimit: Number(creditLimit) || 500000,
      totalBilled: Number(openingBalance) || 0,
      totalPaid: 0,
      outstanding: Number(openingBalance) || 0,
      address,
      notes,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 transition-mechanical" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-[540px] bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right-8 duration-300 border-l border-gray-200 flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/70 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gray-900 text-white rounded-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Add New Party / Client</h2>
              <p className="text-xs text-gray-500">Register commercial party, credit limits & transport agreements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-mechanical">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="client-form" onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-gray-400" /> Company & Legal Identity
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company / Party Legal Name *</label>
              <input
                type="text"
                placeholder="e.g. ABC Industries Ltd. or Apex Consumer Goods"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-md p-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-700">GSTIN Number</label>
                  {gst.length > 0 && (
                    <span className="text-[10px] font-mono text-gray-400">{gst.length}/15</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="27AABCA1234C1Z5"
                    value={gst}
                    onChange={(e) => handleGstChange(e.target.value)}
                    maxLength={15}
                    className="w-full border border-gray-200 rounded-md p-2 text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                  {gstValidation.isValid && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {stateName && (
                  <p className="text-[10px] text-gray-500 mt-1 font-mono">
                    📍 {stateName} (Code {stateCode})
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-700">PAN Number</label>
                  {gst.length >= 12 && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Auto-filled
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="AABCA1234C"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 10))}
                  maxLength={10}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Onboarding / Joining Date</label>
                <input
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Opening Leftover Balance (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 font-mono"
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Primary Contact & Logistics Lead</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person Name & Title</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma (Dispatch Manager)"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mobile / WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address (Invoicing)</label>
                <input
                  type="email"
                  placeholder="logistics@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Billing Terms & Operations</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Payment Credit Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  <option>Net 15 Days</option>
                  <option>Net 30 Days</option>
                  <option>Net 45 Days</option>
                  <option>POD + 7 Days</option>
                  <option>Advance 80% + Balance POD</option>
                  <option>On Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Credit Limit (₹)</label>
                <input
                  type="number"
                  placeholder="500000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Regular Shipping Corridors / Routes</label>
              <input
                type="text"
                placeholder="e.g. Pune → Delhi, Pune → Chennai, Mumbai → Bangalore"
                value={routes}
                onChange={(e) => setRoutes(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Plant / Dispatch Address</label>
              <textarea
                rows={2}
                placeholder="Plot / Shed No, Industrial Area, City, State, PIN..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Operational Instructions & Notes</label>
              <input
                type="text"
                placeholder="Special loading instructions, preferred container types..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </section>
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
            form="client-form"
            disabled={isSubmitting || !name}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-black rounded-md transition-mechanical btn-press disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : 'Save Party & Add to Directory'}
          </button>
        </div>

      </div>
    </>
  );
}
