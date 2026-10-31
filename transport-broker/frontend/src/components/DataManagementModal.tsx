import { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  RotateCcw, 
  Download, 
  Upload, 
  Laptop, 
  Wifi, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Database,
  Building2,
  Globe,
  Settings2
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  operatorName: string;
  onUpdateOperatorName: (name: string) => void;
}

export default function DataManagementModal({ isOpen, onClose, operatorName, onUpdateOperatorName }: Props) {
  const { 
    bookings, 
    trips, 
    clients, 
    transporters, 
    payments, 
    leftovers, 
    clearData, 
    resetDemoData, 
    exportBackup, 
    restoreBackup 
  } = useData();

  const [activeTab, setActiveTab] = useState<'CLEAR' | 'BACKUP' | 'NETWORK' | 'PROFILE'>('CLEAR');
  const [confirmInput, setConfirmInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [localIp, setLocalIp] = useState(window.location.hostname);
  const [editOperatorName, setEditOperatorName] = useState(operatorName);

  useEffect(() => {
    setEditOperatorName(operatorName);
  }, [operatorName]);

  useEffect(() => {
    // If hostname is localhost or 127.0.0.1, try to discover local IP or show guide
    setLocalIp(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '192.168.1.X' : window.location.hostname);
  }, []);

  if (!isOpen) return null;

  const totalRecords = bookings.length + trips.length + clients.length + transporters.length + payments.length + (leftovers?.length || 0);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setSuccessMessage('');
    } else {
      setSuccessMessage(msg);
      setErrorMessage('');
    }
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 4000);
  };

  const handleClearAll = async () => {
    if (confirmInput.trim().toUpperCase() !== 'CLEAR') {
      showNotification('Please type "CLEAR" in the confirmation box below.', true);
      return;
    }

    try {
      setIsProcessing(true);
      await clearData('all');
      setConfirmInput('');
      showNotification('All test records, bookings, clients, and transporters have been completely cleared.');
    } catch {
      showNotification('Failed to clear data from server. Please check backend connection.', true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearTransactionsOnly = async () => {
    try {
      setIsProcessing(true);
      await clearData('transactions_only');
      showNotification('Cleared all trips, bookings, and payments. Saved Client & Transporter directories were preserved with 0 balance.');
    } catch {
      showNotification('Failed to clear transaction records.', true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      setIsProcessing(true);
      await resetDemoData();
      showNotification('Default sample transport brokerage demo records successfully restored.');
    } catch {
      showNotification('Failed to reset demo records.', true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setIsProcessing(true);
        await restoreBackup(json);
        showNotification('Backup successfully restored into LohanLogistics database.');
      } catch {
        showNotification('Invalid JSON backup file. Please select a valid LohanLogistics export.', true);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopyNetworkUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSaveOperatorProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOperatorName.trim()) return;
    onUpdateOperatorName(editOperatorName.trim());
    showNotification('Operator profile name updated successfully.');
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-[100] transition-mechanical" onClick={onClose} />
      
      <div className="fixed inset-2 sm:inset-6 md:inset-12 lg:inset-20 max-w-4xl mx-auto bg-white rounded-lg shadow-2xl z-[100] overflow-hidden flex flex-col border border-gray-200">
        
        {/* Header */}
        <div className="p-4 md:p-6 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 text-white rounded border border-gray-700">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                System & Data Management
              </h2>
              <p className="text-xs text-gray-400">
                Wipe test data for fresh business start, backup database, or access across multiple PCs
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-mechanical"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('CLEAR')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-mechanical ${
              activeTab === 'CLEAR'
                ? 'border-red-600 text-red-600 bg-white shadow-2xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Clear Test Data
          </button>
          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-mechanical ${
              activeTab === 'BACKUP'
                ? 'border-gray-900 text-gray-900 bg-white shadow-2xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Download className="w-4 h-4" />
            Backup & Restore
          </button>
          <button
            onClick={() => setActiveTab('NETWORK')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-mechanical ${
              activeTab === 'NETWORK'
                ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Use on Another PC
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-mechanical ${
              activeTab === 'PROFILE'
                ? 'border-gray-900 text-gray-900 bg-white shadow-2xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            Operator Settings
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-6 py-2.5 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 text-red-800 px-6 py-2.5 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">

          {/* TAB 1: CLEAR TEST DATA */}
          {activeTab === 'CLEAR' && (
            <div className="space-y-6">
              
              {/* Summary Stats Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Bookings</span>
                  <span className="text-base font-bold font-mono text-gray-900">{bookings.length}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Clients</span>
                  <span className="text-base font-bold font-mono text-gray-900">{clients.length}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Transporters</span>
                  <span className="text-base font-bold font-mono text-gray-900">{transporters.length}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Payments / Khata</span>
                  <span className="text-base font-bold font-mono text-gray-900">{payments.length}</span>
                </div>
              </div>

              {/* CARD 1: COMPLETE WIPE (FRESH START) */}
              <div className="border-2 border-red-200 rounded-lg p-5 bg-red-50/20 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 text-red-700 rounded-md">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-950">Option A: Complete Fresh Start (Wipe Everything)</h3>
                    <p className="text-xs text-red-800/80 mt-1">
                      Permanently wipes all demo bookings, trips, dummy clients (ABC Industries, Tata Steel, etc.), transporters (XYZ Transport), payments, bilties, and leftovers.
                      This gives you a completely clean, 0-record database ready for your real daily business.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-red-200 space-y-3 text-xs">
                  <p className="text-gray-700 font-medium">
                    To prevent accidental deletion of records, please type <strong className="text-red-700 font-mono">CLEAR</strong> to confirm:
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Type CLEAR here"
                      value={confirmInput}
                      onChange={(e) => setConfirmInput(e.target.value)}
                      className="border border-red-300 rounded px-3 py-2 font-mono uppercase text-sm w-48 focus:outline-none focus:ring-1 focus:ring-red-600 bg-red-50/30"
                    />
                    <button
                      disabled={confirmInput.trim().toUpperCase() !== 'CLEAR' || isProcessing}
                      onClick={handleClearAll}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs transition-mechanical btn-press disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {isProcessing ? 'Wiping Data...' : 'Wipe All Test Data Now'}
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 2: SELECTIVE CLEAR */}
              <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/50 space-y-3">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  Option B: Clear Trips & Bookings Only (Keep Your Parties)
                </h3>
                <p className="text-xs text-gray-600">
                  If you have already entered your actual clients and transporters and only want to clear dummy trips, test bookings, and test payments, use this option. It resets all client & transporter balances to ₹0 without deleting their company contact details.
                </p>
                <button
                  disabled={isProcessing}
                  onClick={handleClearTransactionsOnly}
                  className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold text-xs rounded transition-mechanical btn-press shadow-2xs flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                  Clear Only Trips & Financials (Preserve Parties)
                </button>
              </div>

              {/* CARD 3: RESTORE DEMO DATA */}
              <div className="border border-gray-200 rounded-lg p-5 bg-blue-50/20 space-y-3">
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-700" />
                  Option C: Restore Demo Test Dataset
                </h3>
                <p className="text-xs text-gray-600">
                  Reloads standard demo bookings, routes (Pune ↔ Delhi, Mumbai ↔ Bangalore), sample clients, and truck records. Useful if you ever want to test new features or explore reports again.
                </p>
                <button
                  disabled={isProcessing}
                  onClick={handleResetDemo}
                  className="px-3.5 py-2 bg-white border border-blue-300 hover:bg-blue-50 text-blue-800 font-semibold text-xs rounded transition-mechanical btn-press shadow-2xs flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-700" />
                  Reload Default Demo Records
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: BACKUP & RESTORE */}
          {activeTab === 'BACKUP' && (
            <div className="space-y-6">
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-900 text-white rounded">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Download Complete JSON Backup</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Exports all {totalRecords} records (bookings, trips, client khatas, transporters, leftovers, and bilties) into a single standalone JSON file on your computer.
                    </p>
                  </div>
                </div>
                <button
                  onClick={exportBackup}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-semibold rounded text-xs transition-mechanical btn-press shadow-xs flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Backup File (.json)
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-700 text-white rounded">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Restore / Move Data to Another PC</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Upload a previously exported backup file to restore your entire database. This is also how you can easily copy your records from one PC to another offline!
                    </p>
                  </div>
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold rounded text-xs transition-mechanical btn-press shadow-2xs cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-gray-600" />
                    Select Backup File to Restore
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: USE ON ANOTHER PC (NETWORK & WEB) */}
          {activeTab === 'NETWORK' && (
            <div className="space-y-6">
              
              {/* Method 1: Local Network (Wi-Fi) */}
              <div className="border border-emerald-200 bg-emerald-50/20 rounded-lg p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-700 text-white rounded">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded">
                      Fastest & Free (No Internet Required)
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 mt-1">Method 1: Connect from Another PC on Same Wi-Fi</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      If your second PC, laptop, or phone is connected to the same office Wi-Fi or router, you can open the app right now without any hosting!
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-emerald-200 space-y-3 text-xs">
                  <p className="font-semibold text-gray-800">
                    Step 1: On this host PC, find your local IP address:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-2.5 rounded font-mono text-[11px] flex justify-between items-center">
                    <span>ipconfig &nbsp;&nbsp;(look for IPv4 Address, e.g. 192.168.1.15)</span>
                    <button
                      onClick={() => handleCopyNetworkUrl('ipconfig')}
                      className="text-gray-400 hover:text-white"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="font-semibold text-gray-800 pt-1">
                    Step 2: On your OTHER PC or phone, open your browser and enter:
                  </p>
                  <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-2.5 rounded font-mono text-xs flex justify-between items-center">
                    <span className="font-bold">http://&lt;YOUR-IP&gt;:5173</span>
                    <button
                      onClick={() => handleCopyNetworkUrl(`http://${localIp}:5173`)}
                      className="text-emerald-700 hover:text-emerald-950 flex items-center gap-1 font-sans text-xs font-semibold"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedUrl ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Both the frontend (Vite) and backend (Express) are already configured to listen on all interfaces (<code className="font-mono text-gray-700">0.0.0.0</code>).
                  </p>
                </div>
              </div>

              {/* Method 2: Free Cloudflare Tunnel (Remote Internet Access) */}
              <div className="border border-blue-200 bg-blue-50/20 rounded-lg p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-700 text-white rounded">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded">
                      Access Anywhere in the World (Free)
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 mt-1">Method 2: Remote Access via Free Cloudflare Tunnel or Tailscale</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      If you want to use the app when you are outside the office (e.g. from home or traveling), you can generate a free secure HTTPS tunnel without paying for servers.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-blue-200 text-xs space-y-2">
                  <p className="font-semibold text-gray-800">
                    Option A: Cloudflare Quick Tunnel (Zero config, 100% Free):
                  </p>
                  <p className="text-gray-600">
                    Download <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">cloudflared</code> and run:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-2 rounded font-mono text-[11px]">
                    cloudflared tunnel --url http://localhost:5173
                  </div>
                  <p className="text-gray-600">
                    Cloudflare gives you an instant private HTTPS link (e.g. <span className="font-mono text-blue-700 font-semibold">https://my-logistics.trycloudflare.com</span>) that works on any PC or phone worldwide.
                  </p>
                </div>
              </div>

              {/* Method 3: Permanent Cloud Web Hosting */}
              <div className="border border-gray-200 rounded-lg p-5 space-y-3 text-xs bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-gray-600" />
                  Method 3: 24/7 Permanent Web Deployment
                </h3>
                <p className="text-gray-600">
                  You can host this entire stack 24/7 on free cloud services:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Backend</strong>: Deploy to <strong>Render.com</strong> or <strong>Railway.app</strong> (Node.js web service).</li>
                  <li><strong>Frontend</strong>: Deploy to <strong>Vercel</strong> or <strong>Netlify</strong> (connect your GitHub repository).</li>
                  <li>Set environment variable <code className="font-mono bg-gray-100 px-1">VITE_API_BASE=https://your-backend.onrender.com/api</code> on Vercel.</li>
                </ul>
              </div>

            </div>
          )}

          {/* TAB 4: OPERATOR IDENTITY */}
          {activeTab === 'PROFILE' && (
            <form onSubmit={handleSaveOperatorProfile} className="space-y-5 max-w-lg">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Operator / Company Label in Sidebar
                </label>
                <input
                  type="text"
                  value={editOperatorName}
                  onChange={(e) => setEditOperatorName(e.target.value)}
                  placeholder="e.g. Lohan Logistics or Dispatch Desk"
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  This replaces any default admin or user names in the bottom-left sidebar footer.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2 text-xs">
                <span className="font-bold text-gray-800 block">Preview in Navigation:</span>
                <div className="flex items-center gap-3 bg-white p-3 rounded border border-gray-200">
                  <div className="w-8 h-8 rounded bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                    LL
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{editOperatorName || 'Lohan Logistics'}</p>
                    <p className="text-gray-500 text-xs">Operations & Dispatch</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded hover:bg-black transition-mechanical btn-press shadow-xs"
              >
                Save Operator Profile
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-[11px] text-gray-400 font-mono">
            Database: SQLite/JSON Local Engine | Status: Connected
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 hover:text-gray-900 text-xs font-semibold rounded hover:bg-gray-100 transition-mechanical btn-press shadow-2xs"
          >
            Close
          </button>
        </div>

      </div>
    </>
  );
}
