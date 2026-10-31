import { useState } from 'react';
import { Plus, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import NewBookingDrawer from '../components/NewBookingDrawer';

export default function Dashboard() {
  const { bookings, requirements, payments, clients, transporters, trips } = useData();
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

  // Live KPI metrics
  const totalReceivable = clients.reduce((acc, c) => acc + (c.outstanding || 0), 0);
  const totalPayable = transporters.reduce((acc, t) => acc + (t.outstandingPayable || 0), 0);
  const totalMargin = bookings.reduce((acc, b) => acc + (b.margin || 0), 0);
  const activeTripsCount = trips.filter(t => t.status !== 'Closed').length;
  const pendingVehiclesCount = requirements.filter(r => r.status !== 'Arranged').length;
  const paymentsDueCount = clients.filter(c => c.outstanding > 0).length;

  const todayRequirements = requirements.filter(r => r.date.toLowerCase().includes('today') || !r.date.includes('Tomorrow'));
  const tomorrowRequirements = requirements.filter(r => r.date.toLowerCase().includes('tomorrow'));

  const recentBookings = bookings.slice(0, 4);
  const recentPayments = payments.slice(0, 4);

  return (
    <div className="space-y-10 pb-16">
      <NewBookingDrawer isOpen={isNewBookingOpen} onClose={() => setIsNewBookingOpen(false)} />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Daily operations, fleet coordination, and financial health</p>
        </div>
        <button
          onClick={() => setIsNewBookingOpen(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-black transition-mechanical btn-press shadow-xs"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      {/* Dynamic KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-6 pb-6 border-b border-gray-200">
        <div>
          <p className="text-2xl font-bold text-gray-900 font-mono">₹{(totalReceivable / 100000).toFixed(2)}L</p>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Total Receivable</p>
          <p className="text-[10px] text-amber-700 font-mono mt-0.5">Leftover Client Balance</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 font-mono">₹{(totalPayable / 100000).toFixed(2)}L</p>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Total Payable</p>
          <p className="text-[10px] text-gray-400 font-mono mt-0.5">Leftover Transporter Cost</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-emerald-700 font-mono">₹{(totalMargin / 1000).toFixed(0)}K</p>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Expected Margin</p>
          <p className="text-[10px] text-emerald-600 font-mono mt-0.5">Net Broker Commission</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 font-mono">{activeTripsCount}</p>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Active Trips</p>
          <p className="text-[10px] text-gray-400 font-mono mt-0.5">On Road / Transit</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-800 font-mono">{pendingVehiclesCount}</p>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Vehicles Required</p>
          <p className="text-[10px] text-amber-700 font-mono mt-0.5">Need Arrangement</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 font-mono">{paymentsDueCount}</p>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Parties With Dues</p>
          <p className="text-[10px] text-gray-400 font-mono mt-0.5">Action Needed</p>
        </div>
      </div>

      {/* Main Grid: Requirements vs Others */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Requirements (The most important thing for the broker) */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Upcoming Vehicle Requirements
              </h2>
              <Link to="/requirements" className="text-xs font-medium text-gray-700 hover:text-black flex items-center gap-1">
                View all pipeline <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-6">
              {/* TODAY */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 pb-2 border-b border-gray-200">
                  Today
                </h3>
                <div className="space-y-2">
                  {todayRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-start gap-4 text-sm hover:bg-white hover:shadow-xs p-3 -mx-3 rounded-lg transition-mechanical border border-transparent hover:border-gray-200"
                    >
                      <span className="font-mono text-gray-500 shrink-0 w-16 pt-0.5 text-xs">{req.time}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{req.client}</p>
                        <p className="text-gray-600 text-xs mt-0.5">{req.route}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="font-medium text-gray-700 text-xs bg-gray-100 px-2 py-0.5 rounded">{req.vehicle}</span>
                          {req.status === 'Arranged' ? (
                            <span className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                              <Check className="w-3.5 h-3.5" /> Vehicle Arranged
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-800 font-semibold text-xs">
                              <AlertTriangle className="w-3.5 h-3.5" /> {req.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {todayRequirements.length === 0 && (
                    <p className="text-xs text-gray-400 italic py-2">No vehicle requirements for today.</p>
                  )}
                </div>
              </div>

              {/* TOMORROW */}
              {tomorrowRequirements.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 pb-2 border-b border-gray-200">
                    Tomorrow
                  </h3>
                  <div className="space-y-2">
                    {tomorrowRequirements.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-start gap-4 text-sm hover:bg-white hover:shadow-xs p-3 -mx-3 rounded-lg transition-mechanical border border-transparent hover:border-gray-200"
                      >
                        <span className="font-mono text-gray-500 shrink-0 w-16 pt-0.5 text-xs">{req.time}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{req.client}</p>
                          <p className="text-gray-600 text-xs mt-0.5">{req.route}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="font-medium text-gray-700 text-xs bg-gray-100 px-2 py-0.5 rounded">{req.vehicle}</span>
                            <span className="flex items-center gap-1 text-amber-800 font-semibold text-xs">
                              <AlertTriangle className="w-3.5 h-3.5" /> {req.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Bookings & Payments */}
        <div className="lg:col-span-5 space-y-10">
          {/* Recent Bookings */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Bookings</h2>
              <Link to="/bookings" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex justify-between items-start text-sm hover:bg-white hover:shadow-xs p-3 -mx-3 rounded-lg transition-mechanical border border-transparent hover:border-gray-200"
                >
                  <div>
                    <span className="font-mono text-gray-900 font-semibold mr-2">{b.id}</span>
                    <span className="font-medium text-gray-800">{b.client}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{b.route}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                      {b.status}
                    </span>
                    <p className="text-xs font-bold text-emerald-700 mt-1">₹{b.margin.toLocaleString('en-IN')} Margin</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Activity */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Activity (Settled)</h2>
              <Link to="/receivables" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
                Finance ledger <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-start text-sm hover:bg-white hover:shadow-xs p-3 -mx-3 rounded-lg transition-mechanical border border-transparent hover:border-gray-200"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{p.partyName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">
                      {p.mode} • Ref: {p.refNo} ({p.date})
                    </p>
                    {p.notes && <p className="text-[11px] text-gray-400 mt-0.5">{p.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-mono text-gray-900">₹{p.amount.toLocaleString('en-IN')}</p>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded mt-0.5 ${
                        p.partyType === 'CLIENT'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {p.partyType === 'CLIENT' ? 'Receivable' : 'Payable'}
                    </span>
                  </div>
                </div>
              ))}
              {recentPayments.length === 0 && (
                <p className="text-xs text-gray-400 italic py-2">No recent payments logged.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
