import { useState, useEffect } from 'react';
import { X, Printer, Share2, Save, FileText, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Booking } from '../context/DataContext';
import WhatsAppShareModal from './WhatsAppShareModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
}

export default function BiltyModal({ isOpen, onClose, booking }: Props) {
  const { addDocument, bookings, clients } = useData();

  const [selectedBookingId, setSelectedBookingId] = useState<string>(booking?.id || '');
  const [copyType, setCopyType] = useState<'CONSIGNOR' | 'CONSIGNEE' | 'DRIVER' | 'ALL'>('CONSIGNOR');
  const [lrNo, setLrNo] = useState(() => `LL-${Date.now().toString().slice(-6)}`);
  const [lrDate, setLrDate] = useState(() => new Date().toISOString().split('T')[0] || '2026-10-10');

  // Consignor & Consignee
  const [consignorName, setConsignorName] = useState(() => booking?.client || 'ABC Industries Ltd');
  const [consignorAddress, setConsignorAddress] = useState('Plot 42, MIDC Bhosari, Pune - 411026');
  const [consignorGst, setConsignorGst] = useState('27AABCA1234F1Z9');

  const [consigneeName, setConsigneeName] = useState('North India Logistics Hub / Client Depot');
  const [consigneeAddress, setConsigneeAddress] = useState('Warehouse 8, Sanjay Gandhi Transport Nagar, Delhi - 110042');
  const [consigneeGst, setConsigneeGst] = useState('07AXYZ1234D1Z2');

  // Shipment Route & Vehicle
  const [fromCity, setFromCity] = useState(() => (booking?.route ? booking.route.split('→')[0]?.trim() || 'Pune' : 'Pune'));
  const [toCity, setToCity] = useState(() => (booking?.route ? booking.route.split('→')[1]?.trim() || 'Delhi' : 'Delhi'));
  const [vehicleNo, setVehicleNo] = useState(() => booking?.vehicleNo || 'MH 12 AB 1234');
  const [vehicleType, setVehicleType] = useState(() => booking?.vehicleType || '32 FT Container');
  const [driverName, setDriverName] = useState('Rameshwar Singh');
  const [driverPhone, setDriverPhone] = useState('9876543210');
  const [driverLicense, setDriverLicense] = useState('DL-142018009876');
  const [ewayBillNo, setEwayBillNo] = useState('841920491829');

  // Cargo Goods
  const [packagesCount, setPackagesCount] = useState('180 Boxes / 32 Pallets');
  const [goodsDescription, setGoodsDescription] = useState('Industrial Machined Components & Spare Parts');
  const [actualWeight, setActualWeight] = useState('14.5 MT');
  const [chargedWeight, setChargedWeight] = useState('15.0 MT');

  // Freight & Leftovers
  const [freightTerms, setFreightTerms] = useState<'TO PAY' | 'PAID' | 'TO BE BILLED'>('TO BE BILLED');
  const [basicFreight, setBasicFreight] = useState(() => (booking ? String(booking.clientRate) : '45000'));
  const [loadingCharges, setLoadingCharges] = useState('1000');
  const [haltingCharges, setHaltingCharges] = useState('0');
  const [tollCharges, setTollCharges] = useState('1200');
  const [advancePaid, setAdvancePaid] = useState(() => (booking ? String(booking.clientPaidAmount) : '15000'));

  const [isSaved, setIsSaved] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Sync state whenever modal opens or booking changes
  useEffect(() => {
    if (isOpen) {
      const activeBooking = (selectedBookingId ? bookings.find(b => b.id === selectedBookingId) : null) || booking || bookings[0] || null;
      if (activeBooking) {
        setSelectedBookingId(activeBooking.id);
        setConsignorName(activeBooking.client || 'ABC Industries Ltd');
        const parts = activeBooking.route ? activeBooking.route.split('→').map(s => s.trim()) : ['Pune', 'Delhi'];
        setFromCity(parts[0] || 'Pune');
        setToCity(parts[1] || 'Delhi');
        setVehicleNo(activeBooking.vehicleNo && activeBooking.vehicleNo !== 'Pending' ? activeBooking.vehicleNo : 'MH 12 AB 1234');
        setVehicleType(activeBooking.vehicleType || '32 FT Container');
        setBasicFreight(String(activeBooking.clientRate || 45000));
        setAdvancePaid(String(activeBooking.clientPaidAmount || 0));
        setLrNo(`LL-${Date.now().toString().slice(-6)}`);

        const matchingClient = clients.find(c => c.name.toLowerCase() === activeBooking.client.toLowerCase());
        if (matchingClient) {
          if (matchingClient.gst && matchingClient.gst !== 'UNREGISTERED') setConsignorGst(matchingClient.gst);
          if (matchingClient.address) setConsignorAddress(matchingClient.address);
        }
      }
    }
  }, [isOpen, booking, clients]);

  const handleBookingSelect = (id: string) => {
    setSelectedBookingId(id);
    const b = bookings.find(item => item.id === id);
    if (b) {
      setConsignorName(b.client);
      const parts = b.route ? b.route.split('→').map(s => s.trim()) : ['Pune', 'Delhi'];
      setFromCity(parts[0] || 'Pune');
      setToCity(parts[1] || 'Delhi');
      setVehicleNo(b.vehicleNo && b.vehicleNo !== 'Pending' ? b.vehicleNo : 'MH 12 AB 1234');
      setVehicleType(b.vehicleType || '32 FT Container');
      setBasicFreight(String(b.clientRate || 45000));
      setAdvancePaid(String(b.clientPaidAmount || 0));

      const matchingClient = clients.find(c => c.name.toLowerCase() === b.client.toLowerCase());
      if (matchingClient) {
        if (matchingClient.gst && matchingClient.gst !== 'UNREGISTERED') setConsignorGst(matchingClient.gst);
        if (matchingClient.address) setConsignorAddress(matchingClient.address);
      }
    }
  };

  if (!isOpen) return null;

  const numFreight = Number(basicFreight) || 0;
  const numLoading = Number(loadingCharges) || 0;
  const numHalting = Number(haltingCharges) || 0;
  const numToll = Number(tollCharges) || 0;
  const totalFreight = numFreight + numLoading + numHalting + numToll;
  const numAdvance = Number(advancePaid) || 0;
  const balanceLeftover = Math.max(0, totalFreight - numAdvance);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToDocuments = async () => {
    await addDocument({
      bookingId: selectedBookingId || booking?.id || 'DIRECT',
      type: 'Lorry Receipt (LR)',
      client: consignorName,
      date: lrDate,
      status: 'Verified',
      fileUrl: `LR-${lrNo}.pdf`,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const biltyWhatsAppText = `*LOHAN LOGISTICS - LORRY RECEIPT (BILTY)*\n` +
    `-----------------------------------------\n` +
    `*LR No:* ${lrNo} | *Date:* ${lrDate}\n` +
    `*Booking Ref:* ${selectedBookingId || booking?.id || 'DIRECT'}\n` +
    `-----------------------------------------\n` +
    `*Consignor (Sender):* ${consignorName}\n` +
    `*Consignee (Receiver):* ${consigneeName}\n` +
    `*Route:* ${fromCity} → ${toCity}\n` +
    `*Vehicle No:* ${vehicleNo} (${vehicleType})\n` +
    `*Driver:* ${driverName} (${driverPhone})\n` +
    `*Goods:* ${goodsDescription} [${packagesCount}]\n` +
    `*E-Way Bill:* ${ewayBillNo}\n` +
    `-----------------------------------------\n` +
    `*Freight Terms:* ${freightTerms}\n` +
    `*Total Freight:* ₹${totalFreight.toLocaleString('en-IN')}\n` +
    `*Advance Paid:* ₹${numAdvance.toLocaleString('en-IN')}\n` +
    `*Balance Due on Delivery:* ₹${balanceLeftover.toLocaleString('en-IN')}\n` +
    `-----------------------------------------\n` +
    `_Official Consignment Note issued by LohanLogistics_`;

  const handleShareWhatsApp = () => {
    setIsWhatsAppModalOpen(true);
  };

  return (
    <>
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        recipientName={`${consignorName} / Driver ${driverName}`}
        defaultPhone={driverPhone || ''}
        title="Dispatch Digital Bilty (LR) via WhatsApp"
        messageText={biltyWhatsAppText}
      />

      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-[100] print:hidden transition-mechanical" onClick={onClose} />

      <div className="fixed inset-2 md:inset-6 lg:inset-8 bg-white rounded-lg shadow-2xl z-[100] overflow-hidden flex flex-col border border-gray-200 print:inset-0 print:border-none print:shadow-none print:static">
        
        {/* Top Control Bar - Hidden on Print */}
        <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 text-white rounded shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Digital Bilty / Lorry Receipt (LR) Generator
              </h2>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                Standard Indian Goods Carriage Consignment Note with GST, Cargo, Freight & Signature Blocks
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Booking Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded px-2 py-1 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Booking:</span>
              <select
                value={selectedBookingId}
                onChange={(e) => handleBookingSelect(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-900 focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
              >
                <option value="">-- Direct / Custom --</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.client} ({b.route})
                  </option>
                ))}
              </select>
            </div>

            {/* Copy Selector */}
            <div className="inline-flex rounded-md p-0.5 bg-gray-200 border border-gray-300 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setCopyType('CONSIGNOR')}
                className={`px-2 py-1 rounded ${copyType === 'CONSIGNOR' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
              >
                Consignor
              </button>
              <button
                type="button"
                onClick={() => setCopyType('CONSIGNEE')}
                className={`px-2 py-1 rounded ${copyType === 'CONSIGNEE' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
              >
                Consignee
              </button>
              <button
                type="button"
                onClick={() => setCopyType('DRIVER')}
                className={`px-2 py-1 rounded ${copyType === 'DRIVER' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
              >
                Driver
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded hover:bg-black transition-mechanical btn-press shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Bilty</span>
            </button>

            <button
              onClick={handleSaveToDocuments}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white border border-gray-300 text-gray-800 text-xs font-semibold rounded hover:bg-gray-100 transition-mechanical btn-press shadow-2xs"
            >
              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 text-gray-600" />}
              <span className="hidden sm:inline">{isSaved ? 'Saved!' : 'Save'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700 transition-mechanical btn-press shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-200 transition-mechanical ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Layout */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-8 bg-gray-100/60 print:bg-white print:p-0 print:overflow-visible">
          
          {/* Mobile swipe hint banner */}
          <div className="md:hidden flex items-center justify-center gap-1.5 py-1 px-3 mb-2 bg-amber-50 border border-amber-200 rounded text-[11px] font-medium text-amber-800 shadow-2xs">
            <span>👉</span> Swipe horizontally to view full standard A4 Lorry Receipt
          </div>

          <div className="overflow-x-auto touch-scroll pb-4">
            {/* A4 Paper Simulation Canvas */}
            <div className="min-w-[680px] max-w-4xl mx-auto bg-white border-2 border-gray-900 p-6 shadow-md print:border-2 print:border-gray-900 print:shadow-none print:p-4 text-xs leading-tight">
            
            {/* Header: Company Name, Stamp & Copy Indicator */}
            <div className="border-b-2 border-gray-900 pb-3 flex justify-between items-start">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-900 text-white flex items-center justify-center font-black text-sm">
                    LL
                  </div>
                  <h1 className="text-xl font-black uppercase tracking-wider text-gray-900">
                    LOHAN LOGISTICS
                  </h1>
                </div>
                <p className="text-[11px] font-semibold text-gray-700">
                  Fleet Owners, Transport Contractors & Commission Agents
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  Corp Office: Transport Nagar, Ring Road | Phone: +91 98765 43210 | Email: dispatch@lohanlogistics.in
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  GSTIN: <span className="font-bold text-gray-900">27AAAAA0000A1Z5</span> | PAN: AAAAA0000A
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block px-3 py-1 bg-gray-900 text-white font-mono font-bold text-xs uppercase tracking-widest border border-black">
                  {copyType} COPY
                </span>
                <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider">
                  Goods Carried at Owner's Risk
                </p>
                <div className="text-[11px] font-mono text-gray-800 space-y-0.5">
                  <p>LR No: <input type="text" value={lrNo} onChange={e => setLrNo(e.target.value)} className="font-bold text-gray-900 border-b border-gray-300 focus:outline-none w-28 text-right bg-transparent" /></p>
                  <p>Date: <input type="date" value={lrDate} onChange={e => setLrDate(e.target.value)} className="border-b border-gray-300 focus:outline-none w-28 text-right bg-transparent" /></p>
                  <p className="text-gray-500">Booking: <span className="font-bold text-gray-900">{booking?.id || '#1042'}</span></p>
                </div>
              </div>
            </div>

            {/* Consignor & Consignee Row */}
            <div className="grid grid-cols-2 border-b-2 border-gray-900">
              {/* Consignor (Sender) */}
              <div className="p-3 border-r-2 border-gray-900 space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CONSIGNOR (From / Sender)</p>
                <input
                  type="text"
                  value={consignorName}
                  onChange={e => setConsignorName(e.target.value)}
                  className="font-bold text-gray-900 text-xs w-full border-b border-gray-200 focus:outline-none bg-transparent"
                  placeholder="Consignor Company Name"
                />
                <textarea
                  rows={2}
                  value={consignorAddress}
                  onChange={e => setConsignorAddress(e.target.value)}
                  className="text-[11px] text-gray-600 w-full border-b border-gray-200 focus:outline-none resize-none bg-transparent mt-1"
                  placeholder="Full Address, City, State, PIN"
                />
                <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
                  <span className="text-gray-500">GSTIN:</span>
                  <input
                    type="text"
                    value={consignorGst}
                    onChange={e => setConsignorGst(e.target.value)}
                    className="font-medium text-gray-900 border-b border-gray-200 focus:outline-none flex-1 bg-transparent"
                  />
                </div>
              </div>

              {/* Consignee (Receiver) */}
              <div className="p-3 space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CONSIGNEE (To / Receiver)</p>
                <input
                  type="text"
                  value={consigneeName}
                  onChange={e => setConsigneeName(e.target.value)}
                  className="font-bold text-gray-900 text-xs w-full border-b border-gray-200 focus:outline-none bg-transparent"
                  placeholder="Consignee Company Name"
                />
                <textarea
                  rows={2}
                  value={consigneeAddress}
                  onChange={e => setConsigneeAddress(e.target.value)}
                  className="text-[11px] text-gray-600 w-full border-b border-gray-200 focus:outline-none resize-none bg-transparent mt-1"
                  placeholder="Delivery Address, City, State, PIN"
                />
                <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
                  <span className="text-gray-500">GSTIN:</span>
                  <input
                    type="text"
                    value={consigneeGst}
                    onChange={e => setConsigneeGst(e.target.value)}
                    className="font-medium text-gray-900 border-b border-gray-200 focus:outline-none flex-1 bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Route & Transport Grid */}
            <div className="grid grid-cols-4 border-b-2 border-gray-900 divide-x-2 divide-gray-900 text-[11px]">
              <div className="p-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase block">From City</span>
                <input type="text" value={fromCity} onChange={e => setFromCity(e.target.value)} className="font-semibold text-gray-900 w-full bg-transparent focus:outline-none" />
              </div>
              <div className="p-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase block">To City</span>
                <input type="text" value={toCity} onChange={e => setToCity(e.target.value)} className="font-semibold text-gray-900 w-full bg-transparent focus:outline-none" />
              </div>
              <div className="p-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase block">Vehicle No.</span>
                <input type="text" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} className="font-mono font-bold text-gray-900 w-full bg-transparent focus:outline-none" />
              </div>
              <div className="p-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase block">Vehicle Type</span>
                <input type="text" value={vehicleType} onChange={e => setVehicleType(e.target.value)} className="font-medium text-gray-800 w-full bg-transparent focus:outline-none" />
              </div>
            </div>

            {/* Driver & E-Way Bill Grid */}
            <div className="grid grid-cols-4 border-b-2 border-gray-900 divide-x-2 divide-gray-900 text-[11px]">
              <div className="p-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase block">Driver Name</span>
                <input type="text" value={driverName} onChange={e => setDriverName(e.target.value)} className="font-medium text-gray-900 w-full bg-transparent focus:outline-none" />
              </div>
              <div className="p-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase block">Driver Mobile</span>
                <input type="text" value={driverPhone} onChange={e => setDriverPhone(e.target.value)} className="font-mono text-gray-900 w-full bg-transparent focus:outline-none" />
              </div>
              <div className="p-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase block">Driver DL No.</span>
                <input type="text" value={driverLicense} onChange={e => setDriverLicense(e.target.value)} className="font-mono text-gray-900 w-full bg-transparent focus:outline-none" />
              </div>
              <div className="p-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase block">E-Way Bill No.</span>
                <input type="text" value={ewayBillNo} onChange={e => setEwayBillNo(e.target.value)} className="font-mono font-bold text-gray-900 w-full bg-transparent focus:outline-none" />
              </div>
            </div>

            {/* Goods Description & Weight Table */}
            <div className="border-b-2 border-gray-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-900 bg-gray-50 font-bold text-[10px] uppercase text-gray-700">
                    <th className="p-2 border-r-2 border-gray-900 w-32">Packages / Units</th>
                    <th className="p-2 border-r-2 border-gray-900">Description of Goods (Said to Contain)</th>
                    <th className="p-2 border-r-2 border-gray-900 w-28 text-right">Actual Wt.</th>
                    <th className="p-2 w-28 text-right">Charged Wt.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-r-2 border-gray-900 align-top">
                      <input
                        type="text"
                        value={packagesCount}
                        onChange={e => setPackagesCount(e.target.value)}
                        className="w-full font-mono text-xs focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="p-2 border-r-2 border-gray-900 align-top">
                      <input
                        type="text"
                        value={goodsDescription}
                        onChange={e => setGoodsDescription(e.target.value)}
                        className="w-full font-medium text-xs focus:outline-none bg-transparent"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 italic">
                        Sender certifies material is non-hazardous and packed safely for transit.
                      </p>
                    </td>
                    <td className="p-2 border-r-2 border-gray-900 text-right align-top">
                      <input
                        type="text"
                        value={actualWeight}
                        onChange={e => setActualWeight(e.target.value)}
                        className="w-full text-right font-mono text-xs focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="p-2 text-right align-top">
                      <input
                        type="text"
                        value={chargedWeight}
                        onChange={e => setChargedWeight(e.target.value)}
                        className="w-full text-right font-mono text-xs font-bold focus:outline-none bg-transparent"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Freight Charges & Payment Settlement Block */}
            <div className="grid grid-cols-2 border-b-2 border-gray-900">
              {/* Left Column: Terms, Value, Demurrage */}
              <div className="p-3 border-r-2 border-gray-900 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-600 uppercase">Freight Basis:</span>
                    <select
                      value={freightTerms}
                      onChange={e => setFreightTerms(e.target.value as any)}
                      className="font-bold border border-gray-300 rounded px-2 py-0.5 text-xs bg-gray-50 focus:outline-none"
                    >
                      <option value="TO BE BILLED">TO BE BILLED (Khata)</option>
                      <option value="TO PAY">TO PAY (Pay on Delivery)</option>
                      <option value="PAID">PAID (Advance Cleared)</option>
                    </select>
                  </div>
                  <div className="text-[10px] text-gray-500 space-y-1">
                    <p>• Goods to be delivered only against original Consignee copy endorsement.</p>
                    <p>• Unloading must be completed within 24 hours of vehicle reporting.</p>
                    <p>• Halting charges ₹2,500/day applicable thereafter.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 text-[10px] font-mono text-gray-500">
                  Carrier not responsible for leakage, evaporation or natural transit damage.
                </div>
              </div>

              {/* Right Column: Freight & Balance Calculation */}
              <div className="p-3 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Basic Freight:</span>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1">₹</span>
                    <input
                      type="number"
                      value={basicFreight}
                      onChange={e => setBasicFreight(e.target.value)}
                      className="w-24 text-right font-mono font-medium border-b border-gray-200 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Loading / Hamali Charges:</span>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1">₹</span>
                    <input
                      type="number"
                      value={loadingCharges}
                      onChange={e => setLoadingCharges(e.target.value)}
                      className="w-24 text-right font-mono border-b border-gray-200 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Detention / Halting:</span>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1">₹</span>
                    <input
                      type="number"
                      value={haltingCharges}
                      onChange={e => setHaltingCharges(e.target.value)}
                      className="w-24 text-right font-mono border-b border-gray-200 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Statistical / Toll Surcharge:</span>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1">₹</span>
                    <input
                      type="number"
                      value={tollCharges}
                      onChange={e => setTollCharges(e.target.value)}
                      className="w-24 text-right font-mono border-b border-gray-200 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-gray-300 font-bold text-gray-900">
                  <span>TOTAL FREIGHT:</span>
                  <span className="font-mono">₹{totalFreight.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-emerald-800">
                  <span>Less: Advance Paid:</span>
                  <div className="flex items-center">
                    <span className="mr-1">₹</span>
                    <input
                      type="number"
                      value={advancePaid}
                      onChange={e => setAdvancePaid(e.target.value)}
                      className="w-24 text-right font-mono border-b border-gray-200 text-emerald-800 font-semibold focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 border-t-2 border-gray-900 font-black text-xs text-amber-900">
                  <span>BALANCE LEFTOVER TO PAY:</span>
                  <span className="font-mono text-sm">₹{balanceLeftover.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-3 divide-x-2 divide-gray-900 pt-3">
              <div className="p-3 text-center flex flex-col justify-between h-24">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Consignor's Signature</p>
                <div className="border-t border-gray-400 pt-1 text-[10px] font-mono text-gray-700">
                  Sender Signature / Stamp
                </div>
              </div>

              <div className="p-3 text-center flex flex-col justify-between h-24">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Driver's Signature</p>
                <div className="border-t border-gray-400 pt-1 text-[10px] font-mono text-gray-700">
                  Driver Acknowledged Goods In Good Order
                </div>
              </div>

              <div className="p-3 text-center flex flex-col justify-between h-24">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">For LOHAN LOGISTICS</p>
                <div className="border-t border-gray-400 pt-1 text-[10px] font-bold text-gray-900">
                  Authorized Signatory / Booking Office
                </div>
              </div>
            </div>

          </div>
          </div>

        </div>

      </div>
    </>
  );
}