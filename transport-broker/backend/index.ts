import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readDB, writeDB, initialSeed } from './db.js';
import type { Booking, Trip, Client, Transporter, Requirement, PaymentTransaction, DocumentRecord, LeftoverAdjustment, FuelSlip, DBData } from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'LohanLogistics Transport Brokerage API is running.' });
});

// Full state sync
app.get('/api/all', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db);
});

// ==================== BOOKINGS ====================
app.get('/api/bookings', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.bookings);
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const db = readDB();
  const newBooking: Booking = {
    id: req.body.id || `#${Math.floor(1000 + Math.random() * 9000)}`,
    client: req.body.client || 'Unknown Client',
    route: req.body.route || 'Local',
    vehicleType: req.body.vehicleType || '32 FT Container',
    vehicleNo: req.body.vehicleNo || 'Pending',
    transporter: req.body.transporter || 'Pending Assignment',
    clientRate: Number(req.body.clientRate) || 0,
    transporterRate: Number(req.body.transporterRate) || 0,
    margin: (Number(req.body.clientRate) || 0) - (Number(req.body.transporterRate) || 0),
    pickupDate: req.body.pickupDate || new Date().toISOString().split('T')[0] || '2026-10-10',
    pickupTime: req.body.pickupTime || '09:00 AM',
    status: req.body.status || 'Arranged',
    clientPaymentStatus: 'Pending',
    clientPaidAmount: 0,
    transporterPaymentStatus: 'Pending',
    transporterPaidAmount: 0,
    documents: req.body.documents || [],
    notes: req.body.notes || '',
    createdAt: new Date().toISOString(),
  };

  db.bookings.unshift(newBooking);

  // Update client total billed & outstanding
  const client = db.clients.find(c => c.name.toLowerCase() === newBooking.client.toLowerCase());
  if (client) {
    client.totalBilled += newBooking.clientRate;
    client.outstanding += newBooking.clientRate;
  }

  // Update transporter total payable & outstanding
  if (newBooking.transporter && newBooking.transporter !== 'Pending Assignment') {
    const trn = db.transporters.find(t => t.name.toLowerCase() === newBooking.transporter.toLowerCase());
    if (trn) {
      trn.totalPayable += newBooking.transporterRate;
      trn.outstandingPayable += newBooking.transporterRate;
    }
  }

  writeDB(db);
  res.status(201).json(newBooking);
});

app.patch('/api/bookings/:id', (req: Request, res: Response) => {
  const db = readDB();
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  Object.assign(booking, req.body);
  writeDB(db);
  res.json(booking);
});

// ==================== TRIPS ====================
app.get('/api/trips', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.trips);
});

app.post('/api/trips', (req: Request, res: Response) => {
  const db = readDB();
  const newTrip: Trip = {
    id: req.body.id || `TRP-${Math.floor(1000 + Math.random() * 9000)}`,
    vehicle: req.body.vehicle || 'MH 12 AB 0000',
    driverName: req.body.driverName || 'Driver',
    driverPhone: req.body.driverPhone || '',
    up: {
      route: req.body.up?.route || 'Source → Destination',
      client: req.body.up?.client || '',
      freight: Number(req.body.up?.freight) || 0,
    },
    down: {
      route: req.body.down?.route || 'Waiting for load',
      client: req.body.down?.client || '-',
      freight: Number(req.body.down?.freight) || 0,
    },
    advances: {
      driverBhatta: Number(req.body.advances?.driverBhatta) || 0,
      dieselToll: Number(req.body.advances?.dieselToll) || 0,
    },
    status: 'Up Transit',
    statusType: 'blue',
    createdAt: new Date().toISOString(),
  };

  db.trips.unshift(newTrip);
  writeDB(db);
  res.status(201).json(newTrip);
});

app.patch('/api/trips/:id', (req: Request, res: Response) => {
  const db = readDB();
  const trip = db.trips.find(t => t.id === req.params.id);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  Object.assign(trip, req.body);
  writeDB(db);
  res.json(trip);
});

// Close Trip / Settle
app.post('/api/trips/:id/close', (req: Request, res: Response) => {
  const db = readDB();
  const trip = db.trips.find(t => t.id === req.params.id);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const expenses = {
    actualDiesel: Number(req.body.actualDiesel) || 0,
    tolls: Number(req.body.tolls) || 0,
    driverCharges: Number(req.body.driverCharges) || 0,
    maintenance: Number(req.body.maintenance) || 0,
    other: Number(req.body.other) || 0,
  };

  const totalRevenue = (trip.up.freight || 0) + (trip.down.freight || 0);
  const totalExpenses =
    expenses.actualDiesel +
    expenses.tolls +
    expenses.driverCharges +
    expenses.maintenance +
    expenses.other;
  const netProfit = totalRevenue - totalExpenses;

  trip.expenses = expenses;
  trip.status = 'Closed';
  trip.statusType = 'gray';
  trip.closingSummary = {
    totalRevenue,
    totalExpenses,
    netProfit,
    closedAt: new Date().toISOString(),
  };

  writeDB(db);
  res.json(trip);
});

// ==================== CLIENTS ====================
app.get('/api/clients', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.clients);
});

app.post('/api/clients', (req: Request, res: Response) => {
  const db = readDB();
  const gst = req.body.gst || '';
  const pan = req.body.pan || (gst && gst.length >= 12 ? gst.substring(2, 12) : '');
  const newClient: Client = {
    id: req.body.id || `CLI-${Math.floor(100 + Math.random() * 900)}`,
    name: req.body.name || 'New Client',
    contact: req.body.contact || '',
    phone: req.body.phone || '',
    email: req.body.email || '',
    gst,
    pan,
    routes: req.body.routes || '',
    paymentTerms: req.body.paymentTerms || 'Net 15 Days',
    joinDate: req.body.joinDate || new Date().toISOString().split('T')[0] || '2026-10-10',
    creditLimit: Number(req.body.creditLimit) || 500000,
    totalBilled: Number(req.body.openingBalance) || 0,
    totalPaid: 0,
    outstanding: Number(req.body.openingBalance) || 0,
    address: req.body.address || '',
    notes: req.body.notes || '',
  };

  db.clients.unshift(newClient);
  writeDB(db);
  res.status(201).json(newClient);
});

app.patch('/api/clients/:id', (req: Request, res: Response) => {
  const db = readDB();
  const client = db.clients.find(c => c.id === req.params.id);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  Object.assign(client, req.body);
  writeDB(db);
  res.json(client);
});

// ==================== TRANSPORTERS ====================
app.get('/api/transporters', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.transporters);
});

app.post('/api/transporters', (req: Request, res: Response) => {
  const db = readDB();
  const newTransporter: Transporter = {
    id: req.body.id || `TRN-${Math.floor(100 + Math.random() * 900)}`,
    name: req.body.name || 'New Transporter',
    phone: req.body.phone || '',
    panGst: req.body.panGst || '',
    vehicles: Array.isArray(req.body.vehicles) ? req.body.vehicles : [req.body.vehicles || '32 FT Container'],
    routes: req.body.routes || '',
    rateType: req.body.rateType || 'Market Rate',
    rating: 4.5,
    totalPayable: Number(req.body.openingBalance) || 0,
    totalPaid: 0,
    outstandingPayable: Number(req.body.openingBalance) || 0,
    notes: req.body.notes || '',
  };

  db.transporters.unshift(newTransporter);
  writeDB(db);
  res.status(201).json(newTransporter);
});

app.patch('/api/transporters/:id', (req: Request, res: Response) => {
  const db = readDB();
  const transporter = db.transporters.find(t => t.id === req.params.id);
  if (!transporter) {
    return res.status(404).json({ error: 'Transporter not found' });
  }

  Object.assign(transporter, req.body);
  writeDB(db);
  res.json(transporter);
});

// ==================== REQUIREMENTS ====================
app.get('/api/requirements', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.requirements);
});

app.post('/api/requirements', (req: Request, res: Response) => {
  const db = readDB();
  const newReq: Requirement = {
    id: req.body.id || `REQ-${Math.floor(100 + Math.random() * 900)}`,
    date: req.body.date || 'Today',
    time: req.body.time || '10:00 AM',
    client: req.body.client || 'Client',
    route: req.body.route || 'Source → Destination',
    vehicle: req.body.vehicle || '32 FT Container',
    status: req.body.status || 'Vehicle Required',
    statusType: req.body.status === 'Arranged' ? 'success' : 'warning',
  };

  db.requirements.unshift(newReq);
  writeDB(db);
  res.status(201).json(newReq);
});

// Convert requirement into a booking
app.post('/api/requirements/:id/convert', (req: Request, res: Response) => {
  const db = readDB();
  const r = db.requirements.find(reqItem => reqItem.id === req.params.id);
  if (!r) {
    return res.status(404).json({ error: 'Requirement not found' });
  }

  r.status = 'Arranged';
  r.statusType = 'success';

  const clientRate = Number(req.body.clientRate) || 40000;
  const transporterRate = Number(req.body.transporterRate) || 35000;

  const newBooking: Booking = {
    id: `#${Math.floor(1000 + Math.random() * 9000)}`,
    client: r.client,
    route: r.route,
    vehicleType: r.vehicle,
    vehicleNo: req.body.vehicleNo || 'Pending',
    transporter: req.body.transporter || 'Pending Assignment',
    clientRate,
    transporterRate,
    margin: clientRate - transporterRate,
    pickupDate: new Date().toISOString().split('T')[0] || '2026-10-10',
    pickupTime: r.time,
    status: 'Arranged',
    clientPaymentStatus: 'Pending',
    clientPaidAmount: 0,
    transporterPaymentStatus: 'Pending',
    transporterPaidAmount: 0,
    documents: [],
    createdAt: new Date().toISOString(),
  };

  db.bookings.unshift(newBooking);

  // Update client
  const client = db.clients.find(c => c.name.toLowerCase() === r.client.toLowerCase());
  if (client) {
    client.totalBilled += newBooking.clientRate;
    client.outstanding += newBooking.clientRate;
  }

  writeDB(db);
  res.status(201).json({ requirement: r, booking: newBooking });
});

// ==================== PAYMENTS (Leftover & Manual Entry) ====================
app.get('/api/payments', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.payments);
});

app.post('/api/payments', (req: Request, res: Response) => {
  const db = readDB();
  const amount = Number(req.body.amount) || 0;
  const partyType = req.body.partyType as 'CLIENT' | 'TRANSPORTER';
  const partyName = req.body.partyName || '';
  const bookingId = req.body.bookingId;

  const payment: PaymentTransaction = {
    id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
    partyType,
    partyName,
    amount,
    mode: req.body.mode || 'NEFT',
    refNo: req.body.refNo || `REF-${Date.now().toString().slice(-6)}`,
    date: req.body.date || new Date().toISOString().split('T')[0] || '2026-10-10',
    notes: req.body.notes || '',
    bookingId,
    invoiceId: req.body.invoiceId,
    createdAt: new Date().toISOString(),
  };

  db.payments.unshift(payment);

  // Adjust Client Balances & Leftovers
  if (partyType === 'CLIENT') {
    const client = db.clients.find(c => c.name.toLowerCase() === partyName.toLowerCase());
    if (client) {
      client.totalPaid += amount;
      client.outstanding = Math.max(0, client.totalBilled - client.totalPaid);
    }

    if (bookingId) {
      const booking = db.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.clientPaidAmount += amount;
        if (booking.clientPaidAmount >= booking.clientRate) {
          booking.clientPaymentStatus = 'Paid';
        } else if (booking.clientPaidAmount > 0) {
          booking.clientPaymentStatus = 'Partial';
        }
      }
    }
  }

  // Adjust Transporter Balances & Leftovers
  if (partyType === 'TRANSPORTER') {
    const transporter = db.transporters.find(t => t.name.toLowerCase() === partyName.toLowerCase());
    if (transporter) {
      transporter.totalPaid += amount;
      transporter.outstandingPayable = Math.max(0, transporter.totalPayable - transporter.totalPaid);
    }

    if (bookingId) {
      const booking = db.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.transporterPaidAmount += amount;
        if (booking.transporterPaidAmount >= booking.transporterRate) {
          booking.transporterPaymentStatus = 'Paid';
        } else if (booking.transporterPaidAmount > 0) {
          booking.transporterPaymentStatus = 'Partial';
        }
      }
    }
  }

  writeDB(db);
  res.status(201).json(payment);
});

// ==================== MANUAL LEFTOVERS / ADJUSTMENTS ====================
app.get('/api/leftovers', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.leftovers || []);
});

app.post('/api/leftovers', (req: Request, res: Response) => {
  const db = readDB();
  if (!db.leftovers) db.leftovers = [];

  const amount = Number(req.body.amount) || 0;
  const partyType = req.body.partyType as 'CLIENT' | 'TRANSPORTER';
  const partyName = req.body.partyName || '';
  const bookingId = req.body.bookingId;
  const category = req.body.category || 'OTHER';

  const entry: LeftoverAdjustment = {
    id: `LFT-${Math.floor(1000 + Math.random() * 9000)}`,
    partyType,
    partyName,
    category,
    amount,
    date: req.body.date || new Date().toISOString().split('T')[0] || '2026-10-10',
    notes: req.body.notes || '',
    bookingId,
    createdAt: new Date().toISOString(),
  };

  db.leftovers.unshift(entry);

  if (partyType === 'CLIENT') {
    const client = db.clients.find(c => c.name.toLowerCase() === partyName.toLowerCase());
    if (client) {
      client.totalBilled += amount;
      client.outstanding += amount;
    }
    if (bookingId) {
      const booking = db.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.clientRate += amount;
        booking.margin = booking.clientRate - booking.transporterRate;
        if (booking.clientPaidAmount < booking.clientRate) {
          booking.clientPaymentStatus = booking.clientPaidAmount > 0 ? 'Partial' : 'Pending';
        }
      }
    }
  }

  if (partyType === 'TRANSPORTER') {
    const transporter = db.transporters.find(t => t.name.toLowerCase() === partyName.toLowerCase());
    if (transporter) {
      transporter.totalPayable += amount;
      transporter.outstandingPayable += amount;
    }
    if (bookingId) {
      const booking = db.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.transporterRate += amount;
        booking.margin = booking.clientRate - booking.transporterRate;
        if (booking.transporterPaidAmount < booking.transporterRate) {
          booking.transporterPaymentStatus = booking.transporterPaidAmount > 0 ? 'Partial' : 'Pending';
        }
      }
    }
  }

  writeDB(db);
  res.status(201).json(entry);
});

// ==================== DOCUMENTS ====================
app.get('/api/documents', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.documents);
});

app.post('/api/documents', (req: Request, res: Response) => {
  const db = readDB();
  const newDoc: DocumentRecord = {
    id: req.body.id || `DOC-${Date.now().toString().slice(-6)}`,
    bookingId: req.body.bookingId || '#1042',
    type: req.body.type || 'Lorry Receipt (LR)',
    client: req.body.client || 'Client',
    date: req.body.date || new Date().toISOString().split('T')[0] || '2026-10-10',
    status: req.body.status || 'Verified',
    fileUrl: req.body.fileUrl || '',
  };

  db.documents.unshift(newDoc);

  // Link doc to booking
  const booking = db.bookings.find(b => b.id === newDoc.bookingId);
  if (booking) {
    const shortType = newDoc.type.includes('LR')
      ? 'LR'
      : newDoc.type.includes('POD')
      ? 'POD'
      : newDoc.type.includes('Invoice')
      ? 'Invoice'
      : 'E-Way Bill';
    if (!booking.documents.includes(shortType)) {
      booking.documents.push(shortType);
    }
  }

  writeDB(db);
  res.status(201).json(newDoc);
});

app.patch('/api/documents/:id', (req: Request, res: Response) => {
  const db = readDB();
  const index = db.documents.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  db.documents[index] = {
    ...db.documents[index],
    ...req.body,
  };

  writeDB(db);
  res.json(db.documents[index]);
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const db = readDB();
  const index = db.documents.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const [removed] = db.documents.splice(index, 1);
  writeDB(db);
  res.json({ message: 'Document deleted successfully', id: removed?.id || req.params.id });
});

// ==================== FUEL SLIPS (Driver Diesel Tracker) ====================
app.get('/api/fuel-slips', (req: Request, res: Response) => {
  const db = readDB();
  const slips = db.fuelSlips || [];
  const { tripId, vehicleNo } = req.query;

  let filtered = slips;
  if (tripId && typeof tripId === 'string') {
    filtered = filtered.filter(s => s.tripId.toLowerCase() === tripId.toLowerCase());
  }
  if (vehicleNo && typeof vehicleNo === 'string') {
    filtered = filtered.filter(s => s.vehicleNo.toLowerCase().replace(/\s+/g, '') === vehicleNo.toLowerCase().replace(/\s+/g, ''));
  }

  res.json(filtered);
});

app.post('/api/fuel-slips', (req: Request, res: Response) => {
  const db = readDB();
  if (!db.fuelSlips) db.fuelSlips = [];

  const liters = Number(req.body.liters) || 0;
  const ratePerLiter = Number(req.body.ratePerLiter) || 0;
  const totalAmount = Number(req.body.totalAmount) || Math.round(liters * ratePerLiter);

  const newSlip: FuelSlip = {
    id: req.body.id || `FS-${Math.floor(100 + Math.random() * 900)}`,
    tripId: req.body.tripId || '',
    vehicleNo: req.body.vehicleNo || '',
    pumpName: req.body.pumpName || 'Highway Fuel Station',
    slipNo: req.body.slipNo || `SLIP-${Date.now().toString().slice(-5)}`,
    date: req.body.date || new Date().toISOString().split('T')[0] || '2026-10-10',
    liters,
    ratePerLiter,
    totalAmount,
    odometerReading: req.body.odometerReading ? Number(req.body.odometerReading) : undefined,
    paymentMode: req.body.paymentMode || 'FLEET_CARD',
    driverName: req.body.driverName || '',
    notes: req.body.notes || '',
    createdAt: new Date().toISOString(),
  };

  db.fuelSlips.unshift(newSlip);

  // If slip is linked to a trip, update trip actual diesel expense or advances
  if (newSlip.tripId) {
    const trip = db.trips.find(t => t.id === newSlip.tripId);
    if (trip) {
      if (trip.expenses) {
        trip.expenses.actualDiesel = (trip.expenses.actualDiesel || 0) + newSlip.totalAmount;
      }
    }
  }

  writeDB(db);
  res.status(201).json(newSlip);
});

app.delete('/api/fuel-slips/:id', (req: Request, res: Response) => {
  const db = readDB();
  if (!db.fuelSlips) db.fuelSlips = [];

  const index = db.fuelSlips.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Fuel slip not found' });
  }

  const removed = db.fuelSlips.splice(index, 1)[0];
  writeDB(db);
  res.json({ success: true, removed });
});

// ==================== STATS ====================
app.get('/api/stats', (_req: Request, res: Response) => {
  const db = readDB();
  const totalReceivable = db.clients.reduce((acc, c) => acc + (c.outstanding || 0), 0);
  const totalPayable = db.transporters.reduce((acc, t) => acc + (t.outstandingPayable || 0), 0);
  const totalMargin = db.bookings.reduce((acc, b) => acc + (b.margin || 0), 0);
  const upcomingTripsCount = db.trips.filter(t => t.status !== 'Closed').length;
  const pendingVehiclesCount = db.requirements.filter(r => r.status !== 'Arranged').length;
  const overduePaymentsCount = db.clients.filter(c => c.outstanding > 0).length;

  res.json({
    totalReceivable,
    totalPayable,
    totalMargin,
    upcomingTripsCount,
    pendingVehiclesCount,
    overduePaymentsCount,
  });
});

// ==================== SYSTEM & DATA MANAGEMENT ====================
app.post('/api/system/clear-data', (req: Request, res: Response) => {
  const { scope = 'all' } = req.body;
  const db = readDB();

  if (scope === 'all') {
    db.bookings = [];
    db.trips = [];
    db.clients = [];
    db.transporters = [];
    db.requirements = [];
    db.payments = [];
    db.documents = [];
    db.leftovers = [];
    db.fuelSlips = [];
  } else if (scope === 'transactions_only') {
    // Clear bookings, trips, payments, leftovers, fuel slips, requirements, documents
    // but keep client and transporter directories with zeroed balances
    db.bookings = [];
    db.trips = [];
    db.requirements = [];
    db.payments = [];
    db.documents = [];
    db.leftovers = [];
    db.fuelSlips = [];

    db.clients.forEach(c => {
      c.totalBilled = 0;
      c.totalPaid = 0;
      c.outstanding = 0;
    });
    db.transporters.forEach(t => {
      t.totalPayable = 0;
      t.totalPaid = 0;
      t.outstandingPayable = 0;
    });
  } else if (scope === 'parties_only') {
    db.clients = [];
    db.transporters = [];
  }

  writeDB(db);
  res.json({ success: true, message: `System data (${scope}) cleared successfully.`, db });
});

app.post('/api/system/reset-demo', (_req: Request, res: Response) => {
  const freshSeed: DBData = JSON.parse(JSON.stringify(initialSeed));
  writeDB(freshSeed);
  res.json({ success: true, message: 'Demo test data restored successfully.', db: freshSeed });
});

app.post('/api/system/restore-backup', (req: Request, res: Response) => {
  const { backup } = req.body;
  if (!backup || typeof backup !== 'object') {
    return res.status(400).json({ error: 'Invalid backup data format' });
  }
  const cleanDB: DBData = {
    bookings: Array.isArray(backup.bookings) ? backup.bookings : [],
    trips: Array.isArray(backup.trips) ? backup.trips : [],
    clients: Array.isArray(backup.clients) ? backup.clients : [],
    transporters: Array.isArray(backup.transporters) ? backup.transporters : [],
    requirements: Array.isArray(backup.requirements) ? backup.requirements : [],
    payments: Array.isArray(backup.payments) ? backup.payments : [],
    documents: Array.isArray(backup.documents) ? backup.documents : [],
    leftovers: Array.isArray(backup.leftovers) ? backup.leftovers : [],
    fuelSlips: Array.isArray(backup.fuelSlips) ? backup.fuelSlips : [],
  };
  writeDB(cleanDB);
  res.json({ success: true, message: 'Backup restored successfully.', db: cleanDB });
});

app.get('/api/system/export-backup', (_req: Request, res: Response) => {
  const db = readDB();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="lohan-logistics-backup-${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(db, null, 2));
});

const server = app.listen(Number(port), '0.0.0.0', () => {
  console.log(`LohanLogistics backend server is running on http://0.0.0.0:${port}`);
});
