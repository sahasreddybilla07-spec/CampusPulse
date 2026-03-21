import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#F59E0B', '#10B981', '#EF4444'];

export default function StatusPieChart({ data = [] }) {
  return (
    <div className="bg-white dark:bg-slate-800/70 rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-medium mb-2">Status Distribution</h3>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
