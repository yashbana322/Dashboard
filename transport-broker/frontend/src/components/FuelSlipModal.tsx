import { useState, useMemo } from 'react';
import { X, Fuel, Plus, Trash2, CheckCircle2, Calculator } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Trip } from '../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedTrip?: Trip | null;
}

const COMMON_PUMPS = [
  'Indian Oil (IOCL)',
  'Bharat Petroleum (BPCL)',
  'Hindustan Petroleum (HPCL)',
  'Reliance Petroleum',
  'Nayara Energy',
  'Highway Express Pump',
];

export default function FuelSlipModal({ isOpen, onClose, selectedTrip }: Props) {
  const { trips, fuelSlips, addFuelSlip, deleteFuelSlip } = useData();

  const [activeTripId, setActiveTripId] = useState<string>(() => selectedTrip?.id || (trips[0]?.id || ''));
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [pumpName, setPumpName] = useState('Indian Oil (IOCL)');
  const [customPump, setCustomPump] = useState('');
  const [slipNo, setSlipNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0] || '2026-10-10');
  const [liters, setLiters] = useState('');
  const [ratePerLiter, setRatePerLiter] = useState('92.50');
  const [totalAmount, setTotalAmount] = useState('');
  const [odometerReading, setOdometerReading] = useState('');
  const [paymentMode, setPaymentMode] = useState<'FLEET_CARD' | 'CASH' | 'PUMP_CREDIT' | 'UPI'>('FLEET_CARD');
  const [driverName, setDriverName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Keep activeTripId in sync if selectedTrip changes
  useMemo(() => {
    if (selectedTrip?.id) {
      setActiveTripId(selectedTrip.id);
      setDriverName(selectedTrip.driverName || '');
    } else if (!activeTripId && trips.length > 0) {
      setActiveTripId(trips[0]?.id || '');
      setDriverName(trips[0]?.driverName || '');
    }
  }, [selectedTrip, trips, activeTripId]);

  const currentTrip = useMemo(
    () => trips.find(t => t.id === activeTripId),
    [trips, activeTripId]
  );

  // Filter fuel slips for the active trip (or all if none)
  const tripSlips = useMemo(() => {
    return fuelSlips.filter(s => s.tripId === activeTripId);
  }, [fuelSlips, activeTripId]);

  // Total diesel summary
  const summary = useMemo(() => {
    const totalLiters = tripSlips.reduce((acc, s) => acc + (s.liters || 0), 0);
    const totalCost = tripSlips.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const avgRate = totalLiters > 0 ? (totalCost / totalLiters).toFixed(2) : '0';

    // Mileage calculation if odometer readings exist
    const odoReadings = tripSlips
      .map(s => s.odometerReading)
      .filter((odo): odo is number => typeof odo === 'number' && odo > 0)
      .sort((a, b) => a - b);

    let kmRun = 0;
    let mileage = '0';
    let costPerKm = '0';
    if (odoReadings.length >= 2) {
      const minOdo = odoReadings[0]!;
      const maxOdo = odoReadings[odoReadings.length - 1]!;
      kmRun = maxOdo - minOdo;
      if (kmRun > 0 && totalLiters > 0) {
        mileage = (kmRun / totalLiters).toFixed(2);
        costPerKm = (totalCost / kmRun).toFixed(2);
      }
    }

    return { totalLiters, totalCost, avgRate, kmRun, mileage, costPerKm };
  }, [tripSlips]);

  // Auto-calculate total amount when liters or rate changes
  const handleLitersChange = (val: string) => {
    setLiters(val);
    const l = Number(val) || 0;
    const r = Number(ratePerLiter) || 0;
    if (l > 0 && r > 0) {
      setTotalAmount(String(Math.round(l * r)));
    }
  };

  const handleRateChange = (val: string) => {
    setRatePerLiter(val);
    const l = Number(liters) || 0;
    const r = Number(val) || 0;
    if (l > 0 && r > 0) {
      setTotalAmount(String(Math.round(l * r)));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liters || !totalAmount) return;

    setIsSubmitting(true);
    const effectivePump = customPump ? customPump : pumpName;
    const generatedSlipNo = slipNo || `SLP-${Math.floor(1000 + Math.random() * 9000)}`;

    await addFuelSlip({
      tripId: activeTripId,
      vehicleNo: currentTrip?.vehicle || 'MH 12 AB 1234',
      pumpName: effectivePump,
      slipNo: generatedSlipNo,
      date,
      liters: Number(liters),
      ratePerLiter: Number(ratePerLiter),
      totalAmount: Number(totalAmount),
      odometerReading: odometerReading ? Number(odometerReading) : undefined,
      paymentMode,
      driverName: driverName || currentTrip?.driverName || '',
      notes,
    });

    setIsSubmitting(false);
    setShowAddForm(false);
    // Reset form
    setLiters('');
    setTotalAmount('');
    setOdometerReading('');
    setNotes('');
    setCustomPump('');
    setSuccessMessage('Diesel slip logged successfully & trip expense updated!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this fuel slip?')) {
      await deleteFuelSlip(id);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-[90] transition-mechanical" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-[90] overflow-y-auto flex flex-col justify-between border-l border-gray-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/80 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-900 text-white rounded-md">
              <Fuel className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Driver Diesel & Pump Slip Tracker
              </h2>
              <p className="text-xs text-gray-500">
                Highway refueling logs, fleet card settlement, pump credit & mileage tracking
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-200 transition-mechanical">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">

          {/* Trip Selector & Active Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                Select Active Trip
              </label>
              <select
                value={activeTripId}
                onChange={e => {
                  setActiveTripId(e.target.value);
                  const found = trips.find(t => t.id === e.target.value);
                  if (found) setDriverName(found.driverName);
                }}
                className="font-mono text-sm font-bold text-gray-900 border border-gray-300 rounded px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                {trips.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.id} — {t.vehicle} ({t.up?.route}) [{t.status}]
                  </option>
                ))}
              </select>
            </div>

            {currentTrip && (
              <div className="text-right text-xs space-y-0.5">
                <p className="font-semibold text-gray-900">{currentTrip.vehicle}</p>
                <p className="text-gray-500">Driver: {currentTrip.driverName} ({currentTrip.driverPhone || 'No phone'})</p>
                <p className="text-blue-700 font-medium">{currentTrip.up?.route} ↔ {currentTrip.down?.route}</p>
              </div>
            )}
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMessage}
            </div>
          )}

          {/* Trip Diesel Intelligence KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-gray-200 rounded p-3 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Liters</span>
              <p className="text-xl font-black font-mono text-gray-900 mt-1">{summary.totalLiters} L</p>
              <span className="text-[10px] text-gray-500">Across {tripSlips.length} pump slips</span>
            </div>

            <div className="bg-white border border-gray-200 rounded p-3 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Diesel Cost</span>
              <p className="text-xl font-black font-mono text-amber-900 mt-1">₹{summary.totalCost.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-gray-500">Avg ₹{summary.avgRate}/L</span>
            </div>

            <div className="bg-white border border-gray-200 rounded p-3 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Odo Run</span>
              <p className="text-xl font-black font-mono text-gray-900 mt-1">
                {summary.kmRun > 0 ? `${summary.kmRun} KM` : '—'}
              </p>
              <span className="text-[10px] text-gray-500">Distance logged</span>
            </div>

            <div className="bg-white border border-gray-200 rounded p-3 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Fuel Average</span>
              <p className="text-xl font-black font-mono text-emerald-700 mt-1">
                {summary.kmRun > 0 ? `${summary.mileage} km/L` : '—'}
              </p>
              <span className="text-[10px] text-gray-500">
                {summary.kmRun > 0 ? `₹${summary.costPerKm}/km` : 'Min 2 readings needed'}
              </span>
            </div>
          </div>

          {/* Toggle Add Slip / List */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Pump Slips for {activeTripId} ({tripSlips.length})
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded hover:bg-black transition-mechanical btn-press shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddForm ? 'Cancel Entry' : '+ Log Fuel Slip'}
            </button>
          </div>

          {/* New Fuel Slip Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-amber-50/40 border border-amber-200 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-amber-700" />
                  New Highway Pump Fuel Slip
                </span>
                <span className="text-[11px] font-mono text-gray-500">Trip: {activeTripId}</span>
              </div>

              {/* Pump Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fuel Station / Pump Brand</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_PUMPS.map(p => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => {
                        setPumpName(p);
                        setCustomPump('');
                      }}
                      className={`px-2.5 py-1 text-xs rounded border transition-mechanical ${
                        pumpName === p && !customPump
                          ? 'bg-amber-600 text-white font-semibold border-amber-700'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customPump}
                  onChange={e => setCustomPump(e.target.value)}
                  placeholder="Or enter custom pump name & location..."
                  className="w-full border border-gray-200 rounded p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Liters, Rate, Amount */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Liters (L) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={liters}
                    onChange={e => handleLitersChange(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full border border-gray-200 rounded p-2 text-xs font-mono font-bold bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Rate / Liter (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ratePerLiter}
                    onChange={e => handleRateChange(e.target.value)}
                    placeholder="92.50"
                    className="w-full border border-gray-200 rounded p-2 text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Total Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={totalAmount}
                    onChange={e => setTotalAmount(e.target.value)}
                    placeholder="Auto computed"
                    className="w-full border border-amber-300 rounded p-2 text-xs font-mono font-black text-amber-900 bg-amber-50 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              {/* Slip No, Date, Odometer */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Slip / Invoice No.</label>
                  <input
                    type="text"
                    value={slipNo}
                    onChange={e => setSlipNo(e.target.value)}
                    placeholder="e.g. IOC-88291"
                    className="w-full border border-gray-200 rounded p-2 text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fueling Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full border border-gray-200 rounded p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Odometer Reading (KM)</label>
                  <input
                    type="number"
                    value={odometerReading}
                    onChange={e => setOdometerReading(e.target.value)}
                    placeholder="e.g. 142580"
                    className="w-full border border-gray-200 rounded p-2 text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              {/* Payment Mode & Driver */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value as any)}
                    className="w-full border border-gray-200 rounded p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="FLEET_CARD">Fleet Card (IOCL / BPCL Fleet)</option>
                    <option value="CASH">Driver Cash Advance</option>
                    <option value="PUMP_CREDIT">Pump Khata Credit</option>
                    <option value="UPI">Company UPI / QR Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Driver In-Charge</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    placeholder="Driver Name"
                    className="w-full border border-gray-200 rounded p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Station Location / Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Near Toll Plaza 4, Full tank before night leg"
                  className="w-full border border-gray-200 rounded p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded hover:bg-black transition-mechanical btn-press shadow-2xs"
                >
                  {isSubmitting ? 'Logging...' : 'Save Pump Slip'}
                </button>
              </div>
            </form>
          )}

          {/* Slips List Table */}
          <div className="w-full overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Pump & Slip No.</th>
                  <th className="py-2.5 px-3 text-right">Liters</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  <th className="py-2.5 px-3">Odometer</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tripSlips.map(slip => (
                  <tr key={slip.id} className="hover:bg-gray-50/70 transition-mechanical">
                    <td className="py-3 px-3 font-mono text-gray-700">{slip.date}</td>
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-semibold text-gray-900">{slip.pumpName}</p>
                        <p className="text-[10px] font-mono text-gray-400">Slip: {slip.slipNo}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">{slip.liters} L</td>
                    <td className="py-3 px-3 text-right font-mono text-gray-500">₹{slip.ratePerLiter}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-900">
                      ₹{slip.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-600">
                      {slip.odometerReading ? `${slip.odometerReading.toLocaleString('en-IN')} KM` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {slip.paymentMode.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleDelete(slip.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition-mechanical"
                        title="Delete Slip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {tripSlips.length === 0 && (
              <div className="text-center py-10 text-xs text-gray-400">
                No diesel slips logged yet for trip {activeTripId}. Click "+ Log Fuel Slip" above to add.
              </div>
            )}
          </div>

        </div>

        {/* Footer / Settlement Quick Summary */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Calculator className="w-4 h-4 text-gray-500" />
            <span>
              Total Fuel Expense for {activeTripId}: <strong className="text-amber-900 font-mono">₹{summary.totalCost.toLocaleString('en-IN')}</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white font-medium rounded hover:bg-black transition-mechanical btn-press text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </>
  );
}