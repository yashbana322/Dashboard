import { useState, useEffect } from 'react';
import { X, UploadCloud, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultBookingId?: string;
}

export default function NewDocumentDrawer({ isOpen, onClose, defaultBookingId = '' }: Props) {
  const { bookings, addDocument } = useData();

  const [bookingId, setBookingId] = useState(defaultBookingId || '');
  const [customClient, setCustomClient] = useState('');
  const [docType, setDocType] = useState<'Lorry Receipt (LR)' | 'Invoice' | 'Proof of Delivery (POD)' | 'E-Way Bill'>('Lorry Receipt (LR)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Verified' | 'Pending Review' | 'Missing'>('Verified');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (defaultBookingId) {
        setBookingId(defaultBookingId);
      } else if (bookings.length > 0 && !bookingId) {
        setBookingId(bookings[0]?.id || '');
      }
    }
  }, [isOpen, defaultBookingId, bookings]);

  if (!isOpen) return null;

  const targetBooking = bookings.find(b => b.id === bookingId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const clientName = targetBooking ? targetBooking.client : customClient || 'Direct Party';

    await addDocument({
      bookingId: bookingId || 'DIRECT',
      type: docType,
      client: clientName,
      date: date || new Date().toISOString().split('T')[0],
      status,
      fileUrl: fileName || `${docType.split(' ')[0]}-${Date.now().toString().slice(-4)}.pdf`,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-[80] transition-mechanical" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-white shadow-2xl z-[80] overflow-y-auto animate-in slide-in-from-right-8 duration-300 border-l border-gray-200 flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/70 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gray-900 text-white rounded-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Upload Trip Document</h2>
              <p className="text-xs text-gray-500">Attach LR, POD, Invoice or E-Way Bill to archive</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-mechanical">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="doc-form" onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Select Booking Reference
            </label>
            <select
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full border border-gray-200 rounded-md p-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono"
            >
              <option value="">-- General / Direct Document (No Booking) --</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.client} ({b.route})
                </option>
              ))}
            </select>
          </div>

          {!bookingId && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Party / Client Name *
              </label>
              <input
                type="text"
                placeholder="e.g. ABC Industries Ltd"
                value={customClient}
                onChange={(e) => setCustomClient(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Document Type *
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full border border-gray-200 rounded-md p-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            >
              <option value="Lorry Receipt (LR)">Lorry Receipt (LR)</option>
              <option value="Proof of Delivery (POD)">Proof of Delivery (POD)</option>
              <option value="Invoice">Customer Invoice</option>
              <option value="E-Way Bill">E-Way Bill</option>
            </select>
          </div>

          {/* Drag & Drop simulated area */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Attach File (PDF, JPG, PNG)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 bg-gray-50 cursor-pointer">
              <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Click to upload document or snap photo</p>
              <p className="text-xs text-gray-500 mt-1">Accepts LR scans, POD camera photos up to 10MB</p>
              <input
                type="file"
                className="hidden"
                id="doc-upload"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileName(e.target.files[0].name);
                  }
                }}
              />
              <label htmlFor="doc-upload" className="inline-block mt-3 px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium rounded shadow-xs cursor-pointer hover:bg-gray-50">
                Browse Files
              </label>
              {fileName && (
                <p className="mt-2 text-xs font-mono font-medium text-emerald-700">Selected: {fileName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Date Added
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Verification Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full border border-gray-200 rounded-md p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              >
                <option value="Verified">Verified</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Missing">Missing / Disputed</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50/70 sticky bottom-0 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-mechanical btn-press"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="doc-form"
            disabled={isSubmitting}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-black rounded-md transition-mechanical btn-press disabled:opacity-50"
          >
            {isSubmitting ? 'Uploading...' : 'Save Document'}
          </button>
        </div>

      </div>
    </>
  );
}