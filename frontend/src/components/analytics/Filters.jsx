import React from 'react';

export default function Filters({ blocks = [], categories = [], filters, setFilters }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm">Time</label>
        <select className="px-3 py-2 rounded-md border" value={filters.range} onChange={(e) => setFilters(s => ({ ...s, range: e.target.value }))}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="180">Last 6 months</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm">Block</label>
        <select className="px-3 py-2 rounded-md border" value={filters.block} onChange={(e) => setFilters(s => ({ ...s, block: e.target.value }))}>
          <option value="all">All Blocks</option>
          {blocks.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm">Category</label>
        <select className="px-3 py-2 rounded-md border" value={filters.category} onChange={(e) => setFilters(s => ({ ...s, category: e.target.value }))}>
          <option value="all">All</option>
          {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>
    </div>
  );
}
