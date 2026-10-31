import React, { createContext, useContext, useState, useEffect } from 'react';

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
  gst?: string;
  pan?: string;
  vehicles: string[];
  routes: string;
  rateType: string;
  rating: number;
  totalPayable: number;
  totalPaid: number;
  outstandingPayable: number;
  notes?: string;
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

interface DataContextType {
  bookings: Booking[];
  trips: Trip[];
  clients: Client[];
  transporters: Transporter[];
  requirements: Requirement[];
  payments: PaymentTransaction[];
  documents: DocumentRecord[];
  fuelSlips: FuelSlip[];
  leftovers: LeftoverAdjustment[];
  isLoading: boolean;
  addBooking: (booking: Partial<Booking>) => Promise<Booking>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  addTrip: (trip: Partial<Trip>) => Promise<Trip>;
  closeTrip: (id: string, expenses: Record<string, number>) => Promise<void>;
  addClient: (client: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  addTransporter: (transporter: Partial<Transporter>) => Promise<Transporter>;
  updateTransporter: (id: string, updates: Partial<Transporter>) => Promise<void>;
  addRequirement: (req: Partial<Requirement>) => Promise<Requirement>;
  convertRequirement: (reqId: string, details: { vehicleNo: string; transporter: string; clientRate: number; transporterRate: number }) => Promise<void>;
  recordPayment: (payment: {
    partyType: 'CLIENT' | 'TRANSPORTER';
    partyName: string;
    amount: number;
    mode: 'UPI' | 'NEFT' | 'CHEQUE' | 'CASH';
    refNo: string;
    date: string;
    notes: string;
    bookingId?: string;
    invoiceId?: string;
  }) => Promise<void>;
  addLeftoverAdjustment: (adj: {
    partyType: 'CLIENT' | 'TRANSPORTER';
    partyName: string;
    category: string;
    amount: number;
    date: string;
    notes: string;
    bookingId?: string;
  }) => Promise<void>;
  addDocument: (doc: Partial<DocumentRecord>) => Promise<DocumentRecord>;
  updateDocument: (id: string, updates: Partial<DocumentRecord>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  addFuelSlip: (slip: Partial<FuelSlip>) => Promise<FuelSlip>;
  deleteFuelSlip: (id: string) => Promise<void>;
  exportCSV: (filename: string, headers: string[], rows: (string | number)[][]) => void;
  copyWhatsAppBooking: (booking: Booking) => void;
  clearData: (scope?: 'all' | 'transactions_only' | 'parties_only') => Promise<void>;
  resetDemoData: () => Promise<void>;
  restoreBackup: (backup: any) => Promise<void>;
  exportBackup: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const getApiBase = () => {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  return `${protocol}//${hostname}:5000/api`;
};

const API_BASE = getApiBase();

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const cached = localStorage.getItem('ll_bookings');
    return cached ? JSON.parse(cached) : [];
  });
  const [trips, setTrips] = useState<Trip[]>(() => {
    const cached = localStorage.getItem('ll_trips');
    return cached ? JSON.parse(cached) : [];
  });
  const [clients, setClients] = useState<Client[]>(() => {
    const cached = localStorage.getItem('ll_clients');
    return cached ? JSON.parse(cached) : [];
  });
  const [transporters, setTransporters] = useState<Transporter[]>(() => {
    const cached = localStorage.getItem('ll_transporters');
    return cached ? JSON.parse(cached) : [];
  });
  const [requirements, setRequirements] = useState<Requirement[]>(() => {
    const cached = localStorage.getItem('ll_requirements');
    return cached ? JSON.parse(cached) : [];
  });
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    const cached = localStorage.getItem('ll_payments');
    return cached ? JSON.parse(cached) : [];
  });
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => {
    const cached = localStorage.getItem('ll_documents');
    return cached ? JSON.parse(cached) : [];
  });
  const [fuelSlips, setFuelSlips] = useState<FuelSlip[]>(() => {
    const cached = localStorage.getItem('ll_fuel_slips');
    return cached ? JSON.parse(cached) : [];
  });
  const [leftovers, setLeftovers] = useState<LeftoverAdjustment[]>(() => {
    const cached = localStorage.getItem('ll_leftovers');
    return cached ? JSON.parse(cached) : [];
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync state to local storage for offline resilience
  useEffect(() => {
    if (bookings.length) localStorage.setItem('ll_bookings', JSON.stringify(bookings));
  }, [bookings]);
  useEffect(() => {
    if (trips.length) localStorage.setItem('ll_trips', JSON.stringify(trips));
  }, [trips]);
  useEffect(() => {
    if (clients.length) localStorage.setItem('ll_clients', JSON.stringify(clients));
  }, [clients]);
  useEffect(() => {
    if (transporters.length) localStorage.setItem('ll_transporters', JSON.stringify(transporters));
  }, [transporters]);
  useEffect(() => {
    if (requirements.length) localStorage.setItem('ll_requirements', JSON.stringify(requirements));
  }, [requirements]);
  useEffect(() => {
    if (payments.length) localStorage.setItem('ll_payments', JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    if (documents.length) localStorage.setItem('ll_documents', JSON.stringify(documents));
  }, [documents]);
  useEffect(() => {
    if (fuelSlips.length) localStorage.setItem('ll_fuel_slips', JSON.stringify(fuelSlips));
  }, [fuelSlips]);
  useEffect(() => {
    if (leftovers.length) localStorage.setItem('ll_leftovers', JSON.stringify(leftovers));
  }, [leftovers]);

  const refreshAll = async () => {
    try {
      const res = await fetch(`${API_BASE}/all`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setTrips(data.trips || []);
        setClients(data.clients || []);
        setTransporters(data.transporters || []);
        setRequirements(data.requirements || []);
        setPayments(data.payments || []);
        setDocuments(data.documents || []);
        setFuelSlips(data.fuelSlips || []);
        setLeftovers(data.leftovers || []);
      }
    } catch (err) {
      console.warn('API sync warning: using local cache', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const addBooking = async (booking: Partial<Booking>): Promise<Booking> => {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      if (res.ok) {
        const created = await res.json();
        setBookings(prev => [created, ...prev]);
        await refreshAll(); // update client/transporter balances
        return created;
      }
    } catch (err) {
      console.error(err);
    }

    // Local fallback
    const fallbackBooking: Booking = {
      id: booking.id || `#${Math.floor(1000 + Math.random() * 9000)}`,
      client: booking.client || 'Client',
      route: booking.route || 'Pune → Mumbai',
      vehicleType: booking.vehicleType || '32 FT Container',
      vehicleNo: booking.vehicleNo || 'Pending',
      transporter: booking.transporter || 'Pending Assignment',
      clientRate: Number(booking.clientRate) || 0,
      transporterRate: Number(booking.transporterRate) || 0,
      margin: (Number(booking.clientRate) || 0) - (Number(booking.transporterRate) || 0),
      pickupDate: booking.pickupDate || new Date().toISOString().split('T')[0] || '2026-10-10',
      pickupTime: booking.pickupTime || '09:00 AM',
      status: booking.status || 'Arranged',
      clientPaymentStatus: 'Pending',
      clientPaidAmount: 0,
      transporterPaymentStatus: 'Pending',
      transporterPaidAmount: 0,
      documents: booking.documents || [],
      notes: booking.notes || '',
      createdAt: new Date().toISOString(),
    };
    setBookings(prev => [fallbackBooking, ...prev]);
    return fallbackBooking;
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
    try {
      await fetch(`${API_BASE}/bookings/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const addTrip = async (trip: Partial<Trip>): Promise<Trip> => {
    try {
      const res = await fetch(`${API_BASE}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });
      if (res.ok) {
        const created = await res.json();
        setTrips(prev => [created, ...prev]);
        return created;
      }
    } catch (err) {
      console.error(err);
    }

    const fallbackTrip: Trip = {
      id: trip.id || `TRP-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicle: trip.vehicle || 'MH 12 AB 0000',
      driverName: trip.driverName || 'Driver',
      driverPhone: trip.driverPhone || '',
      up: trip.up || { route: 'Pune → Delhi', client: '', freight: 0 },
      down: trip.down || { route: 'Waiting for load', client: '-', freight: 0 },
      advances: trip.advances || { driverBhatta: 0, dieselToll: 0 },
      status: 'Up Transit',
      statusType: 'blue',
      createdAt: new Date().toISOString(),
    };
    setTrips(prev => [fallbackTrip, ...prev]);
    return fallbackTrip;
  };

  const closeTrip = async (id: string, expenses: Record<string, number>) => {
    try {
      const res = await fetch(`${API_BASE}/trips/${encodeURIComponent(id)}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenses),
      });
      if (res.ok) {
        const updated = await res.json();
        setTrips(prev => prev.map(t => (t.id === id ? updated : t)));
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // Local fallback
    setTrips(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const totalRevenue = (t.up?.freight || 0) + (t.down?.freight || 0);
        const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
        return {
          ...t,
          status: 'Closed',
          statusType: 'gray',
          closingSummary: {
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            closedAt: new Date().toISOString(),
          },
        };
      })
    );
  };

  const addClient = async (client: Partial<Client>): Promise<Client> => {
    try {
      const res = await fetch(`${API_BASE}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
      if (res.ok) {
        const created = await res.json();
        setClients(prev => [created, ...prev]);
        return created;
      }
    } catch (err) {
      console.error(err);
    }

    const fallbackClient: Client = {
      id: client.id || `CLI-${Math.floor(100 + Math.random() * 900)}`,
      name: client.name || 'New Client',
      contact: client.contact || '',
      phone: client.phone || '',
      email: client.email || '',
      gst: client.gst || '',
      pan: client.pan || (client.gst && client.gst.length >= 12 ? client.gst.substring(2, 12) : ''),
      routes: client.routes || '',
      paymentTerms: client.paymentTerms || 'Net 15 Days',
      joinDate: client.joinDate || new Date().toISOString().split('T')[0] || '2026-10-10',
      creditLimit: client.creditLimit || 500000,
      totalBilled: client.totalBilled || 0,
      totalPaid: client.totalPaid || 0,
      outstanding: client.outstanding || 0,
      address: client.address || '',
      notes: client.notes || '',
    };
    setClients(prev => [fallbackClient, ...prev]);
    return fallbackClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const res = await fetch(`${API_BASE}/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await refreshAll();
        return;
      }
    } catch (err) {
      console.error(err);
    }
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const addTransporter = async (transporter: Partial<Transporter>): Promise<Transporter> => {
    try {
      const res = await fetch(`${API_BASE}/transporters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transporter),
      });
      if (res.ok) {
        const created = await res.json();
        setTransporters(prev => [created, ...prev]);
        return created;
      }
    } catch (err) {
      console.error(err);
    }

    const fallback: Transporter = {
      id: transporter.id || `TRN-${Math.floor(100 + Math.random() * 900)}`,
      name: transporter.name || 'New Transporter',
      phone: transporter.phone || '',
      panGst: transporter.panGst || '',
      vehicles: transporter.vehicles || ['32 FT Container'],
      routes: transporter.routes || '',
      rateType: transporter.rateType || 'Market Rate',
      rating: 4.5,
      totalPayable: transporter.totalPayable || 0,
      totalPaid: transporter.totalPaid || 0,
      outstandingPayable: transporter.outstandingPayable || 0,
      notes: transporter.notes || '',
    };
    setTransporters(prev => [fallback, ...prev]);
    return fallback;
  };

  const updateTransporter = async (id: string, updates: Partial<Transporter>) => {
    try {
      const res = await fetch(`${API_BASE}/transporters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await refreshAll();
        return;
      }
    } catch (err) {
      console.error(err);
    }
    setTransporters(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addRequirement = async (req: Partial<Requirement>): Promise<Requirement> => {
    try {
      const res = await fetch(`${API_BASE}/requirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (res.ok) {
        const created = await res.json();
        setRequirements(prev => [created, ...prev]);
        return created;
      }
    } catch (err) {
      console.error(err);
    }

    const fallback: Requirement = {
      id: req.id || `REQ-${Math.floor(100 + Math.random() * 900)}`,
      date: req.date || 'Today',
      time: req.time || '10:00 AM',
      client: req.client || 'Client',
      route: req.route || 'Source → Destination',
      vehicle: req.vehicle || '32 FT Container',
      status: req.status || 'Vehicle Required',
      statusType: req.status === 'Arranged' ? 'success' : 'warning',
    };
    setRequirements(prev => [fallback, ...prev]);
    return fallback;
  };

  const convertRequirement = async (
    reqId: string,
    details: { vehicleNo: string; transporter: string; clientRate: number; transporterRate: number }
  ) => {
    try {
      const res = await fetch(`${API_BASE}/requirements/${reqId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      if (res.ok) {
        await refreshAll();
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // Local fallback
    setRequirements(prev =>
      prev.map(r => (r.id === reqId ? { ...r, status: 'Arranged', statusType: 'success' } : r))
    );
    const targetReq = requirements.find(r => r.id === reqId);
    if (targetReq) {
      await addBooking({
        client: targetReq.client,
        route: targetReq.route,
        vehicleType: targetReq.vehicle,
        vehicleNo: details.vehicleNo,
        transporter: details.transporter,
        clientRate: details.clientRate,
        transporterRate: details.transporterRate,
        status: 'Arranged',
      });
    }
  };

  const recordPayment = async (paymentData: {
    partyType: 'CLIENT' | 'TRANSPORTER';
    partyName: string;
    amount: number;
    mode: 'UPI' | 'NEFT' | 'CHEQUE' | 'CASH';
    refNo: string;
    date: string;
    notes: string;
    bookingId?: string;
    invoiceId?: string;
  }) => {
    try {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      if (res.ok) {
        await refreshAll();
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // Local fallback
    const newTx: PaymentTransaction = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      ...paymentData,
      createdAt: new Date().toISOString(),
    };
    setPayments(prev => [newTx, ...prev]);

    if (paymentData.partyType === 'CLIENT') {
      setClients(prev =>
        prev.map(c => {
          if (c.name.toLowerCase() === paymentData.partyName.toLowerCase()) {
            const totalPaid = (c.totalPaid || 0) + paymentData.amount;
            return {
              ...c,
              totalPaid,
              outstanding: Math.max(0, c.totalBilled - totalPaid),
            };
          }
          return c;
        })
      );
      if (paymentData.bookingId) {
        setBookings(prev =>
          prev.map(b => {
            if (b.id === paymentData.bookingId) {
              const clientPaidAmount = (b.clientPaidAmount || 0) + paymentData.amount;
              const status = clientPaidAmount >= b.clientRate ? 'Paid' : 'Partial';
              return { ...b, clientPaidAmount, clientPaymentStatus: status };
            }
            return b;
          })
        );
      }
    } else {
      setTransporters(prev =>
        prev.map(t => {
          if (t.name.toLowerCase() === paymentData.partyName.toLowerCase()) {
            const totalPaid = (t.totalPaid || 0) + paymentData.amount;
            return {
              ...t,
              totalPaid,
              outstandingPayable: Math.max(0, t.totalPayable - totalPaid),
            };
          }
          return t;
        })
      );
      if (paymentData.bookingId) {
        setBookings(prev =>
          prev.map(b => {
            if (b.id === paymentData.bookingId) {
              const transporterPaidAmount = (b.transporterPaidAmount || 0) + paymentData.amount;
              const status = transporterPaidAmount >= b.transporterRate ? 'Paid' : 'Partial';
              return { ...b, transporterPaidAmount, transporterPaymentStatus: status };
            }
            return b;
          })
        );
      }
    }
  };

  const addLeftoverAdjustment = async (adj: {
    partyType: 'CLIENT' | 'TRANSPORTER';
    partyName: string;
    category: string;
    amount: number;
    date: string;
    notes: string;
    bookingId?: string;
  }) => {
    try {
      const res = await fetch(`${API_BASE}/leftovers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adj),
      });
      if (res.ok) {
        await refreshAll();
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // Local fallback
    if (adj.partyType === 'CLIENT') {
      setClients(prev =>
        prev.map(c => {
          if (c.name.toLowerCase() === adj.partyName.toLowerCase()) {
            const totalBilled = (c.totalBilled || 0) + adj.amount;
            const outstanding = (c.outstanding || 0) + adj.amount;
            return { ...c, totalBilled, outstanding };
          }
          return c;
        })
      );
      if (adj.bookingId) {
        setBookings(prev =>
          prev.map(b => {
            if (b.id === adj.bookingId) {
              const clientRate = b.clientRate + adj.amount;
              const margin = clientRate - b.transporterRate;
              const clientPaymentStatus = b.clientPaidAmount >= clientRate ? 'Paid' : b.clientPaidAmount > 0 ? 'Partial' : 'Pending';
              return { ...b, clientRate, margin, clientPaymentStatus };
            }
            return b;
          })
        );
      }
    } else {
      setTransporters(prev =>
        prev.map(t => {
          if (t.name.toLowerCase() === adj.partyName.toLowerCase()) {
            const totalPayable = (t.totalPayable || 0) + adj.amount;
            const outstandingPayable = (t.outstandingPayable || 0) + adj.amount;
            return { ...t, totalPayable, outstandingPayable };
          }
          return t;
        })
      );
      if (adj.bookingId) {
        setBookings(prev =>
          prev.map(b => {
            if (b.id === adj.bookingId) {
              const transporterRate = b.transporterRate + adj.amount;
              const margin = b.clientRate - transporterRate;
              const transporterPaymentStatus = b.transporterPaidAmount >= transporterRate ? 'Paid' : b.transporterPaidAmount > 0 ? 'Partial' : 'Pending';
              return { ...b, transporterRate, margin, transporterPaymentStatus };
            }
            return b;
          })
        );
      }
    }
  };

  const addDocument = async (doc: Partial<DocumentRecord>): Promise<DocumentRecord> => {
    try {
      const res = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      if (res.ok) {
        const created = await res.json();
        setDocuments(prev => [created, ...prev]);
        await refreshAll();
        return created;
      }
    } catch (err) {
      console.error(err);
    }

    const fallback: DocumentRecord = {
      id: doc.id || `DOC-${Date.now().toString().slice(-6)}`,
      bookingId: doc.bookingId || '#1042',
      type: doc.type || 'Lorry Receipt (LR)',
      client: doc.client || 'Client',
      date: doc.date || new Date().toISOString().split('T')[0] || '2026-10-10',
      status: doc.status || 'Verified',
      fileUrl: doc.fileUrl || '',
    };
    setDocuments(prev => [fallback, ...prev]);
    return fallback;
  };

  const updateDocument = async (id: string, updates: Partial<DocumentRecord>) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await refreshAll();
        return;
      }
    } catch (err) {
      console.error(err);
    }
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDocument = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshAll();
        return;
      }
    } catch (err) {
      console.error(err);
    }
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addFuelSlip = async (slipData: Partial<FuelSlip>): Promise<FuelSlip> => {
    try {
      const res = await fetch(`${API_BASE}/fuel-slips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slipData),
      });
      if (res.ok) {
        const created = await res.json();
        setFuelSlips(prev => [created, ...prev]);
        await refreshAll();
        return created;
      }
    } catch (err) {
      console.error(err);
    }

    const liters = Number(slipData.liters) || 0;
    const ratePerLiter = Number(slipData.ratePerLiter) || 0;
    const totalAmount = Number(slipData.totalAmount) || Math.round(liters * ratePerLiter);

    const fallback: FuelSlip = {
      id: slipData.id || `FS-${Math.floor(100 + Math.random() * 900)}`,
      tripId: slipData.tripId || '',
      vehicleNo: slipData.vehicleNo || '',
      pumpName: slipData.pumpName || 'Highway Fuel Station',
      slipNo: slipData.slipNo || `SLIP-${Date.now().toString().slice(-5)}`,
      date: slipData.date || new Date().toISOString().split('T')[0] || '2026-10-10',
      liters,
      ratePerLiter,
      totalAmount,
      odometerReading: slipData.odometerReading ? Number(slipData.odometerReading) : undefined,
      paymentMode: slipData.paymentMode || 'FLEET_CARD',
      driverName: slipData.driverName || '',
      notes: slipData.notes || '',
      createdAt: new Date().toISOString(),
    };

    setFuelSlips(prev => [fallback, ...prev]);

    // Update trip if linked
    if (fallback.tripId) {
      setTrips(prev =>
        prev.map(t => {
          if (t.id === fallback.tripId) {
            const curExpenses = t.expenses || {
              actualDiesel: 0,
              tolls: 0,
              driverCharges: 0,
              maintenance: 0,
              other: 0,
            };
            return {
              ...t,
              expenses: {
                ...curExpenses,
                actualDiesel: (curExpenses.actualDiesel || 0) + fallback.totalAmount,
              },
            };
          }
          return t;
        })
      );
    }

    return fallback;
  };

  const deleteFuelSlip = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/fuel-slips/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshAll();
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setFuelSlips(prev => prev.filter(s => s.id !== id));
  };

  const exportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyWhatsAppBooking = (b: Booking) => {
    const text = `*LohanLogistics - Trip Assignment*\n\n` +
      `📦 *Booking ID:* ${b.id}\n` +
      `🏢 *Client:* ${b.client}\n` +
      `📍 *Route:* ${b.route}\n` +
      `🚛 *Vehicle:* ${b.vehicleNo} (${b.vehicleType})\n` +
      `👤 *Transporter:* ${b.transporter}\n` +
      `📅 *Pickup:* ${b.pickupDate} at ${b.pickupTime}\n` +
      `📌 *Status:* ${b.status}\n\n` +
      `_Managed via LohanLogistics Transport Operations_`;

    navigator.clipboard.writeText(text);
  };

  const clearData = async (scope: 'all' | 'transactions_only' | 'parties_only' = 'all') => {
    try {
      const res = await fetch(`${API_BASE}/system/clear-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope }),
      });
      if (res.ok) {
        const result = await res.json();
        const db = result.db;

        if (scope === 'all' || scope === 'transactions_only') {
          localStorage.removeItem('ll_bookings');
          localStorage.removeItem('ll_trips');
          localStorage.removeItem('ll_requirements');
          localStorage.removeItem('ll_payments');
          localStorage.removeItem('ll_documents');
          localStorage.removeItem('ll_fuel_slips');
          localStorage.removeItem('ll_leftovers');
        }
        if (scope === 'all' || scope === 'parties_only') {
          localStorage.removeItem('ll_clients');
          localStorage.removeItem('ll_transporters');
        }

        setBookings(db.bookings || []);
        setTrips(db.trips || []);
        setClients(db.clients || []);
        setTransporters(db.transporters || []);
        setRequirements(db.requirements || []);
        setPayments(db.payments || []);
        setDocuments(db.documents || []);
        setFuelSlips(db.fuelSlips || []);
        setLeftovers(db.leftovers || []);
      }
    } catch (err) {
      console.error('Error clearing data:', err);
      throw err;
    }
  };

  const resetDemoData = async () => {
    try {
      const res = await fetch(`${API_BASE}/system/reset-demo`, {
        method: 'POST',
      });
      if (res.ok) {
        const result = await res.json();
        const db = result.db;

        localStorage.removeItem('ll_bookings');
        localStorage.removeItem('ll_trips');
        localStorage.removeItem('ll_clients');
        localStorage.removeItem('ll_transporters');
        localStorage.removeItem('ll_requirements');
        localStorage.removeItem('ll_payments');
        localStorage.removeItem('ll_documents');
        localStorage.removeItem('ll_fuel_slips');
        localStorage.removeItem('ll_leftovers');

        setBookings(db.bookings || []);
        setTrips(db.trips || []);
        setClients(db.clients || []);
        setTransporters(db.transporters || []);
        setRequirements(db.requirements || []);
        setPayments(db.payments || []);
        setDocuments(db.documents || []);
        setFuelSlips(db.fuelSlips || []);
        setLeftovers(db.leftovers || []);
      }
    } catch (err) {
      console.error('Error resetting demo data:', err);
      throw err;
    }
  };

  const restoreBackup = async (backup: any) => {
    try {
      const res = await fetch(`${API_BASE}/system/restore-backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup }),
      });
      if (res.ok) {
        const result = await res.json();
        const db = result.db;

        localStorage.removeItem('ll_bookings');
        localStorage.removeItem('ll_trips');
        localStorage.removeItem('ll_clients');
        localStorage.removeItem('ll_transporters');
        localStorage.removeItem('ll_requirements');
        localStorage.removeItem('ll_payments');
        localStorage.removeItem('ll_documents');
        localStorage.removeItem('ll_fuel_slips');
        localStorage.removeItem('ll_leftovers');

        setBookings(db.bookings || []);
        setTrips(db.trips || []);
        setClients(db.clients || []);
        setTransporters(db.transporters || []);
        setRequirements(db.requirements || []);
        setPayments(db.payments || []);
        setDocuments(db.documents || []);
        setFuelSlips(db.fuelSlips || []);
        setLeftovers(db.leftovers || []);
      }
    } catch (err) {
      console.error('Error restoring backup:', err);
      throw err;
    }
  };

  const exportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      app: 'LohanLogistics',
      bookings,
      trips,
      clients,
      transporters,
      requirements,
      payments,
      documents,
      fuelSlips,
      leftovers,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lohan-logistics-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DataContext.Provider
      value={{
        bookings,
        trips,
        clients,
        transporters,
        requirements,
        payments,
        documents,
        fuelSlips,
        leftovers,
        isLoading,
        addBooking,
        updateBooking,
        addTrip,
        closeTrip,
        addClient,
        updateClient,
        addTransporter,
        updateTransporter,
        addRequirement,
        convertRequirement,
        recordPayment,
        addLeftoverAdjustment,
        addDocument,
        updateDocument,
        deleteDocument,
        addFuelSlip,
        deleteFuelSlip,
        exportCSV,
        copyWhatsAppBooking,
        clearData,
        resetDemoData,
        restoreBackup,
        exportBackup,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
