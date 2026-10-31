import { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Truck } from 'lucide-react';
import { useData } from '../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewTripDrawer({ isOpen, onClose }: Props) {
  const { addTrip } = useData();

  const [vehicle, setVehicle] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  const [upFrom, setUpFrom] = useState('');
  const [upTo, setUpTo] = useState('');
  const [upClient, setUpClient] = useState('');
  const [upFreight, setUpFreight] = useState('');

  const [downFrom, setDownFrom] = useState('');
  const [downTo, setDownTo] = useState('');
  const [downClient, setDownClient] = useState('');
  const [downFreight, setDownFreight] = useState('');

  const [driverBhatta, setDriverBhatta] = useState('');
  const [dieselToll, setDieselToll] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !upFrom || !upTo) return;

    setIsSubmitting(true);
    await addTrip({
      vehicle: vehicle.toUpperCase(),
      driverName: driverName || 'Driver',
      driverPhone,
      up: {
        route: `${upFrom.trim()} → ${upTo.trim()}`,
        client: upClient || 'Client',
        freight: Number(upFreight) || 0,
      },
      down: {
        route: downFrom && downTo ? `${downFrom.trim()} → ${downTo.trim()}` : 'Waiting for load',
        client: downClient || '-',
        freight: Number(downFreight) || 0,
      },
      advances: {
        driverBhatta: Number(driverBhatta) || 0,
        dieselToll: Number(dieselToll) || 0,
      },
      status: 'Up Transit',
      statusType: 'blue',
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-xs z-50 transition-mechanical" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-[550px] bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right-8 duration-300 border-l border-gray-200 flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/70 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Start New Trip</h2>
            <p className="text-xs text-gray-500">Log vehicle Up & Down movements and advances</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-mechanical">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="trip-form" onSubmit={handleSubmit} className="p-6 space-y-8 flex-1">
          {/* Vehicle & Driver */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5" /> Vehicle & Driver
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
                <label className="block font-medium text-gray-700 mb-1">Vehicle Number *</label>
                <input
                  type="text"
                  placeholder="e.g. MH 12 AB 1234"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value.toUpperCase())}
                  required
                  className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-gray-900 font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Driver Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Driver Phone</label>
                <input
                  type="tel"
                  placeholder="+91"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-gray-900 font-mono"
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* UP Trip */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" /> Up Journey (Primary Outward Leg) *
            </h3>
            <div className="space-y-4 text-sm bg-blue-50/40 p-4 rounded-lg border border-blue-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">From *</label>
                  <input
                    type="text"
                    placeholder="Pickup City"
                    value={upFrom}
                    onChange={(e) => setUpFrom(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">To *</label>
                  <input
                    type="text"
                    placeholder="Destination City"
                    value={upTo}
                    onChange={(e) => setUpTo(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Client / Party</label>
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={upClient}
                    onChange={(e) => setUpClient(e.target.value)}
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Up Freight (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={upFreight}
                    onChange={(e) => setUpFreight(e.target.value)}
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* DOWN Trip */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" /> Down Journey (Return Leg)
              </h3>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium uppercase">Optional</span>
            </div>
            
            <div className="space-y-4 text-sm bg-emerald-50/40 p-4 rounded-lg border border-emerald-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="text"
                    placeholder="Return Source"
                    value={downFrom}
                    onChange={(e) => setDownFrom(e.target.value)}
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="text"
                    placeholder="Return Destination"
                    value={downTo}
                    onChange={(e) => setDownTo(e.target.value)}
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Return Client</label>
                  <input
                    type="text"
                    placeholder="Return Client Name"
                    value={downClient}
                    onChange={(e) => setDownClient(e.target.value)}
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Down Freight (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={downFreight}
                    onChange={(e) => setDownFreight(e.target.value)}
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Initial Advances */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Initial Advances</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Driver Advance (Bhatta ₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={driverBhatta}
                  onChange={(e) => setDriverBhatta(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Diesel & FASTag Advance (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={dieselToll}
                  onChange={(e) => setDieselToll(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
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
            form="trip-form"
            disabled={isSubmitting || !vehicle || !upFrom || !upTo}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-black rounded-md transition-mechanical btn-press disabled:opacity-50"
          >
            {isSubmitting ? 'Starting...' : 'Start Trip'}
          </button>
        </div>

      </div>
    </>
  );
}
