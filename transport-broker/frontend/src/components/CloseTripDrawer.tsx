import { useState, useEffect } from 'react';
import { X, CheckCircle2, Calculator, Fuel } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Trip } from '../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}

export default function CloseTripDrawer({ isOpen, onClose, trip }: Props) {
  const { closeTrip, fuelSlips } = useData();

  const [actualDiesel, setActualDiesel] = useState('');
  const [tolls, setTolls] = useState('');
  const [driverCharges, setDriverCharges] = useState('');
  const [maintenance, setMaintenance] = useState('');
  const [other, setOther] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-suggest diesel cost from recorded fuel slips for this trip
  const tripFuelSlips = trip ? fuelSlips.filter(s => s.tripId === trip.id) : [];
  const totalFuelFromSlips = tripFuelSlips.reduce((acc, s) => acc + s.totalAmount, 0);

  useEffect(() => {
    if (trip && totalFuelFromSlips > 0 && !actualDiesel) {
      setActualDiesel(String(totalFuelFromSlips));
    }
  }, [trip, totalFuelFromSlips, actualDiesel]);

  if (!isOpen || !trip) return null;

  const totalRevenue = (trip.up?.freight || 0) + (trip.down?.freight || 0);

  const numDiesel = Number(actualDiesel) || 0;
  const numTolls = Number(tolls) || 0;
  const numDriver = Number(driverCharges) || 0;
  const numMaint = Number(maintenance) || 0;
  const numOther = Number(other) || 0;

  const totalExpenses = numDiesel + numTolls + numDriver + numMaint + numOther;
  const netMargin = totalRevenue - totalExpenses;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await closeTrip(trip.id, {
      actualDiesel: numDiesel,
      tolls: numTolls,
      driverCharges: numDriver,
      maintenance: numMaint,
      other: numOther,
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
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gray-900 text-white rounded-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Trip Settlement & Closing</h2>
              <p className="text-xs text-gray-500">{trip.id} — Vehicle: {trip.vehicle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-mechanical">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="close-trip-form" onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {/* Revenue Breakdown */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 space-y-2">
            <h3 className="text-xs font-semibold text-blue-900 uppercase tracking-wider">Revenue Breakdown</h3>
            <div className="grid grid-cols-2 gap-4 text-sm pt-2">
              <div>
                <p className="text-xs text-gray-500">Up Freight ({trip.up?.route})</p>
                <p className="text-sm font-semibold text-gray-900">₹{(trip.up?.freight || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Down Freight ({trip.down?.route})</p>
                <p className="text-sm font-semibold text-gray-900">₹{(trip.down?.freight || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-blue-200/50 flex justify-between text-sm font-bold text-blue-900">
              <span>Total Trip Revenue:</span>
              <span>₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Advances Given */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 text-xs text-amber-900 flex justify-between">
            <span>Advances Given Before Departure:</span>
            <span className="font-semibold">
              Bhatta: ₹{(trip.advances?.driverBhatta || 0).toLocaleString('en-IN')} | Diesel/Toll: ₹{(trip.advances?.dieselToll || 0).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Actual Trip Expenses */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Actual Expenses Incurred
            </h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-gray-700">Actual Diesel Cost (₹)</label>
                    {totalFuelFromSlips > 0 && (
                      <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                        <Fuel className="w-3 h-3" /> {tripFuelSlips.length} Slips (₹{totalFuelFromSlips.toLocaleString('en-IN')})
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={actualDiesel}
                    onChange={(e) => setActualDiesel(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                  {totalFuelFromSlips > 0 && actualDiesel !== String(totalFuelFromSlips) && (
                    <button
                      type="button"
                      onClick={() => setActualDiesel(String(totalFuelFromSlips))}
                      className="text-[10px] text-blue-600 hover:underline mt-0.5"
                    >
                      Autofill from Pump Slips (₹{totalFuelFromSlips.toLocaleString('en-IN')})
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">FASTag & Tolls (₹)</label>
                  <input
                    type="number"
                    value={tolls}
                    onChange={(e) => setTolls(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Driver Bhatta / Salary (₹)</label>
                  <input
                    type="number"
                    value={driverCharges}
                    onChange={(e) => setDriverCharges(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Maintenance / Repair (₹)</label>
                  <input
                    type="number"
                    value={maintenance}
                    onChange={(e) => setMaintenance(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Other / Challan / Loading (₹)</label>
                <input
                  type="number"
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Net Profit Summary Box */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total Revenue</span>
              <span>₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm text-red-600">
              <span>Total Trip Expenses</span>
              <span>- ₹{totalExpenses.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-bold text-gray-900">
              <span>Net Broker Margin:</span>
              <span className={netMargin >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                ₹{netMargin.toLocaleString('en-IN')}
              </span>
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
            form="close-trip-form"
            disabled={isSubmitting}
            className="px-5 py-2 bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 rounded-md transition-mechanical btn-press disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Closing...' : 'Close & Settle Trip'}
          </button>
        </div>

      </div>
    </>
  );
}
