import React from 'react';

function Mini({ title, value }) {
  return (
    <div className="bg-white dark:bg-slate-800/70 rounded-lg p-3 shadow-sm">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}

export default function Insights({ data = {} }) {
  const { blocks = [], categories = [], summary = {} } = data;
  const problematic = blocks.reduce((a, b) => (b.complaints > (a.complaints || 0) ? b : a), {}) || {};
  const slowest = categories.reduce((a, b) => ((b.Pending || 0) > (a.Pending || 0) ? b : a), {}) || {};
  const fastest = categories.reduce((a, b) => ((b.Resolved || 0) < (a.Resolved || Infinity) ? b : a), {}) || {};
  const peak = { day: 'Friday', hour: '18:00' };
  const efficiency = summary.totalComplaints ? Math.round((summary.resolved || 0) / summary.totalComplaints * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Mini title="Most Problematic Block" value={problematic.name || 'N/A'} />
      <Mini title="Fastest Resolving Dept" value={fastest.name || 'N/A'} />
      <Mini title="Slowest Resolving Category" value={slowest.name || 'N/A'} />
      <Mini title="Peak Complaint Time" value={`${peak.day} • ${peak.hour}`} />
      <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white dark:bg-slate-800/70 rounded-lg p-4 shadow-sm">
        <div className="text-sm text-slate-500">Resolution Efficiency</div>
        <div className="text-2xl font-semibold mt-2">{efficiency}%</div>
        <div className="text-xs text-slate-400 mt-2">Resolved vs total complaints</div>
      </div>
    </div>
  );
}
