import { useState } from 'react';
import { Search, Plus, Star, CreditCard, PlusCircle, FileSpreadsheet, ShieldCheck, Edit3 } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Transporter } from '../context/DataContext';
import NewTransporterDrawer from '../components/NewTransporterDrawer';
import RecordPaymentModal from '../components/RecordPaymentModal';
import AddLeftoverModal from '../components/AddLeftoverModal';
import PartyStatementModal from '../components/PartyStatementModal';
import GstEditorModal from '../components/GstEditorModal';

export default function Transporters() {
  const { transporters } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statementModalData, setStatementModalData] = useState<{
    isOpen: boolean;
    transporterName: string;
  }>({
    isOpen: false,
    transporterName: '',
  });
  const [leftoverModalData, setLeftoverModalData] = useState<{
    isOpen: boolean;
    transporterName: string;
  }>({
    isOpen: false,
    transporterName: '',
  });
  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    transporterName: string;
    amount: number;
  }>({
    isOpen: false,
    transporterName: '',
    amount: 0,
  });
  const [gstModalData, setGstModalData] = useState<{
    isOpen: boolean;
    transporter: Transporter | null;
  }>({
    isOpen: false,
    transporter: null,
  });

  const filtered = transporters.filter((t) => {
    return (
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.routes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.vehicles.some((v) => v.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 pb-16">
      <NewTransporterDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <RecordPaymentModal
        isOpen={paymentModalData.isOpen}
        onClose={() => setPaymentModalData(prev => ({ ...prev, isOpen: false }))}
        defaultPartyType="TRANSPORTER"
        defaultPartyName={paymentModalData.transporterName}
        defaultAmount={paymentModalData.amount}
      />

      <AddLeftoverModal
        isOpen={leftoverModalData.isOpen}
        onClose={() => setLeftoverModalData(prev => ({ ...prev, isOpen: false }))}
        defaultPartyType="TRANSPORTER"
        defaultPartyName={leftoverModalData.transporterName}
      />

      <PartyStatementModal
        isOpen={statementModalData.isOpen}
        onClose={() => setStatementModalData({ isOpen: false, transporterName: '' })}
        initialPartyType="TRANSPORTER"
        initialPartyName={statementModalData.transporterName}
      />

      <GstEditorModal
        isOpen={gstModalData.isOpen}
        onClose={() => setGstModalData({ isOpen: false, transporter: null })}
        entityType="TRANSPORTER"
        entityId={gstModalData.transporter?.id || ''}
        entityName={gstModalData.transporter?.name || ''}
        currentGst={gstModalData.transporter?.gst || gstModalData.transporter?.panGst}
        currentPan={gstModalData.transporter?.pan}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Transporters & Fleet</h1>
          <p className="text-sm text-gray-500 mt-1">Vehicle provider network, operating routes, and leftover payables.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatementModalData({ isOpen: true, transporterName: transporters[0]?.name || '' })}
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-800 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-mechanical btn-press shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-gray-600" />
            <span className="hidden sm:inline">Fleet /</span> Khata
          </button>
          <button
            onClick={() => setLeftoverModalData({ isOpen: true, transporterName: '' })}
            className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded hover:bg-amber-100 transition-mechanical btn-press shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-amber-700" />
            + Leftover
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium hover:bg-black transition-mechanical btn-press shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Transporter
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
            placeholder="Search transporter, phone, route, vehicle..."
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm rounded"
          />
        </div>
      </div>

      {/* Mobile View: Touch Transporter Cards (Android Optimized) */}
      <div className="sm:hidden space-y-3">
        {filtered.map((t) => (
          <div key={t.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-700 shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-gray-600">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {t.rating}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">{t.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm text-amber-800 font-mono block">
                  ₹{t.outstandingPayable.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-400">Leftover Payable</span>
              </div>
            </div>

            <div className="text-xs space-y-1">
              {t.gst && t.gst !== 'UNREGISTERED' ? (
                <span
                  onClick={() => setGstModalData({ isOpen: true, transporter: t })}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>GST: {t.gst}</span>
                  <Edit3 className="w-2.5 h-2.5 text-blue-600" />
                </span>
              ) : t.panGst ? (
                <span
                  onClick={() => setGstModalData({ isOpen: true, transporter: t })}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  <span>PAN/GST: {t.panGst}</span>
                  <Edit3 className="w-2.5 h-2.5 text-blue-600" />
                </span>
              ) : (
                <button
                  onClick={() => setGstModalData({ isOpen: true, transporter: t })}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded transition-colors"
                >
                  <Plus className="w-2.5 h-2.5 text-amber-700" /> + Add GST
                </button>
              )}
              <p className="text-gray-600">Routes: {t.routes}</p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {t.vehicles.map((v, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded font-medium">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-500 font-mono">Paid: ₹{t.totalPaid.toLocaleString('en-IN')}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatementModalData({ isOpen: true, transporterName: t.name })}
                  className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                  Khata
                </button>
                <button
                  onClick={() => setLeftoverModalData({ isOpen: true, transporterName: t.name })}
                  className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded hover:bg-amber-100"
                >
                  + Leftover
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
            No transporters found.
          </div>
        )}
      </div>

      {/* Desktop / Tablet View: Wide Data Table */}
      <div className="hidden sm:block w-full overflow-x-auto touch-scroll">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[860px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="py-3 font-semibold text-gray-900">Transporter</th>
              <th className="py-3 font-semibold text-gray-900">Vehicles Available</th>
              <th className="py-3 font-semibold text-gray-900">Primary Route</th>
              <th className="py-3 font-semibold text-gray-900 text-right">Total Freight</th>
              <th className="py-3 font-semibold text-emerald-800 text-right">Total Disbursed</th>
              <th className="py-3 font-semibold text-amber-800 text-right">Leftover Payable</th>
              <th className="py-3 font-semibold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{t.name}</p>
                        <span className="flex items-center gap-0.5 text-xs font-semibold text-gray-500">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {t.rating}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">{t.phone}</p>
                      {t.gst && t.gst !== 'UNREGISTERED' ? (
                        <span
                          onClick={() => setGstModalData({ isOpen: true, transporter: t })}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-600 hover:text-gray-900 cursor-pointer mt-0.5"
                          title="Click to edit GSTIN"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>GST: {t.gst}</span>
                          <Edit3 className="w-2.5 h-2.5 text-blue-600" />
                        </span>
                      ) : t.panGst ? (
                        <span
                          onClick={() => setGstModalData({ isOpen: true, transporter: t })}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-500 hover:text-gray-900 cursor-pointer mt-0.5"
                          title="Click to update full GSTIN"
                        >
                          <span>PAN/GST: {t.panGst}</span>
                          <Edit3 className="w-2.5 h-2.5 text-blue-600" />
                        </span>
                      ) : (
                        <button
                          onClick={() => setGstModalData({ isOpen: true, transporter: t })}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded transition-colors mt-0.5"
                        >
                          <Plus className="w-2.5 h-2.5 text-amber-700" /> + Add GST
                        </button>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex flex-wrap gap-1">
                    {t.vehicles.map((v, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                        {v}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 font-medium text-gray-700 text-xs">{t.routes}</td>
                <td className="py-4 font-semibold text-gray-900 text-right">₹{t.totalPayable.toLocaleString('en-IN')}</td>
                <td className="py-4 font-semibold text-emerald-700 text-right">₹{t.totalPaid.toLocaleString('en-IN')}</td>
                <td className="py-4 font-bold font-mono text-amber-800 text-right">
                  ₹{t.outstandingPayable.toLocaleString('en-IN')}
                </td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        setStatementModalData({
                          isOpen: true,
                          transporterName: t.name,
                        })
                      }
                      title="View Transporter Khata / Running Ledger"
                      className="px-2.5 py-1 bg-white text-gray-800 border border-gray-300 text-xs font-semibold rounded hover:bg-gray-100 transition-mechanical btn-press shadow-2xs inline-flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-gray-600" />
                      Khata
                    </button>
                    <button
                      onClick={() =>
                        setLeftoverModalData({
                          isOpen: true,
                          transporterName: t.name,
                        })
                      }
                      title="Add previous dues, halting or loading charges"
                      className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-medium rounded hover:bg-amber-100 transition-mechanical btn-press shadow-2xs"
                    >
                      + Leftover
                    </button>
                    <button
                      onClick={() =>
                        setPaymentModalData({
                          isOpen: true,
                          transporterName: t.name,
                          amount: t.outstandingPayable,
                        })
                      }
                      className="px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded hover:bg-black transition-mechanical btn-press shadow-2xs inline-flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Record Payout
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-500">
            No transporters found.
          </div>
        )}
      </div>
    </div>
  );
}
