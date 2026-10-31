import { useState, useEffect } from 'react';
import { X, Check, Building2, ShieldCheck, CreditCard, AlertCircle, Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';
import { validateGSTIN, extractPanFromGst, GST_STATE_CODES } from '../utils/gstUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'CLIENT' | 'TRANSPORTER';
  entityId: string;
  entityName: string;
  currentGst?: string;
  currentPan?: string;
  onSuccess?: (newGst: string, newPan: string) => void;
}

export default function GstEditorModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  currentGst = '',
  currentPan = '',
  onSuccess,
}: Props) {
  const { updateClient, updateTransporter } = useData();

  const [gstInput, setGstInput] = useState('');
  const [panInput, setPanInput] = useState('');
  const [isUnregistered, setIsUnregistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const cleanGst = (currentGst || '').trim().toUpperCase();
      const cleanPan = (currentPan || '').trim().toUpperCase();
      setGstInput(cleanGst);
      setPanInput(cleanPan || extractPanFromGst(cleanGst));
      setIsUnregistered(cleanGst.toLowerCase() === 'unregistered');
      setSuccessMessage('');
    }
  }, [isOpen, currentGst, currentPan]);

  if (!isOpen) return null;

  const validation = validateGSTIN(gstInput);

  // Live GST typing handler: auto-extract PAN and format uppercase
  const handleGstChange = (val: string) => {
    const uppercase = val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
    setGstInput(uppercase);

    if (uppercase.length >= 12) {
      const extracted = uppercase.substring(2, 12);
      setPanInput(extracted);
    }
  };

  const handlePanChange = (val: string) => {
    const uppercase = val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 10);
    setPanInput(uppercase);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalGst = isUnregistered ? 'UNREGISTERED' : gstInput.trim().toUpperCase();
    const finalPan = panInput.trim().toUpperCase() || extractPanFromGst(finalGst);

    if (entityType === 'CLIENT') {
      await updateClient(entityId, {
        gst: finalGst,
        pan: finalPan,
      });
    } else {
      await updateTransporter(entityId, {
        gst: finalGst,
        pan: finalPan,
        panGst: finalGst || finalPan,
      });
    }

    setIsSubmitting(false);
    setSuccessMessage(`GSTIN & PAN updated successfully for ${entityName}!`);

    if (onSuccess) {
      onSuccess(finalGst, finalPan);
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const stateCode = gstInput.length >= 2 ? gstInput.substring(0, 2) : '';
  const detectedState = stateCode ? GST_STATE_CODES[stateCode] : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-[110] transition-mechanical"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 pointer-events-auto animate-in zoom-in-95 duration-200 flex flex-col">
          
          {/* Header */}
          <div className="p-5 bg-gray-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <Building2 className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight leading-tight">
                  Update GST & Tax Registration
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  {entityType === 'CLIENT' ? 'Commercial Client' : 'Fleet Transporter'}: <strong className="text-white">{entityName}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition-mechanical"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form id="gst-form" onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
            
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                {successMessage}
              </div>
            )}

            {/* Unregistered checkbox */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                id="unregistered-gst"
                checked={isUnregistered}
                onChange={(e) => setIsUnregistered(e.target.checked)}
                className="w-4 h-4 rounded text-gray-900 focus:ring-gray-900 cursor-pointer"
              />
              <label htmlFor="unregistered-gst" className="text-xs font-semibold text-gray-700 cursor-pointer">
                Party is Unregistered under GST (GTA Reverse Charge / Below Threshold)
              </label>
            </div>

            {!isUnregistered ? (
              <>
                {/* GSTIN Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      GST Identification Number (GSTIN) *
                    </label>
                    <span className="text-[11px] font-mono text-gray-400">
                      {gstInput.length} / 15 chars
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. 27AABCA1234C1Z5"
                      value={gstInput}
                      onChange={(e) => handleGstChange(e.target.value)}
                      required={!isUnregistered}
                      maxLength={15}
                      className="w-full border border-gray-300 rounded-lg p-2.5 font-mono text-sm tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 font-bold"
                    />
                    {validation.isValid && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs flex items-center gap-1">
                        <Check className="w-4 h-4" /> Valid
                      </span>
                    )}
                  </div>

                  {/* Live State & Format Intelligence */}
                  {gstInput.length > 0 && (
                    <div className="mt-2.5 p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1.5 text-xs">
                      {detectedState ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Jurisdiction State:</span>
                          <span className="font-bold text-gray-900 font-mono">
                            {detectedState} (Code {stateCode})
                          </span>
                        </div>
                      ) : stateCode.length === 2 ? (
                        <p className="text-amber-700 text-[11px] flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Unknown state code: {stateCode}
                        </p>
                      ) : null}

                      {gstInput.length === 15 && validation.isValid && (
                        <div className="flex items-center justify-between text-emerald-700 font-semibold pt-1 border-t border-gray-200/80">
                          <span className="flex items-center gap-1 text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" /> GSTIN Verified
                          </span>
                          <span className="text-[11px] font-mono">15-char Structure OK</span>
                        </div>
                      )}

                      {gstInput.length === 15 && !validation.isValid && (
                        <p className="text-red-700 text-[11px] flex items-center gap-1 pt-1 border-t border-gray-200">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {validation.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* PAN Number (Auto-extracted or Manual) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Permanent Account Number (PAN)
                    </label>
                    {gstInput.length >= 12 && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Extracted from GST
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. AABCA1234C"
                      value={panInput}
                      onChange={(e) => handlePanChange(e.target.value)}
                      maxLength={10}
                      className="w-full border border-gray-300 rounded-lg p-2.5 font-mono text-sm tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                    <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Characters 3–12 of the GSTIN represent the party's official 10-digit income tax PAN.
                  </p>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  PAN Number (Optional for Unregistered)
                </label>
                <input
                  type="text"
                  placeholder="e.g. AABCA1234C"
                  value={panInput}
                  onChange={(e) => handlePanChange(e.target.value)}
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-lg p-2.5 font-mono text-sm tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Bilty and invoices will automatically apply GTA RCM terms for this party.
                </p>
              </div>
            )}

          </form>

          {/* Footer Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-mechanical"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="gst-form"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-mechanical btn-press shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save GST Details'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}