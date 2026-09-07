import React from 'react';
import { CheckCircle2, AlertCircle, HeartPulse, UserX, Palmtree, Users } from 'lucide-react';

interface StatsOverviewProps {
  totalEmployees: number;
  totalH: number;
  totalS: number;
  totalI: number;
  totalA: number;
  totalC: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalEmployees,
  totalH,
  totalS,
  totalI,
  totalA,
  totalC,
}) => {
  const cards = [
    {
      label: 'Total Karyawan',
      val: totalEmployees,
      icon: Users,
      color: 'text-gray-900',
      bg: 'bg-white',
      border: 'border-gray-200',
      iconBg: 'bg-gray-100 text-gray-700',
    },
    {
      label: 'Total Hadir (H)',
      val: totalH,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200/80',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Sakit (S)',
      val: totalS,
      icon: HeartPulse,
      color: 'text-amber-800',
      bg: 'bg-amber-50/50',
      border: 'border-amber-200/80',
      iconBg: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Izin (I)',
      val: totalI,
      icon: AlertCircle,
      color: 'text-blue-700',
      bg: 'bg-blue-50/50',
      border: 'border-blue-200/80',
      iconBg: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Alpha (A)',
      val: totalA,
      icon: UserX,
      color: 'text-rose-700',
      bg: 'bg-rose-50/50',
      border: 'border-rose-200/80',
      iconBg: 'bg-rose-100 text-rose-700',
    },
    {
      label: 'Cuti (C)',
      val: totalC,
      icon: Palmtree,
      color: 'text-purple-700',
      bg: 'bg-purple-50/50',
      border: 'border-purple-200/80',
      iconBg: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-2xl border ${c.border} ${c.bg} shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                {c.label}
              </span>
              <div className={`p-1.5 rounded-lg ${c.iconBg}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className={`text-2xl font-black tracking-tight ${c.color}`}>
              {c.val.toLocaleString('id-ID')}
            </div>
          </div>
        );
      })}
    </div>
  );
};
