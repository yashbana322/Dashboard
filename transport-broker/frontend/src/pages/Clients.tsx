import { useState } from 'react';
import { Plus, Search, CreditCard, PlusCircle, FileSpreadsheet, Building2, Eye, ShieldCheck, Edit3 } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Client } from '../context/DataContext';
import NewClientDrawer from '../components/NewClientDrawer';
import RecordPaymentModal from '../components/RecordPaymentModal';
import AddLeftoverModal from '../components/AddLeftoverModal';
import PartyStatementModal from '../components/PartyStatementModal';
import ClientDetailDrawer from '../components/ClientDetailDrawer';
import GstEditorModal from '../components/GstEditorModal';

export default function Clients() {
  const { clients } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedClientForDossier, setSelectedClientForDossier] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statementModalData, setStatementModalData] = useState<{
    isOpen: boolean;
    clientName: string;
  }>({
    isOpen: false,
    clientName: '',
  });
  const [leftoverModalData, setLeftoverModalData] = useState<{
    isOpen: boolean;
    clientName: string;
  }>({
    isOpen: false,
    clientName: '',
  });
  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    clientName: string;
    amount: number;
  }>({
    isOpen: false,
    clientName: '',
    amount: 0,
  });
  const [gstModalData, setGstModalData] = useState<{
    isOpen: boolean;
    client: Client | null;
  }>({
    isOpen: false,
    client: null,
  });

  const totalBilledAll = clients.reduce((acc, c) => acc + (c.totalBilled || 0), 0);
  const totalPaidAll = clients.reduce((acc, c) => acc + (c.totalPaid || 0), 0);
  const totalLeftoverAll = clients.reduce((acc, c) => acc + (c.outstanding || 0), 0);

  const filteredClients = clients.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.routes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.gst && c.gst.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 pb-16">
      <NewClientDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <ClientDetailDrawer
        isOpen={Boolean(selectedClientForDossier)}
        onClose={() => setSelectedClientForDossier(null)}
        client={selectedClientForDossier}
      />

      <RecordPaymentModal
        isOpen={paymentModalData.isOpen}
        onClose={() => setPaymentModalData(prev => ({ ...prev, isOpen: false }))}
        defaultPartyType="CLIENT"
        defaultPartyName={paymentModalData.clientName}
        defaultAmount={paymentModalData.amount}
      />

      <AddLeftoverModal
        isOpen={leftoverModalData.isOpen}
        onClose={() => setLeftoverModalData(prev => ({ ...prev, isOpen: false }))}
        defaultPartyType="CLIENT"
        defaultPartyName={leftoverModalData.clientName}
      />

      <PartyStatementModal
        isOpen={statementModalData.isOpen}
        onClose={() => setStatementModalData({ isOpen: false, clientName: '' })}
        initialPartyType="CLIENT"
        initialPartyName={statementModalData.clientName}
      />

      <GstEditorModal
        isOpen={gstModalData.isOpen}
        onClose={() => setGstModalData({ isOpen: false, client: null })}
        entityType="CLIENT"
        entityId={gstModalData.client?.id || ''}
        entityName={gstModalData.client?.name || ''}
        currentGst={gstModalData.client?.gst}
        currentPan={gstModalData.client?.pan}
      />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-gray-900" />
            Parties & Commercial Clients
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Commercial client directory, 360° party profiles, trip ledger, credit limits & leftover balances.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatementModalData({ isOpen: true, clientName: clients[0]?.name || '' })}
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-800 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded hover:bg-gray-100 transition-mechanical btn-press shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-gray-600" />
            <span className="hidden sm:inline">Party Ledger /</span> Khata
          </button>
          <button
            onClick={() => setLeftoverModalData({ isOpen: true, clientName: '' })}
            className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded hover:bg-amber-100 transition-mechanical btn-press shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-amber-700" />
            + Leftover
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded hover:bg-black transition-mechanical btn-press shadow-xs"
          >
            <Plus className="w-4 h-4" />
            + New Party
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 bg-white border border-gray-200 rounded-lg p-4 sm:p-5 shadow-xs">
        <div>
          <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Active Parties</span>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 font-mono">{clients.length}</p>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Corporate accounts</p>
        </div>
        <div>
          <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Freight Billed</span>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 font-mono">₹{totalBilledAll.toLocaleString('en-IN')}</p>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Across all client trips</p>
        </div>
        <div>
          <span className="text-[10px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-wider block">Total Payments Received</span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 font-mono">₹{totalPaidAll.toLocaleString('en-IN')}</p>
          <p className="text-[11px] sm:text-xs text-emerald-600/80 mt-0.5">Deposited to bank</p>
        </div>
        <div>
          <span className="text-[10px] sm:text-xs font-semibold text-amber-800 uppercase tracking-wider block">Total Leftovers Pending</span>
          <p className="text-xl sm:text-2xl font-black text-amber-900 mt-1 font-mono">₹{totalLeftoverAll.toLocaleString('en-IN')}</p>
          <p className="text-[11px] sm:text-xs text-amber-800/80 font-semibold mt-0.5">Receivable from parties</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center gap-3 py-3 border-b border-gray-200">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search party name, contact, GSTIN, route..."
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm rounded"
          />
        </div>
        <span className="text-xs text-gray-400 font-mono ml-auto">
          Showing {filteredClients.length} of {clients.length} parties
        </span>
      </div>

      {/* Mobile View: Touch Client Cards (Android Optimized) */}
      <div className="sm:hidden space-y-3">
        {filteredClients.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedClientForDossier(c)}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-3 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded bg-gray-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{c.phone}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xs font-bold font-mono block ${
                  c.outstanding > 0 ? 'text-amber-800' : 'text-emerald-700'
                }`}>
                  {c.outstanding > 0 ? `₹${c.outstanding.toLocaleString('en-IN')}` : 'Settled'}
                </span>
                <span className="text-[10px] text-gray-400">
                  {c.outstanding > 0 ? 'Pending Leftover' : 'Zero Balance'}
                </span>
              </div>
            </div>

            <div className="text-xs space-y-1">
              {c.gst && c.gst !== 'UNREGISTERED' ? (
                <div className="flex items-center gap-1 font-mono text-[11px] text-gray-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">GST: {c.gst}</span>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGstModalData({ isOpen: true, client: c });
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded"
                >
                  <Plus className="w-2.5 h-2.5" /> Add GSTIN
                </button>
              )}
              <p className="text-gray-600 truncate">Routes: {c.routes || 'All India'}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
              <span className="text-[11px] text-gray-400">Terms: {c.paymentTerms}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatementModalData({ isOpen: true, clientName: c.name })}
                  className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                  Khata
                </button>
                <button
                  onClick={() => setLeftoverModalData({ isOpen: true, clientName: c.name })}
                  className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded hover:bg-amber-100"
                >
                  + Leftover
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
            No parties matching search.
          </div>
        )}
      </div>

      {/* Desktop / Tablet View: Wide Parties Table */}
      <div className="hidden sm:block w-full overflow-x-auto touch-scroll">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[920px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 bg-gray-50/50">
              <th className="py-3 px-3 font-semibold text-gray-900">Party / Company</th>
              <th className="py-3 px-3 font-semibold text-gray-900">Contact & Phone</th>
              <th className="py-3 px-3 font-semibold text-gray-900">Partner Since</th>
              <th className="py-3 px-3 font-semibold text-gray-900">Key Routes</th>
              <th className="py-3 px-3 font-semibold text-gray-900 text-right">Total Billed</th>
              <th className="py-3 px-3 font-semibold text-emerald-800 text-right">Cleared</th>
              <th className="py-3 px-3 font-semibold text-amber-800 text-right">Leftover Due</th>
              <th className="py-3 px-3 font-semibold text-gray-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClients.map((c) => (
              <tr
                key={c.id}
                onClick={() => setSelectedClientForDossier(c)}
                className="hover:bg-gray-50/80 transition-mechanical cursor-pointer group"
              >
                <td className="py-4 px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center font-bold text-sm shrink-0 border border-gray-200 group-hover:bg-gray-900 group-hover:text-white transition-mechanical">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-blue-900 transition-colors flex items-center gap-1.5">
                        {c.name}
                      </p>
                      {c.gst && c.gst !== 'UNREGISTERED' ? (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setGstModalData({ isOpen: true, client: c });
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-500 hover:text-gray-900 group/gst cursor-pointer"
                          title="Click to edit or update GST"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>GST: {c.gst}</span>
                          <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover/gst:opacity-100 transition-opacity text-blue-600" />
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGstModalData({ isOpen: true, client: c });
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded transition-colors"
                          title="Add official 15-digit GSTIN for billing"
                        >
                          <Plus className="w-2.5 h-2.5 text-amber-700" /> + Add GST
                        </button>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-3">
                  <p className="font-medium text-gray-900">{c.contact}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">{c.phone}</p>
                </td>
                <td className="py-4 px-3 font-mono text-xs text-gray-600">
                  {c.joinDate || '2025-04-12'}
                </td>
                <td className="py-4 px-3 text-gray-600 text-xs max-w-xs truncate">
                  {c.routes || 'Across India'}
                </td>
                <td className="py-4 px-3 font-semibold text-gray-900 text-right font-mono">
                  ₹{c.totalBilled.toLocaleString('en-IN')}
                </td>
                <td className="py-4 px-3 font-semibold text-emerald-700 text-right font-mono">
                  ₹{c.totalPaid.toLocaleString('en-IN')}
                </td>
                <td className="py-4 px-3 font-bold font-mono text-amber-900 text-right">
                  <span className={`inline-block px-2 py-0.5 rounded ${c.outstanding > 0 ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'text-gray-400'}`}>
                    ₹{c.outstanding.toLocaleString('en-IN')}
                  </span>
                </td>
                <td className="py-4 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setSelectedClientForDossier(c)}
                      title="View Complete 360° Party Profile & Trips"
                      className="px-2.5 py-1 bg-gray-900 text-white text-xs font-semibold rounded hover:bg-black transition-mechanical btn-press shadow-2xs inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Profile
                    </button>
                    <button
                      onClick={() =>
                        setStatementModalData({
                          isOpen: true,
                          clientName: c.name,
                        })
                      }
                      title="View Khata / Statement of Account"
                      className="px-2 py-1 bg-white text-gray-800 border border-gray-300 text-xs font-semibold rounded hover:bg-gray-100 transition-mechanical btn-press shadow-2xs inline-flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-gray-600" />
                      Khata
                    </button>
                    <button
                      onClick={() =>
                        setLeftoverModalData({
                          isOpen: true,
                          clientName: c.name,
                        })
                      }
                      title="Add past dues, halting or loading charges"
                      className="px-2 py-1 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-medium rounded hover:bg-amber-100 transition-mechanical btn-press shadow-2xs"
                    >
                      + Leftover
                    </button>
                    <button
                      onClick={() =>
                        setPaymentModalData({
                          isOpen: true,
                          clientName: c.name,
                          amount: c.outstanding,
                        })
                      }
                      className="px-2.5 py-1 bg-white border border-gray-300 text-gray-800 text-xs font-medium rounded hover:bg-gray-100 transition-mechanical btn-press shadow-2xs inline-flex items-center gap-1"
                    >
                      <CreditCard className="w-3 h-3" />
                      Pay
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
          <div className="text-center py-14 text-sm text-gray-500">
            No commercial parties found matching your search. Click "+ Add New Party / Client" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
