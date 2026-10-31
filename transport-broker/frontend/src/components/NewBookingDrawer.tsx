import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useData } from '../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewBookingDrawer({ isOpen, onClose }: Props) {
  const { clients, transporters, addBooking } = useData();

  const [client, setClient] = useState('');
  const [pickupCity, setPickupCity] = useState('');
  const [dropCity, setDropCity] = useState('');
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState('09:30 AM');
  const [vehicleType, setVehicleType] = useState('32 FT Container');
  const [vehicleNo, setVehicleNo] = useState('');
  const [transporter, setTransporter] = useState('');
  const [clientRate, setClientRate] = useState('');
  const [transporterRate, setTransporterRate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const numClientRate = Number(clientRate) || 0;
  const numTransporterRate = Number(transporterRate) || 0;
  const expectedMargin = numClientRate - numTransporterRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !pickupCity || !dropCity) return;

    setIsSubmitting(true);
    await addBooking({
      client,
      route: `${pickupCity.trim()} → ${dropCity.trim()}`,
      vehicleType,
      vehicleNo: vehicleNo || 'Pending',
      transporter: transporter || 'Pending Assignment',
      clientRate: numClientRate,
      transporterRate: numTransporterRate,
      pickupDate,
      pickupTime,
      status: transporter ? 'Arranged' : 'Requested',
      notes,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-xs z-50 transition-mechanical" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-[520px] bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right-8 duration-300 border-l border-gray-200 flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/70 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Create New Booking</h2>
            <p className="text-xs text-gray-500">Record customer order and link vehicle</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-mechanical">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="booking-form" onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {/* Client Details */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Client Details</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Client *</label>
              <div className="space-y-2">
                <select
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-md p-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or type client name..."
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
                {(() => {
                  const matchedClient = clients.find(c => c.name.toLowerCase() === client.trim().toLowerCase());
                  if (!matchedClient) return null;
                  return (
                    <div className="flex items-center gap-2 text-xs pt-1">
                      {matchedClient.gst && matchedClient.gst !== 'UNREGISTERED' ? (
                        <span className="inline-flex items-center gap-1 font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                          ✓ GSTIN: {matchedClient.gst}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                          ⚠ Unregistered GST (GTA RCM)
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Pickup Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Pune"
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Drop Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi"
                  value={dropCity}
                  onChange={(e) => setDropCity(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Pickup Time</label>
                <input
                  type="text"
                  placeholder="09:30 AM"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Vehicle Assignment */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Vehicle Assignment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Vehicle Type</label>
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
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Vehicle Number</label>
                <input
                  type="text"
                  placeholder="e.g. MH 12 AB 1234"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Assign Transporter</label>
              <select
                value={transporter}
                onChange={(e) => setTransporter(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                <option value="">-- Leave Pending / Search Later --</option>
                {transporters.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.routes})
                  </option>
                ))}
              </select>
              {(() => {
                const matchedTransporter = transporters.find(t => t.name.toLowerCase() === transporter.trim().toLowerCase());
                if (!matchedTransporter) return null;
                return (
                  <div className="flex items-center gap-2 text-xs pt-1">
                    {matchedTransporter.gst && matchedTransporter.gst !== 'UNREGISTERED' ? (
                      <span className="inline-flex items-center gap-1 font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                        ✓ Transporter GSTIN: {matchedTransporter.gst}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-[11px]">
                        Transporter PAN/RCM: {matchedTransporter.pan || matchedTransporter.panGst || 'GTA RCM'}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Financials & Live Margin */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Financials & Margin</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Client Rate (₹) *</label>
                <input
                  type="number"
                  value={clientRate}
                  onChange={(e) => setClientRate(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full border border-gray-200 rounded-md p-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Transporter Cost (₹)</label>
                <input
                  type="number"
                  value={transporterRate}
                  onChange={(e) => setTransporterRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-md p-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Calculated Broker Margin:</span>
              <span className={`font-bold font-mono text-base ${expectedMargin >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                ₹{expectedMargin.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Cargo Notes / Instructions</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Fragile goods, loading contact person..."
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
            form="booking-form"
            disabled={isSubmitting || !client || !pickupCity || !dropCity}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-black rounded-md transition-mechanical btn-press disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? 'Creating...' : 'Create Booking'}
          </button>
        </div>

      </div>
    </>
  );
}
