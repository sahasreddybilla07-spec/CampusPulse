import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import StatCard from './StatCard';
import Filters from './Filters';
import Insights from './Insights';
import BlockBarChart from './Charts/BlockBarChart';
import StatusPieChart from './Charts/StatusPieChart';
import TrendLineChart from './Charts/TrendLineChart';
import CategoryStackedChart from './Charts/CategoryStackedChart';
import ResolutionAreaChart from './Charts/ResolutionAreaChart';
import data from '../../data/analyticsData';
import { FileText, Download, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ range: '30', block: 'all', category: 'all' });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const copy = JSON.parse(JSON.stringify(data));
    if (filters.block !== 'all') copy.blocks = copy.blocks.filter(b => b.name === filters.block);
    if (filters.category !== 'all') copy.categories = copy.categories.filter(c => c.name === filters.category);
    const range = Number(filters.range || 30);
    copy.trends = data.trends.slice(Math.max(0, data.trends.length - range));
    return copy;
  }, [filters]);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-slate-500">CampusPulse — actionable insights</p>
        </div>
        <div className="w-full md:w-auto">
          <Filters blocks={data.blocks} categories={data.categories} filters={filters} setFilters={setFilters} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-1/3 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard title="Total Complaints" value={filtered.summary.totalComplaints} sub="vs last week" trend={filtered.summary.trend.totalComplaints} icon={FileText} />
            <StatCard title="Received (This Month)" value={filtered.summary.receivedThisMonth} sub="vs last month" trend={5.2} icon={Download} />
            <StatCard title="Resolved" value={filtered.summary.resolved} sub="vs last week" trend={filtered.summary.trend.resolved} icon={CheckCircle} />
            <StatCard title="Pending" value={filtered.summary.pending} sub="currently pending" trend={filtered.summary.trend.pending} icon={Clock} />
            <StatCard title="Rejected" value={filtered.summary.rejected} sub="administrative" trend={-0.6} icon={XCircle} />
            <StatCard title="Avg Resolution (hrs)" value={`${filtered.summary.avgResolutionHours}h`} sub="rolling average" trend={-3.4} icon={Clock} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <BlockBarChart data={filtered.blocks} />
              <TrendLineChart data={filtered.trends} />
            </div>
            <div className="space-y-4">
              <StatusPieChart data={filtered.statusDistribution} />
              <ResolutionAreaChart data={filtered.resolutionTime} />
            </div>
          </div>

          <div>
            <CategoryStackedChart data={filtered.categories} />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Insights</h2>
            <Insights data={filtered} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
