import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function CalendarView() {
  const { requirements, bookings } = useData();
  const [selectedDate, setSelectedDate] = useState(10);

  // Month days for October 2026
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Count requirements & bookings per day
  const dayCounts: Record<number, number> = {
    8: 2,
    9: 3,
    10: 4,
    11: 2,
    12: 1,
    15: 3,
  };

  // Requirements & bookings mapped
  const currentItems = [
    ...requirements.map(r => ({
      time: r.time,
      route: r.route,
      client: r.client,
      vehicle: r.vehicle,
      status: r.status,
      isSuccess: r.status === 'Arranged',
    })),
    ...bookings.map(b => ({
      time: b.pickupTime,
      route: b.route,
      client: b.client,
      vehicle: `${b.vehicleNo} (${b.vehicleType})`,
      status: b.status,
      isSuccess: b.status === 'Completed' || b.status === 'Delivered' || b.status === 'Arranged',
    })),
  ];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Calendar Schedule</h1>
        <p className="text-sm text-gray-500 mt-1">Vehicle requirements and scheduled dispatches by date.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Calendar Left */}
        <div>
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-lg font-semibold text-gray-900">October 2026</h2>
            <div className="flex items-center gap-2">
              <button className="p-1 text-gray-400 hover:text-gray-900 transition-mechanical">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-900 transition-mechanical">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-3 sm:gap-y-6 text-center">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
              <div key={d} className="text-xs font-semibold text-gray-400">
                {d}
              </div>
            ))}

            {/* Offset for Oct 2026 starts on Thursday */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {days.map((d) => (
              <div
                key={d}
                className="relative flex flex-col items-center cursor-pointer group"
                onClick={() => setSelectedDate(d)}
              >
                <span
                  className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full transition-mechanical ${
                    selectedDate === d
                      ? 'bg-gray-900 text-white shadow-md transform scale-105'
                      : 'text-gray-900 hover:bg-gray-100 hover:scale-105'
                  }`}
                >
                  {d}
                </span>
                {dayCounts[d] && (
                  <div className="absolute -bottom-3 flex items-center gap-1 text-[10px] font-bold text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    {dayCounts[d]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Requirements Right */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3 flex items-center justify-between">
            <span>{selectedDate} October 2026</span>
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
              {currentItems.length} Dispatches & Requirements
            </span>
          </h2>

          <div key={selectedDate} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {currentItems.slice(0, 5).map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 text-sm p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-white hover:shadow-2xs transition-mechanical"
              >
                <span className="font-mono text-gray-500 shrink-0 w-16 pt-0.5 text-xs">{item.time}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.client}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.route}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="font-medium text-gray-700 text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {item.vehicle}
                    </span>
                    {item.isSuccess ? (
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                        <Check className="w-3.5 h-3.5" />
                        {item.status}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-800 font-semibold text-xs">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
