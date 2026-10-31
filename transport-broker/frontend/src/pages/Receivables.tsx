import { useState } from 'react';
import { Search, Download, Plus, CheckCircle2, PlusCircle, FileSpreadsheet } from 'lucide-react';
import { useData } from '../context/DataContext';
import RecordPaymentModal from '../components/RecordPaymentModal';
import AddLeftoverModal from '../components/AddLeftoverModal';
import PartyStatementModal from '../components/PartyStatementModal';

export default function Receivables() {
  const { bookings, exportCSV } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLeftoverModalOpen, setIsLeftoverModalOpen] = useState(false);
  const [statementModalData, setStatementModalData] = useState<{
    isOpen: boolean;
    clientName: string;
  }>({
    isOpen: false,
    clientName: '',
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

  // Build receivable items from bookings
  const receivables = bookings.map((b, idx) => {
    const total = b.clientRate;
    const paid = b.clientPaidAmount || 0;
    const leftover = Math.max(0, total - paid);
    const invoiceNo = `INV-2026-${String(idx + 1).padStart(3, '0')}`;
    const status = paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Pending';

    return {
      invoice: invoiceNo,
      booking: b.id,
      client: b.client,
      route: b.route,
      total,
      paid,
      leftover,
      due: b.pickupDate,
      status,
    };
  });

  const totalInvoiced = receivables.reduce((sum, r) => sum + r.total, 0);
  const totalCollected = receivables.reduce((sum, r) => sum + r.paid, 0);
  const totalLeftover = receivables.reduce((sum, r) => sum + r.leftover, 0);

  // Filters
  const filtered = receivables.filter((r) => {
    const matchesSearch =
      r.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.booking.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.client.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const headers = ['Invoice No', 'Booking Ref', 'Client', 'Due Date', 'Status', 'Total Invoiced (INR)', 'Amount Paid (INR)', 'Leftover Balance (INR)'];
    const rows = filtered.map(r => [
      r.invoice,
      r.booking,
      r.client,
      r.due,
      r.status,
      r.total,
      r.paid,
      r.leftover
    ]);
    exportCSV('LohanLogistics_Receivables', headers, rows);
  };

  return (
    <div className="space-y-6 pb-16">
      <RecordPaymentModal
        isOpen={paymentModalData.isOpen}
        onClose={() => setPaymentModalData(prev => ({ ...prev, isOpen: false }))}
        defaultPartyType="CLIENT"
        defaultPartyName={paymentModalData.partyName}
        defaultBookingId={paymentModalData.bookingId}
        defaultAmount={paymentModalData.amount}
      />

      <AddLeftoverModal
        isOpen={isLeftoverModalOpen}
        onClose={() => setIsLeftoverModalOpen(false)}
        defaultPartyType="CLIENT"
      />

      <PartyStatementModal
        isOpen={statementModalData.isOpen}
        onClose={() => setStatementModalData({ isOpen: false, clientName: '' })}
        initialPartyType="CLIENT"
        initialPartyName={statementModalData.clientName}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Receivables</h1>
          <p className="text-sm text-gray-500 mt-1">Client invoices, incoming collections, and leftover balances.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatementModalData({ isOpen: true, clientName: receivables[0]?.client || '' })}
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-800 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-mechanical btn-press shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-gray-600" />
            <span className="hidden sm:inline">Party /</span> Khata
          </button>
          <button
            onClick={() => setIsLeftoverModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium hover:bg-amber-100 transition-mechanical btn-press shadow-2xs"
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
            Record Payment
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
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Billed</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">₹{totalInvoiced.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mt-0.5">Across {receivables.length} invoices</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Received</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">₹{totalCollected.toLocaleString('en-IN')}</p>
          <p className="text-xs text-emerald-600/80 mt-0.5">Deposited into account</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Total Leftover Outstanding</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-800 mt-1">₹{totalLeftover.toLocaleString('en-IN')}</p>
          <p className="text-xs text-amber-700/80 mt-0.5">Pending collection from clients</p>
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
            placeholder="Search invoices, clients, bookings..."
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm rounded"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto bg-white border border-gray-200 px-3 py-2 sm:py-1.5 text-sm font-medium text-gray-700 cursor-pointer focus:outline-none rounded"
        >
          <option value="All">All Invoices ({receivables.length})</option>
          <option value="Pending">Pending Leftovers</option>
          <option value="Partial">Partially Paid</option>
          <option value="Paid">Fully Paid</option>
        </select>
      </div>

      {/* Mobile View: Touch Receivable Cards (Android Optimized) */}
      <div className="sm:hidden space-y-3">
        {filtered.map((r) => (
          <div key={r.invoice} className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-gray-900">{r.invoice}</span>
                <span className="text-[11px] text-gray-400 font-mono ml-2">Ref: {r.booking}</span>
              </div>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                  r.status === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : r.status === 'Partial'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {r.status}
              </span>
            </div>

            <div>
              <p className="font-bold text-gray-900 text-sm">{r.client}</p>
              <p className="text-xs text-gray-600 mt-0.5">{r.route}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded text-xs text-center font-mono">
              <div>
                <span className="text-[10px] text-gray-400 block font-sans">Billed</span>
                <span className="font-semibold text-gray-900">₹{r.total.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-sans">Collected</span>
                <span className="font-semibold text-emerald-700">₹{r.paid.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-sans">Leftover</span>
                <span className="font-bold text-amber-800">₹{r.leftover.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-400">Due: {r.due}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatementModalData({ isOpen: true, clientName: r.client })}
                  className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                  Khata
                </button>
                {r.status !== 'Paid' && (
                  <button
                    onClick={() =>
                      setPaymentModalData({
                        isOpen: true,
                        partyName: r.client,
                        bookingId: r.booking,
                        amount: r.leftover,
                      })
                    }
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-gray-900 rounded hover:bg-black"
                  >
                    Receive
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
            No receivables found matching search.
          </div>
        )}
      </div>

      {/* Desktop / Tablet View: Wide Table */}
      <div className="hidden sm:block w-full overflow-x-auto touch-scroll">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[860px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="py-3 font-semibold text-gray-900">Invoice No.</th>
              <th className="py-3 font-semibold text-gray-900">Booking Ref</th>
              <th className="py-3 font-semibold text-gray-900">Client</th>
              <th className="py-3 font-semibold text-gray-900">Due Date</th>
              <th className="py-3 font-semibold text-gray-900 text-right">Total Invoiced</th>
              <th className="py-3 font-semibold text-emerald-800 text-right">Received</th>
              <th className="py-3 font-semibold text-amber-800 text-right">Leftover Balance</th>
              <th className="py-3 font-semibold text-gray-900">Status</th>
              <th className="py-3 font-semibold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((rec) => (
              <tr key={rec.invoice} className="hover:bg-gray-50 transition-colors">
                <td className="py-3.5 font-mono text-gray-900 font-semibold">{rec.invoice}</td>
                <td className="py-3.5 font-mono text-gray-500">{rec.booking}</td>
                <td className="py-3.5 font-medium text-gray-900">
                  <p>{rec.client}</p>
                  <p className="text-xs text-gray-400 font-normal">{rec.route}</p>
                </td>
                <td className="py-3.5 text-gray-600">{rec.due}</td>
                <td className="py-3.5 font-semibold text-gray-900 text-right">₹{rec.total.toLocaleString('en-IN')}</td>
                <td className="py-3.5 font-semibold text-emerald-700 text-right">₹{rec.paid.toLocaleString('en-IN')}</td>
                <td className="py-3.5 font-bold font-mono text-amber-800 text-right">
                  ₹{rec.leftover.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      rec.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : rec.status === 'Partial'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {rec.status}
                  </span>
                </td>
                <td className="py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() =>
                        setStatementModalData({
                          isOpen: true,
                          clientName: rec.client,
                        })
                      }
                      title="View Khata / Ledger"
                      className="px-2 py-1 bg-white text-gray-700 border border-gray-300 text-xs font-semibold rounded hover:bg-gray-100 transition-mechanical btn-press inline-flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-gray-600" />
                      Khata
                    </button>
                    {rec.leftover > 0 ? (
                      <button
                        onClick={() =>
                          setPaymentModalData({
                            isOpen: true,
                            partyName: rec.client,
                            bookingId: rec.booking,
                            amount: rec.leftover,
                          })
                        }
                        className="px-2.5 py-1 bg-gray-900 text-white text-xs font-medium rounded hover:bg-black transition-mechanical btn-press shadow-2xs"
                      >
                        Settle
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
            No invoices match your search.
          </div>
        )}
      </div>
    </div>
  );
}
