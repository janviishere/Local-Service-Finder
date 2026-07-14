import { CheckCircle2, Clock, MapPin, Search } from 'lucide-react';

const STATUS_FLOW = ['Upcoming', 'Confirmed', 'In Progress', 'Completed'];

export default function BookingTimeline({ currentStatus }) {
  // Determine which step we are on (0 to 3). If cancelled, we don't show the normal flow.
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  const isCancelled = currentStatus === 'Cancelled';

  if (isCancelled) {
    return (
      <div className="w-full py-4 px-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-red-600 dark:text-red-400">Booking Cancelled</h4>
          <p className="text-sm text-red-500/80">This service request has been cancelled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full z-0"></div>

        {/* Active Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-royal-blue rounded-full z-0 transition-all duration-500"
          style={{ width: `${(Math.max(0, currentIndex) / (STATUS_FLOW.length - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        {STATUS_FLOW.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;

          let Icon = Search;
          if (status === 'Upcoming') Icon = Clock;
          if (status === 'Confirmed') Icon = CheckCircle2;
          if (status === 'In Progress') Icon = MapPin;
          if (status === 'Completed') Icon = CheckCircle2;

          return (
            <div key={status} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isCompleted
                    ? 'bg-royal-blue border-royal-blue text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                } ${isActive ? 'scale-110' : ''}`}
              >
                <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
              </div>
              <span
                className={`text-xs font-bold whitespace-nowrap absolute -bottom-6 ${
                  isActive ? 'text-royal-blue' : 'text-slate-500'
                }`}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
