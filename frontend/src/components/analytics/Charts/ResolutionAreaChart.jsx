import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ResolutionAreaChart({ data = [] }) {
  return (
    <div className="bg-white dark:bg-slate-800/70 rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-medium mb-2">Resolution Time Trend (hrs)</h3>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="avgHours" stroke="#7C3AED" fill="#C4B5FD" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
