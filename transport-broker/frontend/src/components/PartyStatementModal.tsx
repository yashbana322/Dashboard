import { useState, useMemo } from 'react';
import { X, Printer, Share2, Download, Calendar, FileSpreadsheet } from 'lucide-react';
import { useData } from '../context/DataContext';
import WhatsAppShareModal from './WhatsAppShareModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialPartyType?: 'CLIENT' | 'TRANSPORTER';
  initialPartyName?: string;
}

interface LedgerEntry {
  id: string;
  date: string;
  type: 'BOOKING_FREIGHT' | 'PAYMENT' | 'LEFTOVER_ADJUSTMENT';
  typeLabel: string;
  refNo: string;
  particulars: string;
  debit: number;   // Money owed to us (for client) OR money paid out to transporter
  credit: number;  // Money paid to us (by client) OR freight owed to transporter
  runningBalance: number;
}

export default function PartyStatementModal({
  isOpen,
  onClose,
  initialPartyType = 'CLIENT',
  initialPartyName = '',
}: Props) {
  const { clients, transporters, bookings, payments, exportCSV } = useData();

  const [partyType, setPartyType] = useState<'CLIENT' | 'TRANSPORTER'>(initialPartyType);
  const [selectedPartyName, setSelectedPartyName] = useState<string>(initialPartyName);
  const [dateRange, setDateRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30_DAYS' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Update selected party when modal opens or initial values change
  useMemo(() => {
    if (initialPartyName) {
      setSelectedPartyName(initialPartyName);
      setPartyType(initialPartyType);
    } else {
      if (partyType === 'CLIENT' && clients.length > 0 && !selectedPartyName) {
        setSelectedPartyName(clients[0]?.name || '');
      } else if (partyType === 'TRANSPORTER' && transporters.length > 0 && !selectedPartyName) {
        setSelectedPartyName(transporters[0]?.name || '');
      }
    }
  }, [initialPartyName, initialPartyType, partyType, clients, transporters, selectedPartyName]);

  const currentClient = useMemo(
    () => (partyType === 'CLIENT' ? clients.find(c => c.name.toLowerCase() === selectedPartyName.toLowerCase()) : null),
    [partyType, clients, selectedPartyName]
  );

  const currentTransporter = useMemo(
    () => (partyType === 'TRANSPORTER' ? transporters.find(t => t.name.toLowerCase() === selectedPartyName.toLowerCase()) : null),
    [partyType, transporters, selectedPartyName]
  );

  // Build the chronological ledger
  const { ledgerEntries, totalDebits, totalCredits, netBalance } = useMemo(() => {
    if (!selectedPartyName) {
      return { ledgerEntries: [], totalDebits: 0, totalCredits: 0, netBalance: 0 };
    }

    const entries: Omit<LedgerEntry, 'runningBalance'>[] = [];

    if (partyType === 'CLIENT') {
      // 1. Bookings for this client
      const clientBookings = bookings.filter(
        b => b.client.toLowerCase() === selectedPartyName.toLowerCase()
      );
      clientBookings.forEach(b => {
        entries.push({
          id: `BK-${b.id}`,
          date: b.pickupDate || b.createdAt.split('T')[0] || '2026-10-10',
          type: 'BOOKING_FREIGHT',
          typeLabel: 'Trip Freight',
          refNo: b.id,
          particulars: `${b.route} (${b.vehicleNo || b.vehicleType})`,
          debit: b.clientRate,
          credit: 0,
        });
      });

      // 2. Payments from this client
      const clientPayments = payments.filter(
        p => p.partyType === 'CLIENT' && p.partyName.toLowerCase() === selectedPartyName.toLowerCase()
      );
      clientPayments.forEach(p => {
        entries.push({
          id: p.id,
          date: p.date || p.createdAt.split('T')[0] || '2026-10-10',
          type: 'PAYMENT',
          typeLabel: `Payment (${p.mode})`,
          refNo: p.refNo || p.id,
          particulars: p.notes ? `Paid via ${p.mode} - ${p.notes}` : `Paid via ${p.mode}`,
          debit: 0,
          credit: p.amount,
        });
      });
    } else {
      // TRANSPORTER KHATA
      // 1. Transporter trips / bookings freight (Credit: We owe transporter)
      const trnBookings = bookings.filter(
        b => b.transporter.toLowerCase() === selectedPartyName.toLowerCase()
      );
      trnBookings.forEach(b => {
        entries.push({
          id: `BK-${b.id}`,
          date: b.pickupDate || b.createdAt.split('T')[0] || '2026-10-10',
          type: 'BOOKING_FREIGHT',
          typeLabel: 'Fleet Freight',
          refNo: b.id,
          particulars: `${b.route} (Truck: ${b.vehicleNo || 'Fleet'})`,
          debit: 0,
          credit: b.transporterRate,
        });
      });

      // 2. Payments paid out to transporter (Debit: We paid transporter)
      const trnPayments = payments.filter(
        p => p.partyType === 'TRANSPORTER' && p.partyName.toLowerCase() === selectedPartyName.toLowerCase()
      );
      trnPayments.forEach(p => {
        entries.push({
          id: p.id,
          date: p.date || p.createdAt.split('T')[0] || '2026-10-10',
          type: 'PAYMENT',
          typeLabel: `Payout (${p.mode})`,
          refNo: p.refNo || p.id,
          particulars: p.notes ? `Payout via ${p.mode} - ${p.notes}` : `Payout via ${p.mode}`,
          debit: p.amount,
          credit: 0,
        });
      });
    }

    // Sort by date ascending
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter by date range
    const now = new Date();
    const filtered = entries.filter(e => {
      const eDate = new Date(e.date);
      if (dateRange === 'ALL') return true;
      if (dateRange === 'THIS_MONTH') {
        return eDate.getFullYear() === now.getFullYear() && eDate.getMonth() === now.getMonth();
      }
      if (dateRange === 'LAST_30_DAYS') {
        const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return eDate >= past30;
      }
      if (dateRange === 'CUSTOM') {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && eDate < start) return false;
        if (end && eDate > end) return false;
        return true;
      }
      return true;
    });

    // Calculate running balance
    let currentRun = 0;
    let debitsSum = 0;
    let creditsSum = 0;

    const withBalance: LedgerEntry[] = filtered.map(e => {
      debitsSum += e.debit;
      creditsSum += e.credit;
      if (partyType === 'CLIENT') {
        currentRun += (e.debit - e.credit);
      } else {
        currentRun += (e.credit - e.debit);
      }
      return {
        ...e,
        runningBalance: currentRun,
      };
    });

    return {
      ledgerEntries: withBalance,
      totalDebits: debitsSum,
      totalCredits: creditsSum,
      netBalance: currentRun,
    };
  }, [selectedPartyName, partyType, bookings, payments, dateRange, startDate, endDate]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const filename = `Khata_Statement_${selectedPartyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    const headers = ['Date', 'Type', 'Reference No', 'Particulars', 'Debit (Rs)', 'Credit (Rs)', 'Running Balance (Rs)'];
    const rows = ledgerEntries.map(e => [
      e.date,
      e.typeLabel,
      e.refNo,
      e.particulars,
      e.debit,
      e.credit,
      e.runningBalance,
    ]);
    exportCSV(filename, headers, rows);
  };

  const statementWhatsAppText = useMemo(() => {
    const partyGst = partyType === 'CLIENT' ? currentClient?.gst : currentTransporter?.gst;
    return `*LOHAN LOGISTICS - STATEMENT OF ACCOUNT*\n` +
      `-----------------------------------------\n` +
      `*Party Name:* ${selectedPartyName}\n` +
      (partyGst ? `*GSTIN:* ${partyGst}\n` : '') +
      `*Account Type:* ${partyType === 'CLIENT' ? 'Client Khata (Receivable)' : 'Transporter Fleet Account'}\n` +
      `*Statement Date:* ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}\n` +
      `-----------------------------------------\n` +
      `*Total Billed / Freight:* ₹${totalDebits.toLocaleString('en-IN')}\n` +
      `*Total Payments Settled:* ₹${totalCredits.toLocaleString('en-IN')}\n` +
      `*CURRENT LEFTOVER BALANCE:* ₹${Math.abs(netBalance).toLocaleString('en-IN')} ${netBalance >= 0 ? (partyType === 'CLIENT' ? '(Pending Due)' : '(Payable to Transporter)') : '(Advance / Surplus)'}\n` +
      `-----------------------------------------\n` +
      `Please review and clear the outstanding balance at your earliest.\n` +
      `_Issued by LohanLogistics Operations Support_`;
  }, [selectedPartyName, partyType, totalDebits, totalCredits, netBalance, currentClient, currentTransporter]);

  const handleShareWhatsApp = () => {
    setIsWhatsAppModalOpen(true);
  };

  return (
    <>
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        recipientName={selectedPartyName}
        defaultPhone={partyType === 'CLIENT' ? currentClient?.phone : currentTransporter?.phone}
        title={`Send ${partyType === 'CLIENT' ? 'Client' : 'Transporter'} Khata Statement`}
        messageText={statementWhatsAppText}
      />

      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-[100] print:hidden transition-mechanical" onClick={onClose} />
      
      <div className="fixed inset-2 sm:inset-4 md:inset-8 lg:inset-10 bg-white rounded-lg shadow-2xl z-[100] overflow-hidden flex flex-col border border-gray-200 print:inset-0 print:border-none print:shadow-none print:static">
        
        {/* Top Header - Hidden on Print */}
        <div className="p-4 md:px-6 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 text-white rounded">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                1-Click Party Statement & Khata Ledger
              </h2>
              <p className="text-xs text-gray-500">
                Official debit/credit running ledger, PDF print statement & WhatsApp khata dispatch
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white border border-gray-300 text-gray-800 text-xs font-semibold rounded hover:bg-gray-100 transition-mechanical btn-press shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              <span className="hidden sm:inline">Print / Save PDF</span>
              <span className="sm:hidden">Print</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white border border-gray-300 text-gray-800 text-xs font-semibold rounded hover:bg-gray-100 transition-mechanical btn-press shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-gray-600" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700 transition-mechanical btn-press shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-200 transition-mechanical ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Selector Bar - Hidden on Print */}
        <div className="p-4 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            {/* Party Type Switcher */}
            <div className="inline-flex rounded-md shadow-2xs p-0.5 bg-gray-100 border border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setPartyType('CLIENT');
                  if (clients.length > 0) setSelectedPartyName(clients[0]?.name || '');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  partyType === 'CLIENT' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Client Khata
              </button>
              <button
                type="button"
                onClick={() => {
                  setPartyType('TRANSPORTER');
                  if (transporters.length > 0) setSelectedPartyName(transporters[0]?.name || '');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  partyType === 'TRANSPORTER' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Transporter Khata
              </button>
            </div>

            {/* Party Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Party:</span>
              <select
                value={selectedPartyName}
                onChange={(e) => setSelectedPartyName(e.target.value)}
                className="border border-gray-200 rounded px-2.5 py-1 text-xs font-semibold text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                {partyType === 'CLIENT' ? (
                  clients.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} (Due: ₹{c.outstanding.toLocaleString('en-IN')})
                    </option>
                  ))
                ) : (
                  transporters.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name} (Due: ₹{t.outstandingPayable.toLocaleString('en-IN')})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="border border-gray-200 rounded px-2.5 py-1 text-xs text-gray-700 bg-gray-50 focus:outline-none"
            >
              <option value="ALL">All Transactions</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="CUSTOM">Custom Date Range</option>
            </select>

            {dateRange === 'CUSTOM' && (
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-200 rounded px-2 py-1 text-xs"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-200 rounded px-2 py-1 text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Printable Statement Document */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white print:p-0 print:overflow-visible">
          
          {/* Printable Formal Header */}
          <div className="border-b-2 border-gray-900 pb-5 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-gray-900 text-white flex items-center justify-center font-black tracking-tighter text-sm">
                    LL
                  </div>
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-wider text-gray-900">LohanLogistics</h1>
                    <p className="text-[11px] text-gray-500 font-mono tracking-tight">Fleet & Transport Operations | Pan-India Logistics</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Head Office: Transport Nagar, Ring Road | Contact: +91 98765 43210
                </p>
                <p className="text-[11px] text-gray-400 font-mono">GSTIN: 27AAAAA0000A1Z5 | PAN: AAAAA0000A</p>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded">
                  Statement of Account
                </span>
                <p className="text-xs text-gray-500 mt-2">
                  Generated On: <span className="font-mono font-medium text-gray-900">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Period: <span className="font-semibold text-gray-800">{dateRange === 'ALL' ? 'Complete History' : dateRange.replace('_', ' ')}</span>
                </p>
              </div>
            </div>

            {/* Party Profile Box */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded bg-gray-50 border border-gray-200 text-xs">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statement For Party</p>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{selectedPartyName}</h3>
                {partyType === 'CLIENT' && currentClient && (
                  <div className="mt-1 text-gray-600 space-y-0.5">
                    <p>Contact Person: <span className="font-medium text-gray-900">{currentClient.contact}</span></p>
                    <p>Phone: <span className="font-mono text-gray-900">{currentClient.phone}</span></p>
                    {currentClient.gst && <p className="font-mono">GSTIN: {currentClient.gst}</p>}
                    <p>Payment Terms: <span className="font-medium">{currentClient.paymentTerms}</span></p>
                  </div>
                )}
                {partyType === 'TRANSPORTER' && currentTransporter && (
                  <div className="mt-1 text-gray-600 space-y-0.5">
                    <p>Contact Phone: <span className="font-mono text-gray-900">{currentTransporter.phone}</span></p>
                    {currentTransporter.gst && <p className="font-mono">GSTIN: <span className="font-semibold text-gray-900">{currentTransporter.gst}</span></p>}
                    {currentTransporter.pan && <p className="font-mono">PAN: <span className="font-semibold text-gray-900">{currentTransporter.pan}</span></p>}
                    {!currentTransporter.gst && !currentTransporter.pan && currentTransporter.panGst && (
                      <p className="font-mono">PAN/GST: {currentTransporter.panGst}</p>
                    )}
                    <p>Frequent Routes: <span>{currentTransporter.routes}</span></p>
                  </div>
                )}
              </div>

              {/* Financial Snapshot */}
              <div className="md:text-right flex flex-col justify-end">
                <div className="space-y-1">
                  <div className="flex md:justify-end gap-4 text-xs text-gray-600">
                    <span>Total {partyType === 'CLIENT' ? 'Billed Freight' : 'Fleet Freight'}:</span>
                    <span className="font-mono font-semibold text-gray-900">₹{totalDebits.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex md:justify-end gap-4 text-xs text-gray-600">
                    <span>Total {partyType === 'CLIENT' ? 'Payments Received' : 'Payouts Cleared'}:</span>
                    <span className="font-mono font-semibold text-emerald-700">₹{totalCredits.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex md:justify-end gap-4 pt-1.5 border-t border-gray-200 text-sm font-bold">
                    <span className="text-gray-900">Net Leftover Balance:</span>
                    <span className={`font-mono text-base ${netBalance > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                      ₹{Math.abs(netBalance).toLocaleString('en-IN')} {netBalance >= 0 ? 'Dr' : 'Cr'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile swipe hint banner */}
          <div className="md:hidden flex items-center justify-center gap-1.5 py-1 px-3 mb-3 bg-amber-50 border border-amber-200 rounded text-[11px] font-medium text-amber-800 shadow-2xs">
            <span>👉</span> Swipe ledger horizontally to view full Debits, Credits & Balance
          </div>

          {/* Ledger Table */}
          <div className="w-full overflow-x-auto touch-scroll border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs whitespace-nowrap border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b-2 border-gray-300 text-[11px] uppercase tracking-wider text-gray-600 bg-gray-50/70">
                  <th className="py-2.5 px-3 font-bold text-gray-900">Date</th>
                  <th className="py-2.5 px-3 font-bold text-gray-900">Type</th>
                  <th className="py-2.5 px-3 font-bold text-gray-900">Ref / Booking</th>
                  <th className="py-2.5 px-3 font-bold text-gray-900">Particulars / Route</th>
                  <th className="py-2.5 px-3 font-bold text-gray-900 text-right">Debit (₹)</th>
                  <th className="py-2.5 px-3 font-bold text-gray-900 text-right">Credit (₹)</th>
                  <th className="py-2.5 px-3 font-bold text-gray-900 text-right">Running Due (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ledgerEntries.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 font-mono text-gray-700">{row.date}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        row.type === 'BOOKING_FREIGHT'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : row.type === 'PAYMENT'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {row.typeLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-gray-900">{row.refNo}</td>
                    <td className="py-2.5 px-3 text-gray-800 max-w-xs truncate">{row.particulars}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-gray-900">
                      {row.debit > 0 ? `₹${row.debit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                      {row.credit > 0 ? `₹${row.credit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                      ₹{Math.abs(row.runningBalance).toLocaleString('en-IN')} {row.runningBalance >= 0 ? 'Dr' : 'Cr'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-900 bg-gray-50 font-bold text-xs">
                  <td colSpan={4} className="py-3 px-3 uppercase text-gray-900">Total Statement Summary</td>
                  <td className="py-3 px-3 text-right font-mono text-gray-900">₹{totalDebits.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-800">₹{totalCredits.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-mono text-amber-900 text-sm">
                    ₹{Math.abs(netBalance).toLocaleString('en-IN')} {netBalance >= 0 ? 'Dr' : 'Cr'}
                  </td>
                </tr>
              </tfoot>
            </table>

            {ledgerEntries.length === 0 && (
              <div className="text-center py-12 text-sm text-gray-500">
                No recorded transactions for {selectedPartyName} in selected range.
              </div>
            )}
          </div>

          {/* Legal Disclaimer & Signatures block for Formal Printing */}
          <div className="mt-12 pt-6 border-t border-gray-200 grid grid-cols-2 gap-8 text-xs text-gray-600">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Terms & Notes:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-500">
                <li>Interest @ 18% p.a. will be charged on delayed payments beyond credit period.</li>
                <li>Kindly verify this statement and report any discrepancies within 7 days.</li>
                <li>All payments must be made via Account Payee Cheque / NEFT / RTGS to LohanLogistics.</li>
              </ul>
            </div>
            <div className="text-right flex flex-col justify-end">
              <div className="w-44 ml-auto border-b border-gray-400 pb-1 mb-1"></div>
              <p className="font-bold text-gray-900">For LOHAN LOGISTICS</p>
              <p className="text-[11px] text-gray-500">Authorized Signatory / Accountant</p>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}