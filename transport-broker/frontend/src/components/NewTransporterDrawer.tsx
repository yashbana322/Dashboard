import { useState } from 'react';
import { X, Truck, Check, Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';
import { validateGSTIN, GST_STATE_CODES } from '../utils/gstUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewTransporterDrawer({ isOpen, onClose }: Props) {
  const { addTransporter } = useData();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gst, setGst] = useState('');
  const [pan, setPan] = useState('');
  const [routes, setRoutes] = useState('');
  const [vehicleType, setVehicleType] = useState('32 FT Container');
  const [rateType, setRateType] = useState('Market Rate');
  const [openingPayable, setOpeningPayable] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGstChange = (val: string) => {
    const uppercase = val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
    setGst(uppercase);
    if (uppercase.length >= 12) {
      setPan(uppercase.substring(2, 12));
    }
  };

  const gstValidation = validateGSTIN(gst);
  const stateCode = gst.length >= 2 ? gst.substring(0, 2) : '';
  const stateName = stateCode ? GST_STATE_CODES[stateCode] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    await addTransporter({
      name,
      phone,
      gst,
      pan: pan || (gst.length >= 12 ? gst.substring(2, 12) : ''),
      panGst: gst || pan || 'Unregistered',
      routes,
      vehicles: [vehicleType],
      rateType,
      totalPayable: Number(openingPayable) || 0,
      totalPaid: 0,
      outstandingPayable: Number(openingPayable) || 0,
      notes,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-xs z-50 transition-mechanical" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-[500px] bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right-8 duration-300 border-l border-gray-200 flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/70 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gray-900 text-white rounded-md">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Add New Transporter</h2>
              <p className="text-xs text-gray-500">Fleet owner/broker contact, routes & payable balance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-mechanical">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="transporter-form" onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Basic Information</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company / Owner Name *</label>
              <input
                type="text"
                placeholder="e.g. XYZ Transport"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">PAN Number</label>
                <div className="flex items-center justify-between mb-1">
                  {gst.length >= 12 && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Auto from GST
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-700">GSTIN (Optional / GTA RCM)</label>
                {gst.length > 0 && (
                  <span className="text-[10px] font-mono text-gray-400">{gst.length}/15</span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="27AABCA1234C1Z5 or leave blank if RCM"
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
          </section>

          <hr className="border-gray-100" />

          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Fleet & Operations</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Primary Operating Routes</label>
              <input
                type="text"
                placeholder="e.g. Pune ↔ Delhi, Mumbai ↔ Nashik"
                value={routes}
                onChange={(e) => setRoutes(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type Available</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  <option>32 FT Container</option>
                  <option>32 FT Multi-Axle</option>
                  <option>20 FT Open</option>
                  <option>20 FT Container</option>
                  <option>14 FT Open</option>
                  <option>14 FT Closed</option>
                  <option>Trailer / 40 FT</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rate Agreement</label>
                <select
                  value={rateType}
                  onChange={(e) => setRateType(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  <option>Market Rate</option>
                  <option>Fixed Contract</option>
                </select>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Payment Ledger</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Opening Leftover Payable (₹)</label>
              <input
                type="number"
                placeholder="0.00"
                value={openingPayable}
                onChange={(e) => setOpeningPayable(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Notes / Terms</label>
              <textarea
                rows={2}
                placeholder="e.g. Requires 50% diesel advance before loading..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
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
            form="transporter-form"
            disabled={isSubmitting || !name}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-black rounded-md transition-mechanical btn-press disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Transporter'}
          </button>
        </div>

      </div>
    </>
  );
}
