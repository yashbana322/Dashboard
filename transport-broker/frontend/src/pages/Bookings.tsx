import { useState } from 'react';
import { Plus, Search, X, Share2, FileText, PlusCircle } from 'lucide-react';
import NewBookingDrawer from '../components/NewBookingDrawer';
import RecordPaymentModal from '../components/RecordPaymentModal';
import AddLeftoverModal from '../components/AddLeftoverModal';
import BiltyModal from '../components/BiltyModal';
import WhatsAppShareModal from '../components/WhatsAppShareModal';
import { useData } from '../context/DataContext';
import type { Booking } from '../context/DataContext';

export default function Bookings() {
  const { bookings, updateBooking } = useData();

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [biltyModalData, setBiltyModalData] = useState<{
    isOpen: boolean;
    booking: Booking | null;
  }>({
    isOpen: false,
    booking: null,
  });
  const [leftoverModalData, setLeftoverModalData] = useState<{
    isOpen: boolean;
    partyType: 'CLIENT' | 'TRANSPORTER';
    partyName: string;
    bookingId: string;
  }>({
    isOpen: false,
    partyType: 'CLIENT',
    partyName: '',
    bookingId: '',
  });
  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    partyType: 'CLIENT' | 'TRANSPORTER';
    partyName: string;
    bookingId: string;
    amount: number;
  }>({
    isOpen: false,
    partyType: 'CLIENT',
    partyName: '',
    bookingId: '',
    amount: 0,
  });
  const [whatsAppModalData, setWhatsAppModalData] = useState<{
    isOpen: boolean;
    booking: Booking | null;
  }>({
    isOpen: false,
    booking: null,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const selectedBooking: Booking | undefined = bookings.find(b => b.id === selectedBookingId);

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.transporter.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16 relative">
      <NewBookingDrawer isOpen={isNewBookingOpen} onClose={() => setIsNewBookingOpen(false)} />

      <RecordPaymentModal
        isOpen={paymentModalData.isOpen}
        onClose={() => setPaymentModalData(prev => ({ ...prev, isOpen: false }))}
        defaultPartyType={paymentModalData.partyType}
        defaultPartyName={paymentModalData.partyName}
        defaultBookingId={paymentModalData.bookingId}
        defaultAmount={paymentModalData.amount}
      />

      <AddLeftoverModal
        isOpen={leftoverModalData.isOpen}
        onClose={() => setLeftoverModalData(prev => ({ ...prev, isOpen: false }))}
        defaultPartyType={leftoverModalData.partyType}
        defaultPartyName={leftoverModalData.partyName}
        defaultBookingId={leftoverModalData.bookingId}
      />

      <BiltyModal
        isOpen={biltyModalData.isOpen}
        onClose={() => setBiltyModalData({ isOpen: false, booking: null })}
        booking={biltyModalData.booking}
      />

      <WhatsAppShareModal
        isOpen={whatsAppModalData.isOpen}
        onClose={() => setWhatsAppModalData({ isOpen: false, booking: null })}
        recipientName={whatsAppModalData.booking ? `${whatsAppModalData.booking.client} / ${whatsAppModalData.booking.transporter}` : 'Party'}
        title="Dispatch Trip Assignment via WhatsApp"
        messageText={whatsAppModalData.booking ? (
          `*LohanLogistics - Trip Assignment*\n\n` +
          `📦 *Booking ID:* ${whatsAppModalData.booking.id}\n` +
          `🏢 *Client:* ${whatsAppModalData.booking.client}\n` +
          `📍 *Route:* ${whatsAppModalData.booking.route}\n` +
          `🚛 *Vehicle:* ${whatsAppModalData.booking.vehicleNo} (${whatsAppModalData.booking.vehicleType})\n` +
          `👤 *Transporter:* ${whatsAppModalData.booking.transporter}\n` +
          `📅 *Pickup:* ${whatsAppModalData.booking.pickupDate} at ${whatsAppModalData.booking.pickupTime}\n` +
          `📌 *Status:* ${whatsAppModalData.booking.status}\n\n` +
          `_Managed via LohanLogistics Transport Operations_`
        ) : ''}
      />

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Bookings</h1>
            <p className="text-sm text-gray-500 mt-1">Operational ledger of customer shipments</p>
          </div>
          <button
            onClick={() => setIsNewBookingOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-black transition-mechanical btn-press shadow-xs"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 py-3 border-b border-gray-200">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, client, route, vehicle..."
              className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm rounded"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-white border border-gray-200 px-3 py-2 sm:py-1.5 text-sm font-medium text-gray-700 cursor-pointer focus:outline-none rounded"
          >
            <option value="All">All Statuses ({bookings.length})</option>
            <option value="Requested">Requested</option>
            <option value="Arranged">Arranged</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Mobile View: Touch-Friendly Load Cards (Android Optimized) */}
        <div className="sm:hidden space-y-3">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBookingId(b.id)}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-3 active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    {b.id}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                      b.status === 'Completed' || b.status === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : b.status === 'In Transit'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : b.status === 'Arranged'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-gray-900 font-mono">₹{b.clientRate.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-emerald-700 font-bold block font-mono">Margin: +₹{b.margin.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <p className="font-bold text-gray-900 text-sm">{b.client}</p>
                <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5 font-medium">
                  {b.route}
                </p>
                <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                  🚛 {b.vehicleNo} ({b.vehicleType})
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] text-gray-400">Pickup: {b.pickupDate}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBiltyModalData({ isOpen: true, booking: b })}
                    className="px-2.5 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-mechanical flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3 text-gray-600" />
                    LR Bilty
                  </button>
                  <button
                    onClick={() => setWhatsAppModalData({ isOpen: true, booking: b })}
                    className="p-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-mechanical"
                    title="Share WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredBookings.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
              No bookings match your current filters.
            </div>
          )}
        </div>

        {/* Desktop / Tablet View: Wide Data Table */}
        <div className="hidden sm:block w-full overflow-x-auto touch-scroll">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="py-3 font-semibold text-gray-900">ID</th>
                  <th className="py-3 font-semibold text-gray-900">Client</th>
                  <th className="py-3 font-semibold text-gray-900">Route</th>
                  <th className="py-3 font-semibold text-gray-900">Vehicle</th>
                  <th className="py-3 font-semibold text-gray-900">Status</th>
                  <th className="py-3 font-semibold text-gray-900 text-right">Client Rate</th>
                  <th className="py-3 font-semibold text-emerald-800 text-right">Margin</th>
                  <th className="py-3 font-semibold text-gray-900 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((b) => {
                  const isSelected = selectedBookingId === b.id;
                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBookingId(b.id)}
                      className={`cursor-pointer transition-mechanical ${isSelected ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                    >
                      <td className="py-3.5 font-mono text-gray-900">{b.id}</td>
                      <td className="py-3.5 font-medium text-gray-900">{b.client}</td>
                      <td className="py-3.5 text-gray-600 flex items-center gap-1.5">
                        {b.route.split('→').map((p, i) => (
                          <span key={i} className="flex items-center gap-1.5">
                            {p.trim()}
                            {i === 0 && <span className="text-gray-300">→</span>}
                          </span>
                        ))}
                      </td>
                      <td className="py-3.5 text-gray-600">
                        <span className="font-mono text-xs text-gray-500 block">{b.vehicleNo}</span>
                        <span>{b.vehicleType}</span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            b.status === 'Completed' || b.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.status === 'In Transit'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : b.status === 'Arranged'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-medium text-gray-900 text-right">₹{b.clientRate.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 font-semibold text-emerald-700 text-right">₹{b.margin.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setBiltyModalData({ isOpen: true, booking: b })}
                            title="Generate or Print Bilty / Lorry Receipt (LR)"
                            className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-mechanical btn-press inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-gray-600" />
                            LR
                          </button>
                          <button
                            onClick={() => setWhatsAppModalData({ isOpen: true, booking: b })}
                            title="Dispatch via WhatsApp (Direct Number or Contact Picker)"
                            className="p-1.5 text-gray-400 hover:text-emerald-700 rounded hover:bg-emerald-50 transition-mechanical btn-press"
                          >
                            <Share2 className="w-4 h-4 text-emerald-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredBookings.length === 0 && (
              <div className="text-center py-12 text-sm text-gray-500">
                No bookings match your current filters.
              </div>
            )}
          </div>
        </div>

      {/* Dynamic Drawer / Detail View */}
      {selectedBooking && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-xs z-40 transition-mechanical"
            onClick={() => setSelectedBookingId(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right-8 duration-300 border-l border-gray-200 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <button
                className="text-gray-500 hover:text-gray-900 text-sm font-medium flex items-center gap-1.5"
                onClick={() => setSelectedBookingId(null)}
              >
                <X className="w-4 h-4" /> Close
              </button>
            <div className="flex items-center gap-2">
              <span className="font-mono text-gray-500 text-sm font-semibold">{selectedBooking.id}</span>
              <button
                onClick={() => setWhatsAppModalData({ isOpen: true, booking: selectedBooking })}
                className="text-xs flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-200 hover:bg-emerald-100 transition-mechanical btn-press font-semibold"
              >
                <Share2 className="w-3 h-3 text-emerald-600" />
                Dispatch WhatsApp
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="flex justify-between items-start mb-1">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">{selectedBooking.client}</h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                  {selectedBooking.status}
                </span>
              </div>
              <p className="text-base font-medium text-gray-600 flex items-center gap-2">
                {selectedBooking.route}
              </p>
              <div className="text-xs text-gray-500 mt-2 space-y-0.5 font-mono">
                <p>Pickup: {selectedBooking.pickupDate} at {selectedBooking.pickupTime}</p>
                {selectedBooking.notes && <p className="font-sans text-gray-600 mt-1 italic">"{selectedBooking.notes}"</p>}
              </div>
            </div>

            {/* Quick Status Updater */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">Update Trip Status</span>
              <div className="flex flex-wrap gap-1.5">
                {(['Requested', 'Arranged', 'In Transit', 'Delivered', 'Completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateBooking(selectedBooking.id, { status: st })}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-mechanical btn-press ${
                      selectedBooking.status === st
                        ? 'bg-gray-900 text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Vehicle & Transporter */}
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50/50 p-3 rounded border border-gray-100">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Vehicle</h3>
                <p className="font-mono text-gray-900 font-bold">{selectedBooking.vehicleNo}</p>
                <p className="text-xs text-gray-600 mt-0.5">{selectedBooking.vehicleType}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Transporter</h3>
                <p className="font-medium text-gray-900">{selectedBooking.transporter}</p>
                <p className="text-xs text-gray-500 mt-0.5">Assigned Fleet</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Financials & Live Leftovers */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Trip Financials</h3>
              <div className="space-y-2.5 text-sm bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Client Invoiced Rate</span>
                  <span className="font-semibold text-gray-900">₹{selectedBooking.clientRate.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Transporter Agreed Cost</span>
                  <span className="font-semibold text-gray-900">₹{selectedBooking.transporterRate.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Net Expected Margin:</span>
                  <span className="text-emerald-700">₹{selectedBooking.margin.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button
                onClick={() =>
                  setLeftoverModalData({
                    isOpen: true,
                    partyType: 'CLIENT',
                    partyName: selectedBooking.client,
                    bookingId: selectedBooking.id,
                  })
                }
                className="w-full mt-2 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold rounded hover:bg-amber-100 transition-mechanical btn-press shadow-2xs flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
                + Add Halting / Detention / Extra Leftover
              </button>
            </div>

            <hr className="border-gray-100" />

            {/* Payment Leftovers & Manual Settlement */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Payment & Leftovers</h3>

              {/* Client Receivable Box */}
              <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700">Client Receivable (ABC Industries)</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    selectedBooking.clientPaymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedBooking.clientPaymentStatus === 'Partial'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {selectedBooking.clientPaymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-xs text-gray-500">
                    Paid: ₹{selectedBooking.clientPaidAmount.toLocaleString('en-IN')} of ₹{selectedBooking.clientRate.toLocaleString('en-IN')}
                  </span>
                  <span className="font-mono font-bold text-amber-800">
                    Leftover: ₹{(selectedBooking.clientRate - selectedBooking.clientPaidAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                {selectedBooking.clientPaidAmount < selectedBooking.clientRate && (
                  <button
                    onClick={() =>
                      setPaymentModalData({
                        isOpen: true,
                        partyType: 'CLIENT',
                        partyName: selectedBooking.client,
                        bookingId: selectedBooking.id,
                        amount: selectedBooking.clientRate - selectedBooking.clientPaidAmount,
                      })
                    }
                    className="w-full mt-2 py-1.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-black transition-mechanical btn-press"
                  >
                    + Record Client Payment
                  </button>
                )}
              </div>

              {/* Transporter Payable Box */}
              <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700">Transporter Payable ({selectedBooking.transporter})</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    selectedBooking.transporterPaymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedBooking.transporterPaymentStatus === 'Partial'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {selectedBooking.transporterPaymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-xs text-gray-500">
                    Paid: ₹{selectedBooking.transporterPaidAmount.toLocaleString('en-IN')} of ₹{selectedBooking.transporterRate.toLocaleString('en-IN')}
                  </span>
                  <span className="font-mono font-bold text-amber-800">
                    Leftover: ₹{(selectedBooking.transporterRate - selectedBooking.transporterPaidAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                {selectedBooking.transporterPaidAmount < selectedBooking.transporterRate && (
                  <button
                    onClick={() =>
                      setPaymentModalData({
                        isOpen: true,
                        partyType: 'TRANSPORTER',
                        partyName: selectedBooking.transporter,
                        bookingId: selectedBooking.id,
                        amount: selectedBooking.transporterRate - selectedBooking.transporterPaidAmount,
                      })
                    }
                    className="w-full mt-2 py-1.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-black transition-mechanical btn-press"
                  >
                    + Record Transporter Payout
                  </button>
                )}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Documents */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Attached Documents</h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {selectedBooking.documents.length > 0 ? (
                  selectedBooking.documents.map((d, i) => (
                    <span key={i} className="px-2.5 py-1.5 bg-gray-100 text-gray-800 font-medium rounded border border-gray-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-gray-500" /> {d}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic text-xs">No documents attached yet</span>
                )}
              </div>
              <button
                onClick={() => setBiltyModalData({ isOpen: true, booking: selectedBooking })}
                className="w-full mt-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded hover:bg-black transition-mechanical btn-press shadow-2xs flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Generate / Print Digital Bilty (LR)
              </button>
            </div>

          </div>
        </div>
      </>
    )}
  </div>
);
}
