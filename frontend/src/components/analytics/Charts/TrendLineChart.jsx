import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function TrendLineChart({ data = [] }) {
  return (
    <div className="bg-white dark:bg-slate-800/70 rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-medium mb-2">Complaints Over Time</h3>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="complaints" stroke="#06B6D4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
