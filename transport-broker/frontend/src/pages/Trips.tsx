import { useState } from 'react';
import { Search, Plus, ArrowUpRight, ArrowDownRight, Truck, Calculator, Fuel } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Trip } from '../context/DataContext';
import NewTripDrawer from '../components/NewTripDrawer';
import CloseTripDrawer from '../components/CloseTripDrawer';
import FuelSlipModal from '../components/FuelSlipModal';

export default function Trips() {
  const { trips, fuelSlips } = useData();

  const [isNewTripOpen, setIsNewTripOpen] = useState(false);
  const [selectedTripForClose, setSelectedTripForClose] = useState<Trip | null>(null);
  const [fuelSlipModalData, setFuelSlipModalData] = useState<{
    isOpen: boolean;
    trip: Trip | null;
  }>({
    isOpen: false,
    trip: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.up.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.down.route.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Open'
        ? trip.status !== 'Closed'
        : trip.status === 'Closed';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      <NewTripDrawer isOpen={isNewTripOpen} onClose={() => setIsNewTripOpen(false)} />
      <CloseTripDrawer
        isOpen={Boolean(selectedTripForClose)}
        onClose={() => setSelectedTripForClose(null)}
        trip={selectedTripForClose}
      />
      <FuelSlipModal
        isOpen={fuelSlipModalData.isOpen}
        onClose={() => setFuelSlipModalData({ isOpen: false, trip: null })}
        selectedTrip={fuelSlipModalData.trip}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Trips & Settlement</h1>
          <p className="text-sm text-gray-500 mt-1">Manage round-trips, Up/Down legs, driver advances, fuel slips, and net trip margin.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFuelSlipModalData({ isOpen: true, trip: trips[0] || null })}
            className="flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded hover:bg-amber-100 transition-mechanical btn-press shadow-2xs"
          >
            <Fuel className="w-4 h-4 text-amber-700" />
            Diesel & Pump Slips ({fuelSlips.length})
          </button>
          <button
            onClick={() => setIsNewTripOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium hover:bg-black transition-mechanical btn-press shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Start New Trip
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 py-3 border-b border-gray-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vehicle, driver, route, trip ID..."
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm rounded"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto bg-white border border-gray-200 px-3 py-2 sm:py-1.5 text-sm font-medium text-gray-700 cursor-pointer focus:outline-none rounded"
        >
          <option value="All">All Trips ({trips.length})</option>
          <option value="Open">Active / In-Transit Trips</option>
          <option value="Closed">Closed / Settled Trips</option>
        </select>
      </div>

      {/* Mobile View: Touch Trip Cards (Android Optimized) */}
      <div className="sm:hidden space-y-4">
        {filteredTrips.map((trip) => (
          <div key={trip.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                  {trip.id}
                </span>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                    trip.status === 'Closed'
                      ? 'bg-gray-100 text-gray-700 border border-gray-200'
                      : trip.status === 'Up Transit'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : trip.status === 'Unloading Up'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {trip.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {trip.status !== 'Closed' && (
                  <button
                    onClick={() => setSelectedTripForClose(trip)}
                    className="px-2.5 py-1 bg-gray-900 text-white text-xs font-semibold rounded hover:bg-black transition-mechanical flex items-center gap-1"
                  >
                    <Calculator className="w-3 h-3 text-amber-400" />
                    Close Trip
                  </button>
                )}
              </div>
            </div>

            <div>
              <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-gray-500" /> {trip.vehicle}
              </p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                Driver: {trip.driverName} {trip.driverPhone && `(${trip.driverPhone})`}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-blue-50/70 p-2.5 rounded border border-blue-100">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-blue-900 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-blue-600" /> Up Journey
                  </span>
                  <span className="font-bold font-mono text-blue-800">₹{trip.up.freight.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-gray-800 font-medium mt-0.5">{trip.up.route}</p>
                <p className="text-gray-500 text-[11px]">Client: {trip.up.client}</p>
              </div>

              <div className="bg-emerald-50/70 p-2.5 rounded border border-emerald-100">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-emerald-900 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-emerald-600" /> Down Journey
                  </span>
                  {trip.down.client !== '-' ? (
                    <span className="font-bold font-mono text-emerald-800">₹{trip.down.freight.toLocaleString('en-IN')}</span>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">Awaiting return</span>
                  )}
                </div>
                <p className="text-gray-800 font-medium mt-0.5">{trip.down.route}</p>
                {trip.down.client !== '-' && <p className="text-gray-500 text-[11px]">Client: {trip.down.client}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs font-mono">
              <span className="text-gray-500">
                Bhatta: ₹{(trip.advances?.driverBhatta || 0).toLocaleString('en-IN')}
              </span>
              <button
                onClick={() => setFuelSlipModalData({ isOpen: true, trip })}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100"
              >
                <Fuel className="w-3 h-3 text-amber-700" />
                Pump Slips
              </button>
            </div>
          </div>
        ))}
        {filteredTrips.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
            No trips found matching filter.
          </div>
        )}
      </div>

      {/* Desktop / Tablet View: Wide Data Table */}
      <div className="hidden sm:block w-full overflow-x-auto touch-scroll">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[880px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="py-3 font-semibold text-gray-900">Trip No.</th>
              <th className="py-3 font-semibold text-gray-900">Vehicle / Driver</th>
              <th className="py-3 font-semibold text-blue-900 flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> Up Journey
              </th>
              <th className="py-3 font-semibold text-emerald-900">
                <div className="flex items-center gap-1.5">
                  <ArrowDownRight className="w-3.5 h-3.5" /> Down Journey
                </div>
              </th>
              <th className="py-3 font-semibold text-gray-900 text-right">Advances</th>
              <th className="py-3 font-semibold text-gray-900 text-center">Status</th>
              <th className="py-3 font-semibold text-gray-900 text-right">Settlement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTrips.map((trip) => (
              <tr key={trip.id} className="hover:bg-gray-50 transition-mechanical">
                <td className="py-4 font-mono text-gray-900 font-semibold">{trip.id}</td>
                <td className="py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-gray-400" /> {trip.vehicle}
                    </span>
                    <span className="text-gray-500 text-xs mt-0.5 font-mono">
                      {trip.driverName} {trip.driverPhone && `(${trip.driverPhone})`}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex flex-col bg-blue-50/60 px-3 py-1.5 rounded border border-blue-100">
                    <span className="font-medium text-gray-900">{trip.up.route}</span>
                    <span className="text-gray-500 text-xs mt-0.5">
                      {trip.up.client} •{' '}
                      <span className="font-semibold text-blue-800">₹{trip.up.freight.toLocaleString('en-IN')}</span>
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex flex-col bg-emerald-50/60 px-3 py-1.5 rounded border border-emerald-100">
                    <span className="font-medium text-gray-900">{trip.down.route}</span>
                    {trip.down.client !== '-' ? (
                      <span className="text-gray-500 text-xs mt-0.5">
                        {trip.down.client} •{' '}
                        <span className="font-semibold text-emerald-800">
                          ₹{trip.down.freight.toLocaleString('en-IN')}
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Awaiting return load</span>
                    )}
                  </div>
                </td>
                <td className="py-4 text-right font-mono text-xs">
                  <p className="text-gray-600">Bhatta: ₹{(trip.advances?.driverBhatta || 0).toLocaleString('en-IN')}</p>
                  {(() => {
                    const slipsForTrip = fuelSlips.filter(s => s.tripId === trip.id);
                    const slipTotal = slipsForTrip.reduce((acc, s) => acc + s.totalAmount, 0);
                    return (
                      <button
                        onClick={() => setFuelSlipModalData({ isOpen: true, trip })}
                        className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-mechanical btn-press"
                        title="Click to view or log pump slips"
                      >
                        <Fuel className="w-3 h-3 text-amber-700" />
                        {slipsForTrip.length > 0 ? `${slipsForTrip.length} Slips: ₹${slipTotal.toLocaleString('en-IN')}` : '+ Fuel Slip'}
                      </button>
                    );
                  })()}
                </td>
                <td className="py-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${
                      trip.status === 'Closed'
                        ? 'bg-gray-100 text-gray-700 border border-gray-200'
                        : trip.status === 'Up Transit'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : trip.status === 'Down Transit'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {trip.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  {trip.status === 'Closed' ? (
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        +₹{(trip.closingSummary?.netProfit || 0).toLocaleString('en-IN')} Margin
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">Settled</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedTripForClose(trip)}
                      className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-black transition-mechanical btn-press shadow-2xs flex items-center gap-1.5 ml-auto"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      Close & Settle
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTrips.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-500">
            No trips found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
