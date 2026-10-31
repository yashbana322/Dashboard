import { useState } from 'react';
import { Search, FileText, Upload, Printer, AlertTriangle, Eye, Trash2, Check, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Booking, DocumentRecord } from '../context/DataContext';
import NewDocumentDrawer from '../components/NewDocumentDrawer';
import BiltyModal from '../components/BiltyModal';
import DocumentPreviewModal from '../components/DocumentPreviewModal';

export default function Documents() {
  const { documents, bookings, updateDocument, deleteDocument } = useData();

  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentRecord | null>(null);
  const [biltyModalData, setBiltyModalData] = useState<{
    isOpen: boolean;
    booking: Booking | null;
  }>({
    isOpen: false,
    booking: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // KPI Calculations
  const totalDocs = documents.length;
  const verifiedPODs = documents.filter(d => d.type.includes('POD') && d.status === 'Verified').length;
  const missingDocs = documents.filter(d => d.status === 'Missing').length;
  const lrCount = documents.filter(d => d.type.includes('LR')).length;

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'All' || doc.type.includes(typeFilter);
    const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete document ${id}?`)) {
      await deleteDocument(id);
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, doc: DocumentRecord) => {
    e.stopPropagation();
    const nextStatus = doc.status === 'Verified' ? 'Pending Review' : doc.status === 'Pending Review' ? 'Missing' : 'Verified';
    await updateDocument(doc.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 pb-16">
      <NewDocumentDrawer isOpen={isNewDocOpen} onClose={() => setIsNewDocOpen(false)} />
      
      <BiltyModal
        isOpen={biltyModalData.isOpen}
        onClose={() => setBiltyModalData({ isOpen: false, booking: null })}
        booking={biltyModalData.booking}
      />

      <DocumentPreviewModal
        isOpen={Boolean(selectedDocForPreview)}
        onClose={() => setSelectedDocForPreview(null)}
        doc={selectedDocForPreview}
        onOpenBilty={() => {
          if (selectedDocForPreview) {
            const b = bookings.find(item => item.id === selectedDocForPreview.bookingId) || bookings[0] || null;
            setSelectedDocForPreview(null);
            setBiltyModalData({ isOpen: true, booking: b });
          }
        }}
      />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-gray-900" />
            Trip Documents & Bilties
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Central repository for Lorry Receipts (LR), Proof of Delivery (POD), Invoices, and E-Way Bills.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setBiltyModalData({ isOpen: true, booking: bookings[0] || null });
            }}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-900 px-4 py-2 text-sm font-semibold rounded hover:bg-gray-100 transition-mechanical btn-press shadow-2xs"
            title="Open Digital Bilty (LR) generator with booking selector"
          >
            <Printer className="w-4 h-4 text-gray-700" />
            Generate Digital Bilty (LR)
          </button>
          <button
            onClick={() => setIsNewDocOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 text-sm font-bold rounded hover:bg-black transition-mechanical btn-press shadow-xs"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Operational KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Vault Documents</span>
          <p className="text-2xl font-bold text-gray-900 mt-1 font-mono">{totalDocs}</p>
          <p className="text-xs text-gray-500 mt-0.5">Across all shipments</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">Verified PODs</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">{verifiedPODs}</p>
          <p className="text-xs text-emerald-600/80 mt-0.5">Ready for client billing</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-red-800 uppercase tracking-wider block">Missing / Disputed</span>
          <p className="text-2xl font-bold text-red-700 mt-1 font-mono">{missingDocs}</p>
          <p className="text-xs text-red-600/80 font-medium mt-0.5">Action required from driver</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">Digital LRs Generated</span>
          <p className="text-2xl font-bold text-blue-900 mt-1 font-mono">{lrCount}</p>
          <p className="text-xs text-blue-600/80 mt-0.5">Consignment notes</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-4 py-3 border-b border-gray-200">
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search document ID, booking, party..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm rounded"
          />
        </div>
        
        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-white border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 cursor-pointer focus:outline-none rounded"
        >
          <option value="All">All Types ({documents.length})</option>
          <option value="LR">Lorry Receipt (LR)</option>
          <option value="POD">Proof of Delivery (POD)</option>
          <option value="Invoice">Customer Invoice</option>
          <option value="E-Way">E-Way Bill</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 cursor-pointer focus:outline-none rounded"
        >
          <option value="All">All Statuses</option>
          <option value="Verified">Verified</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Missing">Missing / Disputed</option>
        </select>

        <span className="text-xs text-gray-400 font-mono ml-auto">
          Showing {filteredDocs.length} of {documents.length} files
        </span>
      </div>

      {/* Mobile View: Touch Document Cards (Android Optimized) */}
      <div className="sm:hidden space-y-3">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDocForPreview(doc)}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs space-y-3 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                {doc.id}
              </span>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                  doc.status === 'Verified'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : doc.status === 'Missing'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {doc.status}
              </span>
            </div>

            <div>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold mb-1 ${
                doc.type.includes('LR')
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : doc.type.includes('POD')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : doc.type.includes('Invoice')
                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {doc.type}
              </span>
              <p className="font-bold text-gray-900 text-sm">{doc.client}</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">Booking Ref: {doc.bookingId}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-400">{doc.date}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDocForPreview(doc);
                }}
                className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded hover:bg-black transition-mechanical"
              >
                Preview Document
              </button>
            </div>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
            No documents matching filters.
          </div>
        )}
      </div>

      {/* Desktop / Tablet View: Wide Documents Table */}
      <div className="hidden sm:block w-full overflow-x-auto touch-scroll">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[880px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 bg-gray-50/50">
              <th className="py-3 px-3 font-semibold text-gray-900">Document ID</th>
              <th className="py-3 px-3 font-semibold text-gray-900">Type</th>
              <th className="py-3 px-3 font-semibold text-gray-900">Booking Ref</th>
              <th className="py-3 px-3 font-semibold text-gray-900">Party</th>
              <th className="py-3 px-3 font-semibold text-gray-900">Date Added</th>
              <th className="py-3 px-3 font-semibold text-gray-900 text-center">Status</th>
              <th className="py-3 px-3 font-semibold text-gray-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDocs.map((doc) => (
              <tr 
                key={doc.id} 
                onClick={() => setSelectedDocForPreview(doc)}
                className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                    <span className="font-mono text-gray-900 font-bold">{doc.id}</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 font-medium text-gray-800">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                    doc.type.includes('LR')
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : doc.type.includes('POD')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : doc.type.includes('Invoice')
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {doc.type}
                  </span>
                </td>
                <td className="py-3.5 px-3 font-mono font-semibold text-gray-600">
                  {doc.bookingId}
                </td>
                <td className="py-3.5 px-3 font-medium text-gray-900">{doc.client}</td>
                <td className="py-3.5 px-3 text-gray-600 font-mono text-xs">{doc.date}</td>
                <td className="py-3.5 px-3 text-center" onClick={(e) => handleToggleStatus(e, doc)}>
                  <span
                    title="Click to toggle status: Verified → Pending → Missing"
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
                      doc.status === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : doc.status === 'Missing'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {doc.status === 'Verified' ? (
                      <Check className="w-3 h-3" />
                    ) : doc.status === 'Missing' ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {doc.status}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {doc.type.includes('LR') ? (
                      <button
                        onClick={() => {
                          const linkedBooking = bookings.find(b => b.id === doc.bookingId) || bookings[0] || null;
                          setBiltyModalData({ isOpen: true, booking: linkedBooking });
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-gray-900 text-white rounded hover:bg-black transition-mechanical inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Printer className="w-3 h-3" />
                        Bilty (LR)
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedDocForPreview(doc)}
                        className="px-2.5 py-1 text-xs font-semibold bg-white border border-gray-300 text-gray-800 rounded hover:bg-gray-100 transition-mechanical inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3 h-3 text-gray-600" />
                        Preview
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDelete(e, doc.id)}
                      title="Delete document from vault"
                      className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-mechanical"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDocs.length === 0 && (
          <div className="text-center py-14 text-sm text-gray-500">
            No documents found matching filters. Click "Upload Document" or "Generate Digital Bilty (LR)" to add one.
          </div>
        )}
      </div>
    </div>
  );
}