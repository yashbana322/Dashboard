import { useState } from 'react';
import { X, ListTodo, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewRequirementDrawer({ isOpen, onClose }: Props) {
  const { clients, addRequirement } = useData();

  const [client, setClient] = useState('');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [vehicle, setVehicle] = useState('32 FT Container');
  const [date, setDate] = useState('Today');
  const [time, setTime] = useState('10:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !fromCity || !toCity) return;

    setIsSubmitting(true);
    await addRequirement({
      client,
      route: `${fromCity.trim()} → ${toCity.trim()}`,
      vehicle,
      date,
      time,
      status: 'Vehicle Required',
      statusType: 'warning',
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-xs z-50 transition-mechanical" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right-8 duration-300 border-l border-gray-200 flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/70 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gray-900 text-white rounded-md">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Log Vehicle Requirement</h2>
              <p className="text-xs text-gray-500">Capture client load requirement to source a vehicle</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-mechanical">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="req-form" onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Client / Company *
            </label>
            <div className="space-y-2">
              <select
                value={client}
                onChange={(e) => setClient(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              >
                <option value="">-- Select Existing Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Or enter new party name..."
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Pickup City *
              </label>
              <input
                type="text"
                placeholder="e.g. Pune"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Drop City *
              </label>
              <input
                type="text"
                placeholder="e.g. Delhi"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Vehicle Type Required
            </label>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="w-full border border-gray-200 rounded-md p-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Target Date
              </label>
              <input
                type="text"
                placeholder="e.g. Today or 12 Oct"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Pickup Time
              </label>
              <input
                type="text"
                placeholder="e.g. 11:00 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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
            form="req-form"
            disabled={isSubmitting || !client || !fromCity || !toCity}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-black rounded-md transition-mechanical btn-press disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? 'Logging...' : 'Log Requirement'}
          </button>
        </div>

      </div>
    </>
  );
}
