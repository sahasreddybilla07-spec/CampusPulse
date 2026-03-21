// analyticsData.js
// Realistic dummy data structure for CampusPulse analytics
export const analyticsData = {
  summary: {
    totalComplaints: 1245,
    receivedThisWeek: 48,
    receivedThisMonth: 210,
    resolved: 980,
    pending: 200,
    rejected: 65,
    avgResolutionHours: 36.5,
    trend: {
      totalComplaints: 2.4,
      resolved: -1.2,
      pending: 5.1,
    }
  },

  blocks: [
    { name: 'A', complaints: 120 },
    { name: 'B', complaints: 210 },
    { name: 'C', complaints: 95 },
    { name: 'D', complaints: 165 },
    { name: 'E', complaints: 85 },
    { name: 'F', complaints: 50 },
  ],

  categories: [
    { name: 'Hostel', Pending: 80, Resolved: 420, Rejected: 10 },
    { name: 'Academic', Pending: 30, Resolved: 220, Rejected: 20 },
    { name: 'Transport', Pending: 20, Resolved: 80, Rejected: 5 },
    { name: 'Mess', Pending: 40, Resolved: 110, Rejected: 15 },
    { name: 'Other', Pending: 30, Resolved: 150, Rejected: 15 },
  ],

  statusDistribution: [
    { name: 'Pending', value: 200 },
    { name: 'Resolved', value: 980 },
    { name: 'Rejected', value: 65 },
  ],

  trends: Array.from({ length: 30 }).map((_, i) => ({
    day: `D${i + 1}`,
    complaints: Math.round(20 + 15 * Math.sin(i / 4) + Math.random() * 15),
  })),

  resolutionTime: Array.from({ length: 12 }).map((_, i) => ({
    month: `M${i + 1}`,
    avgHours: Math.round(48 - i * 2 + Math.random() * 8),
  })),
};

export default analyticsData;
