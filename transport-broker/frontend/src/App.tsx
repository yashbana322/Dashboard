import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Trips from './pages/Trips';
import Transporters from './pages/Transporters';
import Clients from './pages/Clients';
import CalendarView from './pages/CalendarView';
import Requirements from './pages/Requirements';
import Receivables from './pages/Receivables';
import Payables from './pages/Payables';
import Documents from './pages/Documents';

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="trips" element={<Trips />} />
            <Route path="requirements" element={<Requirements />} />
            <Route path="transporters" element={<Transporters />} />
            <Route path="clients" element={<Clients />} />
            <Route path="receivables" element={<Receivables />} />
            <Route path="payables" element={<Payables />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="documents" element={<Documents />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
