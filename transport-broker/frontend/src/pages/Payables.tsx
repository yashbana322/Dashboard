import { useState } from 'react';
import { Search, Download, Plus, CheckCircle2, PlusCircle, FileSpreadsheet } from 'lucide-react';
import { useData } from '../context/DataContext';
import RecordPaymentModal from '../components/RecordPaymentModal';
import AddLeftoverModal from '../components/AddLeftoverModal';
import PartyStatementModal from '../components/PartyStatementModal';

export default function Payables() {
  const { bookings, exportCSV } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLeftoverModalOpen, setIsLeftoverModalOpen] = useState(false);
  const [statementModalData, setStatementModalData] = useState<{
    isOpen: boolean;
    transporterName: string;
  }>({
    isOpen: false,
    transporterName: '',
  });
  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    partyName: string;
    bookingId: string;
    amount: number;
  }>({
    isOpen: false,
    partyName: '',
    bookingId: '',
    amount: 0,
  });

  // Build payables from bookings where transporter is assigned
  const payables = bookings
    .filter((b) => b.transporter && b.transporter !== 'Pending Assignment')
    .map((b) => {
      const total = b.transporterRate;
      const paid = b.transporterPaidAmount || 0;
      const leftover = Math.max(0, total - paid);
      const status = paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Pending';

      return {
        trip: b.id,
        transporter: b.transporter,
        vehicleNo: b.vehicleNo,
        route: b.route,
        due: b.pickupDate,
        total,
        paid,
        leftover,
        status,
      };
    });

  const totalAgreed = payables.reduce((sum, p) => sum + p.total, 0);
  const totalPaid = payables.reduce((sum, p) => sum + p.paid, 0);
  const totalLeftover = payables.reduce((sum, p) => sum + p.leftover, 0);

  const filtered = payables.filter((p) => {
    const matchesSearch =
      p.trip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.route.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const headers = ['Trip Ref', 'Transporter', 'Vehicle No', 'Route', 'Due Date', 'Status', 'Total Agreed (INR)', 'Amount Paid (INR)', 'Leftover Payable (INR)'];
    const rows = filtered.map(p => [
      p.trip,
      p.transporter,
      p.vehicleNo,
      p.route,
      p.due,
      p.status,
      p.total,
      p.paid,
      p.leftover
    ]);
    exportCSV('LohanLogistics_Payables', headers, rows);
  };

  return (
    <div className="space-y-6 pb-16">
      <RecordPaymentModal
        isOpen={paymentModalData.isOpen}
        onClose={() => setPaymentModalData(prev => ({ ...prev, isOpen: false }))}
        defaultPartyType="TRANSPORTER"
        defaultPartyName={paymentModalData.partyName}
        defaultBookingId={paymentModalData.bookingId}
        defaultAmount={paymentModalData.amount}
      />

      <AddLeftoverModal
        isOpen={isLeftoverModalOpen}
        onClose={() => setIsLeftoverModalOpen(false)}
        defaultPartyType="TRANSPORTER"
      />

      <PartyStatementModal
        isOpen={statementModalData.isOpen}
        onClose={() => setStatementModalData({ isOpen: false, transporterName: '' })}
        initialPartyType="TRANSPORTER"
        initialPartyName={statementModalData.transporterName}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Payables</h1>
          <p className="text-sm text-gray-500 mt-1">Fleet owner payouts, diesel advances, and leftover balances.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatementModalData({ isOpen: true, transporterName: payables[0]?.transporter || '' })}
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-800 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-mechanical btn-press shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-gray-600" />
            <span className="hidden sm:inline">Fleet /</span> Khata
          </button>
          <button
            onClick={() => setIsLeftoverModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-3.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium hover:bg-amber-100 transition-mechanical btn-press shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-amber-700" />
            + Leftover
          </button>
          <button
            onClick={() =>
              setPaymentModalData({
                isOpen: true,
                partyName: '',
                bookingId: '',
                amount: 0,
              })
            }
            className="flex items-center gap-2 bg-gray-900 text-white px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium hover:bg-black transition-mechanical btn-press shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Record Payout
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-mechanical btn-press"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-white border border-gray-200 rounded-lg p-4 sm:p-5 shadow-xs">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Freight</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">₹{totalAgreed.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mt-0.5">Agreed across {payables.length} trips</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Disbursed</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">₹{totalPaid.toLocaleString('en-IN')}</p>
          <p className="text-xs text-emerald-600/80 mt-0.5">Diesel advances + payouts sent</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Leftover Payable</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-800 mt-1">₹{totalLeftover.toLocaleString('en-IN')}</p>
          <p className="text-xs text-amber-700/80 mt-0.5">Pending payout to transporters</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 py-3 border-b border-gray-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transporter, vehicle, trip ref..."
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm rounded"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto bg-white border border-gray-200 px-3 py-2 sm:py-1.5 text-sm font-medium text-gray-700 cursor-pointer focus:outline-none rounded"
        >
          <option value="All">All Payables ({payables.length})</option>
          <option value="Pending">Pending Leftovers</option>
          <option value="Partial">Partially Paid</option>
          <option value="Paid">Fully Paid</option>
        </select>
      </div>

      {/* Mobile View: Touch Payable Cards (Android Optimized) */}
      <div className="sm:hidden space-y-3">
        {filtered.map((p) => (
          <div key={p.trip} className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{p.trip}</span>
                <span className="text-[11px] text-gray-500 font-mono ml-2">🚛 {p.vehicleNo}</span>
              </div>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                  p.status === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : p.status === 'Partial'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {p.status}
              </span>
            </div>

            <div>
              <p className="font-bold text-gray-900 text-sm">{p.transporter}</p>
              <p className="text-xs text-gray-600 mt-0.5">{p.route}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded text-xs text-center font-mono">
              <div>
                <span className="text-[10px] text-gray-400 block font-sans">Agreed</span>
                <span className="font-semibold text-gray-900">₹{p.total.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-sans">Paid</span>
                <span className="font-semibold text-emerald-700">₹{p.paid.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-sans">Leftover</span>
                <span className="font-bold text-amber-800">₹{p.leftover.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-400">Date: {p.due}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatementModalData({ isOpen: true, transporterName: p.transporter })}
                  className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                  Khata
                </button>
                {p.status !== 'Paid' && (
                  <button
                    onClick={() =>
                      setPaymentModalData({
                        isOpen: true,
                        partyName: p.transporter,
                        bookingId: p.trip,
                        amount: p.leftover,
                      })
                    }
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-gray-900 rounded hover:bg-black"
                  >
                    Pay
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
            No payables found matching search.
          </div>
        )}
      </div>

      {/* Desktop / Tablet View: Wide Table */}
      <div className="hidden sm:block w-full overflow-x-auto touch-scroll">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[860px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="py-3 font-semibold text-gray-900">Trip Ref</th>
              <th className="py-3 font-semibold text-gray-900">Transporter</th>
              <th className="py-3 font-semibold text-gray-900">Vehicle</th>
              <th className="py-3 font-semibold text-gray-900">Route</th>
              <th className="py-3 font-semibold text-gray-900 text-right">Agreed Freight</th>
              <th className="py-3 font-semibold text-emerald-800 text-right">Paid Out</th>
              <th className="py-3 font-semibold text-amber-800 text-right">Leftover Payable</th>
              <th className="py-3 font-semibold text-gray-900">Status</th>
              <th className="py-3 font-semibold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((pay) => (
              <tr key={pay.trip} className="hover:bg-gray-50 transition-colors">
                <td className="py-3.5 font-mono text-gray-900 font-semibold">{pay.trip}</td>
                <td className="py-3.5 font-medium text-gray-900">{pay.transporter}</td>
                <td className="py-3.5 font-mono text-gray-600 text-xs">{pay.vehicleNo}</td>
                <td className="py-3.5 text-gray-600">{pay.route}</td>
                <td className="py-3.5 font-semibold text-gray-900 text-right">₹{pay.total.toLocaleString('en-IN')}</td>
                <td className="py-3.5 font-semibold text-emerald-700 text-right">₹{pay.paid.toLocaleString('en-IN')}</td>
                <td className="py-3.5 font-bold font-mono text-amber-800 text-right">
                  ₹{pay.leftover.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      pay.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : pay.status === 'Partial'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {pay.status}
                  </span>
                </td>
                <td className="py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() =>
                        setStatementModalData({
                          isOpen: true,
                          transporterName: pay.transporter,
                        })
                      }
                      title="View Transporter Khata / Ledger"
                      className="px-2 py-1 bg-white text-gray-700 border border-gray-300 text-xs font-semibold rounded hover:bg-gray-100 transition-mechanical btn-press inline-flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-gray-600" />
                      Khata
                    </button>
                    {pay.leftover > 0 ? (
                      <button
                        onClick={() =>
                          setPaymentModalData({
                            isOpen: true,
                            partyName: pay.transporter,
                            bookingId: pay.trip,
                            amount: pay.leftover,
                          })
                        }
                        className="px-2.5 py-1 bg-gray-900 text-white text-xs font-medium rounded hover:bg-black transition-mechanical btn-press shadow-2xs"
                      >
                        Payout
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-medium flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-500">
            No payables match your search.
          </div>
        )}
      </div>
    </div>
  );
}
