import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data', 'db.json');

export interface Booking {
  id: string;
  client: string;
  route: string;
  vehicleType: string;
  vehicleNo: string;
  transporter: string;
  clientRate: number;
  transporterRate: number;
  margin: number;
  pickupDate: string;
  pickupTime: string;
  status: 'Requested' | 'Arranged' | 'In Transit' | 'Delivered' | 'Completed';
  clientPaymentStatus: 'Pending' | 'Partial' | 'Paid';
  clientPaidAmount: number;
  transporterPaymentStatus: 'Pending' | 'Partial' | 'Paid';
  transporterPaidAmount: number;
  documents: string[];
  notes?: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  vehicle: string;
  driverName: string;
  driverPhone: string;
  up: {
    route: string;
    client: string;
    freight: number;
  };
  down: {
    route: string;
    client: string;
    freight: number;
  };
  advances: {
    driverBhatta: number;
    dieselToll: number;
  };
  expenses?: {
    actualDiesel: number;
    tolls: number;
    driverCharges: number;
    maintenance: number;
    other: number;
  };
  status: 'Up Transit' | 'Unloading Up' | 'Down Transit' | 'Delivered' | 'Closed';
  statusType: 'blue' | 'amber' | 'emerald' | 'gray';
  closingSummary?: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    closedAt: string;
  };
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  gst: string;
  pan?: string | undefined;
  routes: string;
  paymentTerms: string;
  joinDate?: string | undefined;
  creditLimit?: number | undefined;
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  address?: string | undefined;
  notes?: string | undefined;
}

export interface Transporter {
  id: string;
  name: string;
  phone: string;
  panGst: string;
  gst?: string | undefined;
  pan?: string | undefined;
  vehicles: string[];
  routes: string;
  rateType: string;
  rating: number;
  totalPayable: number;
  totalPaid: number;
  outstandingPayable: number;
  notes?: string | undefined;
}

export interface Requirement {
  id: string;
  date: string;
  time: string;
  client: string;
  route: string;
  vehicle: string;
  status: 'Arranged' | 'Vehicle Required' | 'Finding Vehicle';
  statusType: 'success' | 'warning';
}

export interface PaymentTransaction {
  id: string;
  partyType: 'CLIENT' | 'TRANSPORTER';
  partyName: string;
  amount: number;
  mode: 'UPI' | 'NEFT' | 'CHEQUE' | 'CASH';
  refNo: string;
  date: string;
  notes: string;
  bookingId?: string;
  invoiceId?: string;
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  bookingId: string;
  type: 'Lorry Receipt (LR)' | 'Invoice' | 'Proof of Delivery (POD)' | 'E-Way Bill';
  client: string;
  date: string;
  status: 'Verified' | 'Pending Review' | 'Missing';
  fileUrl?: string;
}

export interface LeftoverAdjustment {
  id: string;
  partyType: 'CLIENT' | 'TRANSPORTER';
  partyName: string;
  category: 'PAST_BALANCE' | 'HALTING_DETENTION' | 'EXTRA_LOADING' | 'TOLL_CHALLAN' | 'OTHER';
  amount: number;
  date: string;
  notes: string;
  bookingId?: string;
  createdAt: string;
}

export interface FuelSlip {
  id: string;
  tripId: string;
  vehicleNo: string;
  pumpName: string;
  slipNo: string;
  date: string;
  liters: number;
  ratePerLiter: number;
  totalAmount: number;
  odometerReading?: number | undefined;
  paymentMode: 'FLEET_CARD' | 'CASH' | 'PUMP_CREDIT' | 'UPI';
  driverName?: string | undefined;
  notes?: string | undefined;
  createdAt: string;
}

export interface DBData {
  bookings: Booking[];
  trips: Trip[];
  clients: Client[];
  transporters: Transporter[];
  requirements: Requirement[];
  payments: PaymentTransaction[];
  documents: DocumentRecord[];
  leftovers?: LeftoverAdjustment[];
  fuelSlips?: FuelSlip[];
}

export const initialSeed: DBData = {
  bookings: [
    {
      id: '#1042',
      client: 'ABC Industries',
      route: 'Pune → Delhi',
      vehicleType: '32 FT Container',
      vehicleNo: 'MH12AB1234',
      transporter: 'XYZ Transport',
      clientRate: 45000,
      transporterRate: 39000,
      margin: 6000,
      pickupDate: '2026-10-10',
      pickupTime: '09:30 AM',
      status: 'Arranged',
      clientPaymentStatus: 'Partial',
      clientPaidAmount: 30000,
      transporterPaymentStatus: 'Pending',
      transporterPaidAmount: 0,
      documents: ['LR', 'Invoice'],
      notes: 'Fragile electrical machinery',
      createdAt: '2026-10-08T09:00:00Z',
    },
    {
      id: '#1041',
      client: 'XYZ Ltd',
      route: 'Pune → Mumbai',
      vehicleType: '14 FT',
      vehicleNo: 'MH14XY5678',
      transporter: 'Ramesh Logistics',
      clientRate: 28000,
      transporterRate: 23000,
      margin: 5000,
      pickupDate: '2026-10-09',
      pickupTime: '11:00 AM',
      status: 'In Transit',
      clientPaymentStatus: 'Pending',
      clientPaidAmount: 0,
      transporterPaymentStatus: 'Partial',
      transporterPaidAmount: 10000,
      documents: ['LR'],
      notes: 'Urgent FMCG delivery',
      createdAt: '2026-10-08T10:30:00Z',
    },
    {
      id: '#1040',
      client: 'PQR Corp',
      route: 'Mumbai → Pune',
      vehicleType: '20 FT Container',
      vehicleNo: 'MH04AB9876',
      transporter: 'Alpha Trucks',
      clientRate: 39000,
      transporterRate: 34000,
      margin: 5000,
      pickupDate: '2026-10-08',
      pickupTime: '03:00 PM',
      status: 'Delivered',
      clientPaymentStatus: 'Paid',
      clientPaidAmount: 39000,
      transporterPaymentStatus: 'Paid',
      transporterPaidAmount: 34000,
      documents: ['LR', 'Invoice', 'POD'],
      notes: 'Completed successfully',
      createdAt: '2026-10-07T08:00:00Z',
    },
  ],
  trips: [
    {
      id: 'TRP-1042',
      vehicle: 'MH 12 AB 1234',
      driverName: 'Ramesh Yadav',
      driverPhone: '+91 9876543210',
      up: { route: 'Pune → Delhi', client: 'ABC Industries', freight: 45000 },
      down: { route: 'Delhi → Pune', client: 'XYZ Ltd', freight: 38000 },
      advances: { driverBhatta: 4000, dieselToll: 18000 },
      status: 'Up Transit',
      statusType: 'blue',
      createdAt: '2026-10-08T09:30:00Z',
    },
    {
      id: 'TRP-1041',
      vehicle: 'GJ 01 XX 9999',
      driverName: 'Suresh Patil',
      driverPhone: '+91 8765432109',
      up: { route: 'Mumbai → Nashik', client: 'PQR Corp', freight: 18000 },
      down: { route: 'Nashik → Mumbai', client: 'Local Merchant', freight: 12000 },
      advances: { driverBhatta: 2000, dieselToll: 6000 },
      status: 'Closed',
      statusType: 'gray',
      closingSummary: {
        totalRevenue: 30000,
        totalExpenses: 21500,
        netProfit: 8500,
        closedAt: '2026-10-07T18:00:00Z',
      },
      createdAt: '2026-10-06T08:00:00Z',
    },
    {
      id: 'TRP-1040',
      vehicle: 'MH 14 XX 5555',
      driverName: 'Raju Shinde',
      driverPhone: '+91 9988776655',
      up: { route: 'Pune → Bangalore', client: 'Alpha Corp', freight: 55000 },
      down: { route: 'Waiting for load', client: '-', freight: 0 },
      advances: { driverBhatta: 5000, dieselToll: 20000 },
      status: 'Unloading Up',
      statusType: 'amber',
      createdAt: '2026-10-07T12:00:00Z',
    },
  ],
  clients: [
    {
      id: 'CLI-001',
      name: 'ABC Industries',
      contact: 'Ravi Sharma',
      phone: '+91 9988776655',
      email: 'logistics@abcindustries.com',
      gst: '27AABCA1234C1Z5',
      pan: 'AABCA1234C',
      routes: 'Pune → Delhi, Pune → Mumbai',
      paymentTerms: 'Net 15 Days',
      joinDate: '2025-03-15',
      creditLimit: 500000,
      totalBilled: 45000,
      totalPaid: 30000,
      outstanding: 15000,
      address: 'Plot 45, MIDC Bhosari, Pune, MH',
      notes: 'Key manufacturing client for North India routes',
    },
    {
      id: 'CLI-002',
      name: 'XYZ Ltd',
      contact: 'Amit Patel',
      phone: '+91 8877665544',
      email: 'amit@xyzltd.in',
      gst: '27AAXYZ5678B1Z2',
      pan: 'AAXYZ5678B',
      routes: 'Pune → Mumbai, Delhi → Pune',
      paymentTerms: 'On Delivery',
      joinDate: '2025-06-20',
      creditLimit: 300000,
      totalBilled: 28000,
      totalPaid: 0,
      outstanding: 28000,
      address: 'Andheri East, Mumbai, MH',
      notes: 'Strict delivery timings required (FMCG goods)',
    },
    {
      id: 'CLI-003',
      name: 'PQR Corp',
      contact: 'Vikram Deshmukh',
      phone: '+91 9123456780',
      email: 'dispatch@pqrcorp.com',
      gst: '27AAPQR9999K1Z8',
      pan: 'AAPQR9999K',
      routes: 'Mumbai → Pune, Mumbai → Nashik',
      paymentTerms: 'Net 30 Days',
      joinDate: '2025-08-10',
      creditLimit: 750000,
      totalBilled: 39000,
      totalPaid: 39000,
      outstanding: 0,
      address: 'GIDC Industrial Area, Vapi / Mumbai',
      notes: 'Clean payment history, prefers 32 FT containers',
    },
  ],
  transporters: [
    {
      id: 'TRN-001',
      name: 'XYZ Transport',
      phone: '+91 9876543210',
      panGst: 'ABCDE1234F',
      vehicles: ['32 FT Container', '14 FT Open'],
      routes: 'Pune ↔ Delhi',
      rateType: 'Market Rate',
      rating: 4.8,
      totalPayable: 39000,
      totalPaid: 0,
      outstandingPayable: 39000,
      notes: 'Reliable for long haul North routes',
    },
    {
      id: 'TRN-002',
      name: 'Ramesh Logistics',
      phone: '+91 8765432109',
      panGst: 'FGHIJ5678K',
      vehicles: ['20 FT Open', '14 FT'],
      routes: 'Mumbai ↔ Nashik, Pune ↔ Mumbai',
      rateType: 'Fixed Contract',
      rating: 4.2,
      totalPayable: 23000,
      totalPaid: 10000,
      outstandingPayable: 13000,
      notes: 'Advance diesel required before dispatch',
    },
    {
      id: 'TRN-003',
      name: 'Alpha Trucks',
      phone: '+91 9765432101',
      panGst: 'KLMNO9012P',
      vehicles: ['32 FT Multi-Axle', '20 FT Container'],
      routes: 'Pune ↔ Bangalore',
      rateType: 'Market Rate',
      rating: 4.6,
      totalPayable: 34000,
      totalPaid: 34000,
      outstandingPayable: 0,
      notes: 'Prompt with POD return',
    },
  ],
  requirements: [
    {
      id: 'REQ-001',
      date: 'Today, 09:30 AM',
      time: '09:30 AM',
      client: 'ABC Industries',
      route: 'Pune → Mumbai',
      vehicle: '32 FT Container',
      status: 'Arranged',
      statusType: 'success',
    },
    {
      id: 'REQ-002',
      date: 'Today, 02:00 PM',
      time: '02:00 PM',
      client: 'XYZ Industries',
      route: 'Pune → Delhi',
      vehicle: '32 FT Container',
      status: 'Vehicle Required',
      statusType: 'warning',
    },
    {
      id: 'REQ-003',
      date: 'Tomorrow, 09:00 AM',
      time: '09:00 AM',
      client: 'PQR Logistics',
      route: 'Mumbai → Nashik',
      vehicle: '14 FT',
      status: 'Finding Vehicle',
      statusType: 'warning',
    },
    {
      id: 'REQ-004',
      date: '10 Oct, 06:00 PM',
      time: '06:00 PM',
      client: 'Alpha Corp',
      route: 'Delhi → Jaipur',
      vehicle: '20 FT Open',
      status: 'Arranged',
      statusType: 'success',
    },
  ],
  payments: [
    {
      id: 'PAY-1001',
      partyType: 'CLIENT',
      partyName: 'ABC Industries',
      amount: 30000,
      mode: 'NEFT',
      refNo: 'HDFC26100898234',
      date: '2026-10-08',
      notes: 'Advance payment for booking #1042 (Leftover: ₹15,000)',
      bookingId: '#1042',
      invoiceId: 'INV-2026-001',
      createdAt: '2026-10-08T11:00:00Z',
    },
    {
      id: 'PAY-1002',
      partyType: 'TRANSPORTER',
      partyName: 'Ramesh Logistics',
      amount: 10000,
      mode: 'UPI',
      refNo: 'UPI/261009/48201',
      date: '2026-10-09',
      notes: 'Diesel card topup for booking #1041 (Leftover: ₹13,000)',
      bookingId: '#1041',
      createdAt: '2026-10-09T08:30:00Z',
    },
  ],
  documents: [
    {
      id: 'DOC-1042-LR',
      bookingId: '#1042',
      type: 'Lorry Receipt (LR)',
      client: 'ABC Industries',
      date: '09 Oct 2026',
      status: 'Verified',
    },
    {
      id: 'DOC-1042-INV',
      bookingId: '#1042',
      type: 'Invoice',
      client: 'ABC Industries',
      date: '10 Oct 2026',
      status: 'Pending Review',
    },
    {
      id: 'DOC-1039-POD',
      bookingId: '#1039',
      type: 'Proof of Delivery (POD)',
      client: 'XYZ Ltd',
      date: '05 Oct 2026',
      status: 'Missing',
    },
  ],
  fuelSlips: [
    {
      id: 'FS-101',
      tripId: 'TRP-1042',
      vehicleNo: 'MH 12 AB 1234',
      pumpName: 'Indian Oil (IOCL) - Pune Expressway',
      slipNo: 'IOC-88219',
      date: '2026-10-10',
      liters: 110,
      ratePerLiter: 92.5,
      totalAmount: 10175,
      odometerReading: 124500,
      paymentMode: 'FLEET_CARD',
      driverName: 'Ramesh Singh',
      notes: 'Full tank at highway exit',
      createdAt: '2026-10-10T11:00:00Z',
    },
    {
      id: 'FS-102',
      tripId: 'TRP-1042',
      vehicleNo: 'MH 12 AB 1234',
      pumpName: 'BPCL Highway Plaza - Surat Bypass',
      slipNo: 'BP-44912',
      date: '2026-10-11',
      liters: 95,
      ratePerLiter: 93.0,
      totalAmount: 8835,
      odometerReading: 124960,
      paymentMode: 'CASH',
      driverName: 'Ramesh Singh',
      notes: 'Top-up before toll plaza',
      createdAt: '2026-10-11T08:30:00Z',
    },
  ],
};

export function readDB(): DBData {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      writeDB(initialSeed);
      return initialSeed;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data: DBData = JSON.parse(raw);
    if (!data.leftovers) data.leftovers = [];
    if (!data.fuelSlips) data.fuelSlips = [];
    // Ensure all clients have joinDate and creditLimit populated
    if (data.clients) {
      let clientModified = false;
      data.clients.forEach((c, idx) => {
        if (!c.joinDate) {
          c.joinDate = `2025-0${(idx % 8) + 1}-15`;
          clientModified = true;
        }
        if (!c.creditLimit) {
          c.creditLimit = 500000;
          clientModified = true;
        }
        if (!c.pan && c.gst && c.gst.length >= 12) {
          c.pan = c.gst.substring(2, 12);
          clientModified = true;
        }
      });
      if (clientModified) {
        writeDB(data);
      }
    }
    return data;
  } catch (err) {
    console.error('Error reading db.json:', err);
    return initialSeed;
  }
}

export function writeDB(data: DBData): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}
