import { useState } from 'react';
import { X, Printer, Trash2, CheckCircle2, FileText, Check } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { DocumentRecord } from '../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  doc: DocumentRecord | null;
  onOpenBilty?: () => void;
}

export default function DocumentPreviewModal({ isOpen, onClose, doc, onOpenBilty }: Props) {
  const { updateDocument, deleteDocument, bookings, clients } = useData();
  const [isDeleting, setIsDeleting] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);

  if (!isOpen || !doc) return null;

  const linkedBooking = bookings.find(b => b.id === doc.bookingId);
  const clientObj = clients.find(c => c.name.toLowerCase() === doc.client.toLowerCase());

  const handleStatusChange = async (newStatus: 'Verified' | 'Pending Review' | 'Missing') => {
    await updateDocument(doc.id, { status: newStatus });
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 2000);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to permanently delete document ${doc.id}?`)) {
      setIsDeleting(true);
      await deleteDocument(doc.id);
      setIsDeleting(false);
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-[100] print:hidden transition-mechanical" onClick={onClose} />

      <div className="fixed inset-2 sm:inset-6 md:inset-10 lg:inset-14 bg-white rounded-lg shadow-2xl z-[100] overflow-hidden flex flex-col border border-gray-200 print:inset-0 print:border-none print:shadow-none print:static">
        
        {/* Top Control Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 text-white rounded">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 tracking-tight">
                  {doc.id}
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-800">
                  {doc.type}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  doc.status === 'Verified'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : doc.status === 'Missing'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {doc.status}
                </span>
                {justUpdated && (
                  <span className="text-xs text-emerald-600 font-semibold animate-in fade-in flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Updated
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Party: <span className="font-semibold text-gray-700">{doc.client}</span> • Booking Ref: <span className="font-mono text-gray-700">{doc.bookingId}</span> • Added: {doc.date}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Quick Switcher */}
            <div className="inline-flex rounded-md p-0.5 bg-gray-200 border border-gray-300 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleStatusChange('Verified')}
                className={`px-2.5 py-1 rounded transition-mechanical ${
                  doc.status === 'Verified' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Verified
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('Pending Review')}
                className={`px-2.5 py-1 rounded transition-mechanical ${
                  doc.status === 'Pending Review' ? 'bg-amber-500 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('Missing')}
                className={`px-2.5 py-1 rounded transition-mechanical ${
                  doc.status === 'Missing' ? 'bg-red-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Missing
              </button>
            </div>

            {doc.type.includes('LR') && onOpenBilty && (
              <button
                onClick={onOpenBilty}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-mechanical btn-press shadow-2xs"
              >
                Open in Bilty Generator
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-800 text-xs font-semibold rounded hover:bg-gray-100 transition-mechanical btn-press shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              Print / Save
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold rounded hover:bg-red-100 transition-mechanical btn-press shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>

            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-200 transition-mechanical ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100/60 print:bg-white print:p-0">
          <div className="max-w-3xl mx-auto bg-white border border-gray-300 shadow-sm rounded-lg p-8 print:border-none print:shadow-none">
            
            {/* Header / Document Identity */}
            <div className="flex items-start justify-between border-b-2 border-gray-900 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gray-900 text-white font-bold flex items-center justify-center text-xs">
                    LL
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">LohanLogistics</h3>
                    <p className="text-[10px] text-gray-500 font-medium">Pan-India Heavy Commercial Fleet Operations</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-mono mt-1">
                  GSTIN: <span className="font-semibold text-gray-700">27AAAAA0000A1Z5</span> | PAN: <span className="font-semibold text-gray-700">AAAAA0000A</span>
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-gray-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                  {doc.type}
                </span>
                <p className="font-mono text-xs text-gray-500 mt-1 font-semibold">{doc.id}</p>
                <p className="text-xs text-gray-500">Date: {doc.date}</p>
              </div>
            </div>

            {/* Document Details Grid */}
            <div className="grid grid-cols-2 gap-6 my-6 text-xs">
              <div className="space-y-1.5 bg-gray-50 p-4 rounded border border-gray-200">
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px] block">Consignment Information</span>
                <p className="text-gray-900 font-bold text-sm">{doc.client}</p>
                {clientObj?.gst && (
                  <p className="text-gray-600 font-mono text-[11px]">
                    GSTIN: <span className="font-bold text-gray-900 bg-white px-1.5 py-0.5 rounded border border-gray-200">{clientObj.gst}</span>
                  </p>
                )}
                {clientObj?.pan && !clientObj.gst && (
                  <p className="text-gray-600 font-mono text-[11px]">
                    PAN: <span className="font-bold text-gray-900">{clientObj.pan}</span>
                  </p>
                )}
                <p className="text-gray-600">Booking Reference: <span className="font-mono font-bold text-gray-900">{doc.bookingId}</span></p>
                {linkedBooking && (
                  <>
                    <p className="text-gray-600">Route: <span className="font-semibold text-gray-900">{linkedBooking.route}</span></p>
                    <p className="text-gray-600">Vehicle: <span className="font-mono font-semibold text-gray-900">{linkedBooking.vehicleNo}</span> ({linkedBooking.vehicleType})</p>
                  </>
                )}
              </div>

              <div className="space-y-1.5 bg-gray-50 p-4 rounded border border-gray-200">
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px] block">Verification & Compliance</span>
                <p className="text-gray-600">Current Status: 
                  <span className={`ml-1 font-bold ${
                    doc.status === 'Verified' ? 'text-emerald-700' : doc.status === 'Missing' ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    {doc.status}
                  </span>
                </p>
                <p className="text-gray-600">Digital Archive ID: <span className="font-mono text-gray-800">{doc.fileUrl || `${doc.id}.pdf`}</span></p>
                <p className="text-gray-600">Auditor: <span className="font-medium text-gray-900">Operations Control Room</span></p>
              </div>
            </div>

            {/* Document Specific Preview Canvas */}
            {doc.type.includes('POD') ? (
              <div className="border border-dashed border-gray-300 rounded p-6 bg-gray-50/50 my-6">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Proof of Delivery (POD) Receiving Acknowledgement
                </h4>
                <div className="bg-white p-4 rounded border border-gray-200 space-y-3 text-xs">
                  <p className="text-gray-700">
                    Received the consignment materials specified under Booking Ref <span className="font-mono font-bold">{doc.bookingId}</span> in apparent good order and condition without shortage or physical damage.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Unloading Warehouse / Depot</span>
                      <p className="font-semibold text-gray-900">{doc.client} Receiving Bay #3</p>
                      <p className="text-gray-500 text-[11px]">Unloaded on: {doc.date} at 16:30 hrs</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Consignee Receiving Seal & Signature</span>
                      <div className="inline-block border-2 border-emerald-700 rounded p-2 text-emerald-800 font-bold uppercase text-[10px] tracking-wider mt-1 rotate-1">
                        ✓ VERIFIED & RECEIVED GOODS
                        <div className="text-[9px] font-normal text-emerald-700 font-mono">STAMP NO: REC-88392</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : doc.type.includes('Invoice') ? (
              <div className="border border-gray-200 rounded p-6 bg-white my-6 text-xs">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
                  Tax Invoice Particulars (SAC: 996511 - Goods Transport Agency)
                </h4>
                <table className="w-full text-left text-xs mb-4">
                  <thead>
                    <tr className="border-b border-gray-300 text-gray-500 uppercase text-[10px]">
                      <th className="py-2">Description of Supply</th>
                      <th className="py-2 text-center">HSN/SAC</th>
                      <th className="py-2 text-right">Freight Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 font-semibold text-gray-800">
                        Freight Transportation Charges ({linkedBooking?.route || 'Interstate Transport'})
                      </td>
                      <td className="py-3 text-center font-mono">996511</td>
                      <td className="py-3 text-right font-mono font-bold">
                        ₹{(linkedBooking?.clientRate || 48000).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded font-bold">
                  <span>Total Taxable Invoice Amount</span>
                  <span className="text-sm font-mono font-black text-gray-900">
                    ₹{(linkedBooking?.clientRate || 48000).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : doc.type.includes('E-Way') ? (
              <div className="border border-gray-300 rounded p-6 bg-amber-50/20 my-6 text-xs font-mono">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-3 font-sans flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  E-Way Bill System Details (Govt of India)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 border border-gray-200 rounded">
                  <div>
                    <span className="text-gray-400 block text-[10px]">E-WAY BILL NO</span>
                    <span className="font-bold text-gray-900 text-sm">8419 2049 1829</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">GENERATED DATE</span>
                    <span className="text-gray-800 font-semibold">{doc.date} 09:15 AM</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">PART-B VEHICLE NO</span>
                    <span className="font-bold text-gray-900">{linkedBooking?.vehicleNo || 'MH 12 AB 1234'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">VALIDITY</span>
                    <span className="text-emerald-700 font-bold">Active / Valid till Delivery</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded p-6 bg-gray-50 my-6 text-center text-xs">
                <p className="text-gray-600 mb-2">Digital Lorry Receipt (LR) archive registered with LohanLogistics booking system.</p>
                {onOpenBilty && (
                  <button
                    onClick={onOpenBilty}
                    className="px-4 py-2 bg-gray-900 text-white font-semibold rounded hover:bg-black transition-mechanical btn-press"
                  >
                    Open Full Printable Lorry Receipt (LR)
                  </button>
                )}
              </div>
            )}

            {/* Footer Signatures */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-end text-[11px] text-gray-500">
              <div>
                <p className="font-bold text-gray-800">LOHAN LOGISTICS PVT LTD</p>
                <p>Digital Document Archive & Verification Desk</p>
              </div>
              <div className="text-right">
                <div className="font-mono text-emerald-800 font-bold">DIGITALLY VERIFIED DOCUMENT</div>
                <p className="text-[10px]">Generated electronically from LohanLogistics ERP</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}