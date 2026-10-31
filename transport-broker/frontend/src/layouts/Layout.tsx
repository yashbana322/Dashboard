import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Settings, Bell, LayoutGrid, ListTodo, Users, Truck, IndianRupee, Calendar as CalendarIcon, FileText, Building2, Menu, X, PanelLeftClose, PanelLeft, Database } from 'lucide-react';
import { format } from 'date-fns';
import DataManagementModal from '../components/DataManagementModal';

export default function Layout() {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [operatorName, setOperatorName] = useState(() => {
    return localStorage.getItem('ll_operator_name') || 'Lohan Logistics';
  });

  const handleUpdateOperatorName = (newName: string) => {
    setOperatorName(newName);
    localStorage.setItem('ll_operator_name', newName);
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('ll_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('ll_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Keyboard shortcut: Ctrl + B / Cmd + B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: 'Overview', path: '/', icon: LayoutGrid, exact: true },
    { 
      title: 'OPERATIONS',
      items: [
        { name: 'Bookings', path: '/bookings', icon: FileText },
        { name: 'Trips', path: '/trips', icon: Truck },
        { name: 'Requirements', path: '/requirements', icon: ListTodo },
        { name: 'Parties & Clients', path: '/clients', icon: Building2 },
        { name: 'Transporters / Fleet', path: '/transporters', icon: Users },
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Receivables', path: '/receivables', icon: IndianRupee },
        { name: 'Payables', path: '/payables', icon: IndianRupee },
      ]
    },
    {
      title: 'TOOLS',
      items: [
        { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
        { name: 'Documents', path: '/documents', icon: FileText },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#f9fafb] text-[#111827] font-sans selection:bg-gray-200 overflow-hidden">
      {/* Mobile Backdrop Overlay */}
      {isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-40 lg:hidden transition-mechanical"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Slidable + Mobile Slide-out) */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col z-40 shadow-[4px_0_24px_rgba(0,0,0,0.01)] transition-all duration-300 ease-in-out ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isSidebarCollapsed ? 'lg:-ml-64 lg:pointer-events-none' : 'lg:ml-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <NavLink to="/" className="flex items-center gap-3 min-w-0 group">
            <div className="w-9 h-9 rounded-lg bg-[#221f20] flex items-center justify-center p-1 shadow-sm shrink-0 border border-gray-800 transition-mechanical group-hover:scale-105">
              <img src="/logo-circle.png" alt="Lohan Logistics Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight text-gray-900 leading-tight group-hover:text-black transition-colors truncate">
                LohanLogistics
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase truncate">
                Transport & Brokerage
              </span>
            </div>
          </NavLink>
          <div className="flex items-center gap-1">
            {/* Desktop Collapse Button */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-mechanical"
              title="Collapse Sidebar (Ctrl+B)"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsMobileNavOpen(false)} 
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6">
          {/* Main Overview Link */}
          <div className="px-3">
            <NavLink
              to="/"
              className={() =>
                `group relative flex items-center gap-3 px-3 py-2 text-sm font-medium transition-mechanical ${
                  location.pathname === '/' 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              <div className={`absolute inset-0 rounded-md transition-mechanical ${location.pathname === '/' ? 'bg-gray-100' : 'group-hover:bg-gray-50'}`}></div>
              {location.pathname === '/' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gray-900 rounded-r-sm"></div>}
              <LayoutGrid className="w-4 h-4 relative z-10" />
              <span className="relative z-10 font-medium">Overview</span>
            </NavLink>
          </div>

          {/* Grouped Navigation */}
          {navigation.slice(1).map((group, idx) => (
            <div key={idx} className="px-3">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items?.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2 text-sm font-medium transition-mechanical ${
                        isActive
                          ? 'text-gray-900 font-semibold'
                          : 'text-gray-500 hover:text-gray-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`absolute inset-0 rounded-md transition-mechanical ${isActive ? 'bg-gray-100' : 'group-hover:bg-gray-50'}`}></div>
                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gray-900 rounded-r-sm"></div>}
                        <item.icon className="w-4 h-4 opacity-75 relative z-10 group-hover:opacity-100 transition-mechanical" />
                        <span className="relative z-10">{item.name}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* User / Settings Footer */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => setIsDataModalOpen(true)}
            className="flex items-center gap-3 w-full px-2 py-2 text-left hover:bg-gray-50 transition-mechanical rounded-md group"
            title="System Settings & Clear Test Data"
          >
            <div className="w-8 h-8 rounded bg-gray-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-black transition-mechanical">
              LL
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">{operatorName}</p>
              <p className="text-xs text-gray-500">Operations & Dispatch</p>
            </div>
            <Settings className="w-4 h-4 text-gray-400 group-hover:rotate-45 transition-mechanical shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f9fafb] relative overflow-hidden transition-all duration-300">
        <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none"></div>
        
        {/* Top Header */}
        <header className="h-14 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-3 md:px-8 z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-1.5 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-mechanical shrink-0"
              aria-label="Open Navigation"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Branding */}
            <NavLink to="/" className="flex items-center gap-1.5 lg:hidden min-w-0">
              <img src="/logo-circle.png" alt="Logo" className="w-6 h-6 object-contain rounded-xs shrink-0" />
              <span className="font-bold text-xs tracking-tight text-gray-900 truncate">LohanLogistics</span>
            </NavLink>

            {/* Desktop Slide Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-mechanical btn-press shadow-2xs"
              title={isSidebarCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
            >
              {isSidebarCollapsed ? (
                <>
                  <PanelLeft className="w-4 h-4 text-gray-700" />
                  <span className="flex items-center gap-1.5">
                    <img src="/logo-circle.png" alt="Logo" className="w-3.5 h-3.5 object-contain rounded-xs" />
                    <span>Show Menu</span>
                  </span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 text-gray-600" />
                  <span>Hide Sidebar</span>
                </>
              )}
            </button>

            <div className="hidden sm:block text-xs md:text-sm font-medium text-gray-500 truncate">
              {format(new Date(), 'EEEE, d MMMM yyyy')}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs font-semibold rounded-md border border-gray-200 transition-mechanical btn-press shadow-2xs"
              title="Clear test data, backup records, or view multi-device access"
            >
              <Database className="w-3.5 h-3.5 text-gray-600" />
              <span className="hidden sm:inline">Data</span>
              <span className="hidden md:inline">Management</span>
            </button>
            <span className="hidden md:inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded border border-emerald-200">
              Active
            </span>
            <button className="relative text-gray-400 hover:text-gray-600 transition-mechanical p-1.5 hover:bg-gray-100 rounded-md btn-press">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gray-900 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto relative z-10 touch-scroll">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl 2xl:max-w-[1720px] w-full mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 pb-24 lg:pb-8">
            <Outlet />
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar (Android / Touch Optimized) */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-30 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-5 h-14 items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center h-full py-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-gray-950 font-bold' : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              <LayoutGrid className="w-4 h-4 mb-0.5" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center h-full py-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-gray-950 font-bold' : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              <FileText className="w-4 h-4 mb-0.5" />
              <span>Loads</span>
            </NavLink>

            <NavLink
              to="/trips"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center h-full py-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-gray-950 font-bold' : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              <Truck className="w-4 h-4 mb-0.5" />
              <span>Trips</span>
            </NavLink>

            <NavLink
              to="/clients"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center h-full py-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-gray-950 font-bold' : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              <Building2 className="w-4 h-4 mb-0.5" />
              <span>Parties</span>
            </NavLink>

            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="flex flex-col items-center justify-center h-full py-1 text-[10px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Menu className="w-4 h-4 mb-0.5" />
              <span>More</span>
            </button>
          </div>
        </nav>

        {/* Data & System Management Modal */}
        <DataManagementModal
          isOpen={isDataModalOpen}
          onClose={() => setIsDataModalOpen(false)}
          operatorName={operatorName}
          onUpdateOperatorName={handleUpdateOperatorName}
        />
      </main>
    </div>
  );
}
