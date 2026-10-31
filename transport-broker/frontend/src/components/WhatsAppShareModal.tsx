import { useState, useEffect } from 'react';
import { X, Send, Copy, Check, MessageSquare, AlertCircle, Phone, Users } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  defaultPhone?: string;
  title?: string;
  messageText: string;
}

export default function WhatsAppShareModal({
  isOpen,
  onClose,
  recipientName,
  defaultPhone = '',
  title = 'Share Statement via WhatsApp',
  messageText,
}: Props) {
  const [sendMode, setSendMode] = useState<'DIRECT' | 'PICKER'>('DIRECT');
  const [phoneInput, setPhoneInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Clean and sanitize incoming default phone
      const digitsOnly = (defaultPhone || '').replace(/[^0-9]/g, '');
      const standard10 = digitsOnly.length > 10 && digitsOnly.startsWith('91') ? digitsOnly.slice(2) : digitsOnly;
      setPhoneInput(standard10 || '');
      setCopied(false);
    }
  }, [isOpen, defaultPhone]);

  if (!isOpen) return null;

  // Detect dummy / sample placeholder numbers
  const isDummyNumber = [
    '9988776655',
    '8877665544',
    '9123456780',
    '9876543210',
    '8765432109',
    '9765432101',
    '1234567890',
  ].includes(phoneInput.trim());

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = () => {
    if (sendMode === 'PICKER') {
      // Universal WhatsApp share: opens WhatsApp contact picker with message pre-filled
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
      window.open(url, '_blank');
      onClose();
      return;
    }

    // Direct phone target
    const cleanDigits = phoneInput.replace(/[^0-9]/g, '');
    let finalPhone = cleanDigits;

    if (cleanDigits.length === 10) {
      finalPhone = `91${cleanDigits}`;
    }

    if (!finalPhone || finalPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number, or choose "Pick Contact in WhatsApp"');
      return;
    }

    const url = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-[110] transition-mechanical"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 pointer-events-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="p-5 bg-[#075e54] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <MessageSquare className="w-5 h-5 text-[#25d366]" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight leading-tight">{title}</h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Recipient: <span className="font-semibold text-white">{recipientName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-md hover:bg-white/10 transition-mechanical"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm">
            
            {/* Mode Selector Tabs */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Choose Dispatch Method
              </label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSendMode('DIRECT')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-md transition-mechanical ${
                    sendMode === 'DIRECT'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Direct to Number
                </button>
                <button
                  type="button"
                  onClick={() => setSendMode('PICKER')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-md transition-mechanical ${
                    sendMode === 'PICKER'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Pick in WhatsApp
                </button>
              </div>
            </div>

            {/* Direct Phone Input */}
            {sendMode === 'DIRECT' ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Recipient WhatsApp Number
                  </label>
                  <span className="text-[11px] text-gray-400">Indian Mobile (+91)</span>
                </div>
                <div className="relative flex rounded-md shadow-2xs border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-gray-900 focus-within:border-gray-900">
                  <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 text-xs font-mono font-semibold border-r border-gray-300">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="flex-1 px-3 py-2 text-sm font-mono text-gray-900 focus:outline-none"
                  />
                </div>

                {/* Dummy Number Notice */}
                {isDummyNumber && (
                  <div className="mt-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Demo Phone Number Detected ({phoneInput})</p>
                      <p className="text-amber-800/90 text-[11px] mt-0.5">
                        This placeholder number doesn't exist on WhatsApp in real life. Replace it with your client's real number, or switch to <strong>"Pick in WhatsApp"</strong> above to select from your WhatsApp chats.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                <p className="font-semibold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-700" />
                  Universal WhatsApp Share (Guaranteed Delivery)
                </p>
                <p className="text-blue-800/90 text-[11px] mt-1">
                  WhatsApp will open with your chat list. You can tap on any client, driver, or transport WhatsApp group to send this statement instantly—no phone number required!
                </p>
              </div>
            )}

            {/* Message Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Formatted Message Preview
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs text-gray-600 hover:text-black font-semibold flex items-center gap-1 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-[#e5ddd5]/30 border border-[#c1b5a5]/40 rounded-lg p-3.5 font-mono text-xs text-gray-800 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed shadow-inner">
                {messageText}
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-mechanical btn-press shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Message'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-mechanical"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#25d366] hover:bg-[#1ebd5a] text-black font-bold text-xs rounded-md transition-mechanical btn-press shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                {sendMode === 'PICKER' ? 'Open WhatsApp Chats' : 'Send to Number'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}