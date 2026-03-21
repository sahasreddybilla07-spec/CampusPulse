import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function CategoryStackedChart({ data = [] }) {
  return (
    <div className="bg-white dark:bg-slate-800/70 rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-medium mb-2">Complaints by Category & Status</h3>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Pending" stackId="a" fill="#F59E0B" />
            <Bar dataKey="Resolved" stackId="a" fill="#10B981" />
            <Bar dataKey="Rejected" stackId="a" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
