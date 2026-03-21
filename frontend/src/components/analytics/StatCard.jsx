import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function StatCard({ title, value, sub, trend = 0, icon: Icon }) {
  const isPos = trend >= 0;
  return (
    <div className="bg-white dark:bg-slate-800/70 rounded-xl shadow-sm p-4 hover:shadow-lg transition-transform transform hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 text-white">
            {Icon ? <Icon size={18} /> : null}
          </div>
          <div>
            <div className="text-xs text-slate-500">{title}</div>
            <div className="text-2xl font-semibold">{value}</div>
          </div>
        </div>

        <div className="text-right">
          <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${isPos ? 'text-green-600' : 'text-red-600'}`}>
            {isPos ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            <span className="ml-1 font-medium">{Math.abs(trend)}%</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">{sub}</div>
        </div>
      </div>
    </div>
  );
}
