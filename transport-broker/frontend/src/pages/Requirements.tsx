import { useState } from 'react';
import { Search, Plus, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Requirement } from '../context/DataContext';
import NewRequirementDrawer from '../components/NewRequirementDrawer';

export default function Requirements() {
  const { requirements, convertRequirement, transporters } = useData();

  const [isNewReqOpen, setIsNewReqOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [convertTarget, setConvertTarget] = useState<Requirement | null>(null);

  // Conversion form state
  const [vehicleNo, setVehicleNo] = useState('');
  const [transporter, setTransporter] = useState('');
  const [clientRate, setClientRate] = useState('45000');
  const [transporterRate, setTransporterRate] = useState('39000');
  const [isConverting, setIsConverting] = useState(false);

  const filteredRequirements = requirements.filter((req) => {
    return (
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertTarget) return;

    setIsConverting(true);
    await convertRequirement(convertTarget.id, {
      vehicleNo: vehicleNo || 'MH 12 AB 9999',
      transporter: transporter || 'Direct Fleet',
      clientRate: Number(clientRate) || 45000,
      transporterRate: Number(transporterRate) || 39000,
    });
    setIsConverting(false);
    setConvertTarget(null);
  };

  return (
    <div className="space-y-6 pb-16">
      <NewRequirementDrawer isOpen={isNewReqOpen} onClose={() => setIsNewReqOpen(false)} />

      {/* Convert to Booking Modal */}
      {convertTarget && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Lock Vehicle & Convert to Booking</h2>
            <p className="text-xs text-gray-500 mt-1">
              Converting {convertTarget.id}: {convertTarget.client} ({convertTarget.route})
            </p>

            <form onSubmit={handleConvertSubmit} className="mt-5 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Assign Vehicle Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH 12 AB 1234"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                  required
                  className="w-full border border-gray-200 rounded-md p-2 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Assign Transporter
                </label>
                <select
                  value={transporter}
                  onChange={(e) => setTransporter(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  <option value="">-- Choose Transporter --</option>
                  {transporters.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Client Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={clientRate}
                    onChange={(e) => setClientRate(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-gray-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Transporter Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={transporterRate}
                    onChange={(e) => setTransporterRate(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-gray-900 font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setConvertTarget(null)}
                  className="px-4 py-2 border border-gray-200 rounded text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="px-4 py-2 bg-gray-900 text-white rounded text-xs font-medium hover:bg-black transition-mechanical btn-press"
                >
                  {isConverting ? 'Converting...' : 'Confirm & Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Vehicle Requirements</h1>
          <p className="text-sm text-gray-500 mt-1">Pending load inquiries and vehicle sourcing pipeline.</p>
        </div>
        <button
          onClick={() => setIsNewReqOpen(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-black transition-mechanical btn-press shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Log Requirement
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 py-3 border-b border-gray-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search requirements..."
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm rounded"
          />
        </div>
      </div>

      {/* Mobile View: Touch Requirement Cards (Android Optimized) */}
      <div className="sm:hidden space-y-3">
        {filteredRequirements.map((req) => (
          <div key={req.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {req.id}
              </span>
              <div>
                {req.status === 'Arranged' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="w-3 h-3" /> Arranged
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-3 h-3" /> {req.status}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="font-bold text-gray-900 text-sm">{req.client}</p>
              <p className="text-xs text-gray-600 font-medium mt-0.5">{req.route}</p>
              <p className="text-xs text-gray-500 mt-0.5">🚛 Vehicle: {req.vehicle}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-500 font-mono">
                {req.date} ({req.time})
              </span>
              <div>
                {req.status !== 'Arranged' ? (
                  <button
                    onClick={() => setConvertTarget(req)}
                    className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded hover:bg-black transition-mechanical flex items-center gap-1"
                  >
                    <span>Lock Vehicle</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 font-semibold">Active Booking</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredRequirements.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
            No vehicle requirements matching search.
          </div>
        )}
      </div>

      {/* Desktop / Tablet View: Wide Table */}
      <div className="hidden sm:block w-full overflow-x-auto touch-scroll">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[760px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="py-3 font-semibold text-gray-900">ID</th>
              <th className="py-3 font-semibold text-gray-900">Required Date</th>
              <th className="py-3 font-semibold text-gray-900">Client</th>
              <th className="py-3 font-semibold text-gray-900">Route</th>
              <th className="py-3 font-semibold text-gray-900">Vehicle Type</th>
              <th className="py-3 font-semibold text-gray-900">Status</th>
              <th className="py-3 font-semibold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRequirements.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3.5 font-mono text-gray-500 font-semibold">{req.id}</td>
                <td className="py-3.5 font-medium text-gray-900">
                  {req.date} <span className="text-xs text-gray-400 font-mono">({req.time})</span>
                </td>
                <td className="py-3.5 font-medium text-gray-900">{req.client}</td>
                <td className="py-3.5 text-gray-600 flex items-center gap-1.5">
                  {req.route.split('→').map((p, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      {p.trim()}
                      {i === 0 && <span className="text-gray-300">→</span>}
                    </span>
                  ))}
                </td>
                <td className="py-3.5 font-medium text-gray-700">{req.vehicle}</td>
                <td className="py-3.5">
                  {req.status === 'Arranged' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3.5 h-3.5" />
                      Arranged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {req.status}
                    </span>
                  )}
                </td>
                <td className="py-3.5 text-right">
                  {req.status !== 'Arranged' ? (
                    <button
                      onClick={() => setConvertTarget(req)}
                      className="px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded hover:bg-black transition-mechanical btn-press shadow-2xs flex items-center gap-1 ml-auto"
                    >
                      <span>Lock Vehicle</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-medium">Booking Active</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRequirements.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-500">
            No vehicle requirements matching search.
          </div>
        )}
      </div>
    </div>
  );
}
