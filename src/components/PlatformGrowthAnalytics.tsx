import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Globe,
  Zap,
  Users,
  ShoppingCart,
  Award,
} from 'lucide-react';
import { Badge } from '@/pages/components/ui/badge';

interface GrowthMetric {
  label: string;
  value: number;
  change: number;
  unit: string;
  icon: any;
  color: string;
}

interface PlatformStats {
  totalGMV: number;
  totalSuppliers: number;
  totalBuyers: number;
  avgOrderValue: number;
  repeatCustomerRate: number;
  monthlyGrowth: Array<{ month: string; revenue: number; orders: number }>;
  topCategories: Array<{ name: string; percentage: number }>;
}

export default function PlatformGrowthAnalytics() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    // Mock data - in real implementation would fetch from backend
    const mockStats: PlatformStats = {
      totalGMV: 2450000,
      totalSuppliers: 342,
      totalBuyers: 8976,
      avgOrderValue: 4250,
      repeatCustomerRate: 68.5,
      monthlyGrowth: [
        { month: 'Jan', revenue: 150000, orders: 45 },
        { month: 'Feb', revenue: 185000, orders: 52 },
        { month: 'Mar', revenue: 220000, orders: 61 },
        { month: 'Apr', revenue: 245000, orders: 68 },
        { month: 'May', revenue: 290000, orders: 76 },
        { month: 'Jun', revenue: 360000, orders: 92 },
      ],
      topCategories: [
        { name: 'Steel & Metal', percentage: 28 },
        { name: 'Construction', percentage: 22 },
        { name: 'Electrical', percentage: 18 },
        { name: 'Plumbing', percentage: 15 },
        { name: 'Other', percentage: 17 },
      ],
    };

    setStats(mockStats);

    const metrics: GrowthMetric[] = [
      {
        label: 'Platform GMV',
        value: mockStats.totalGMV,
        change: 45.2,
        unit: '$',
        icon: ShoppingCart,
        color: 'from-green-600 to-emerald-600',
      },
      {
        label: 'Total Suppliers',
        value: mockStats.totalSuppliers,
        change: 23.5,
        unit: '',
        icon: Users,
        color: 'from-blue-600 to-cyan-600',
      },
      {
        label: 'Total Buyers',
        value: mockStats.totalBuyers,
        change: 62.1,
        unit: '',
        icon: Globe,
        color: 'from-purple-600 to-pink-600',
      },
      {
        label: 'Avg Order Value',
        value: mockStats.avgOrderValue,
        change: 18.3,
        unit: '$',
        icon: Award,
        color: 'from-yellow-600 to-orange-600',
      },
    ];

    setGrowthMetrics(metrics);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Header */}
      <div className="glass-card border-2 border-primary/30 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Platform Growth Analytics</h2>
          <Badge className="ml-auto bg-primary/20 text-primary border-0">Real-Time Metrics</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Comprehensive platform performance and market intelligence
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {growthMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div
              key={idx}
              className="glass-card border-2 border-white/20 hover:border-primary/30 p-5 rounded-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              ></div>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">
                    {metric.label}
                  </span>
                  <Icon className="w-5 h-5 text-primary opacity-60" />
                </div>

                {/* Value */}
                <div className="mb-3">
                  <div className="text-2xl font-bold text-foreground">
                    {metric.unit}
                    {formatNumber(metric.value)}
                  </div>
                </div>

                {/* Growth */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                    +{metric.change}% this month
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Trend Chart */}
      {stats && (
        <div className="glass-card border-2 border-white/20 p-6 rounded-2xl">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Monthly Revenue Trend
          </h3>

          {/* Chart Bar Visualization */}
          <div className="space-y-3">
            {stats.monthlyGrowth.map((month, idx) => {
              const maxRevenue = Math.max(...stats.monthlyGrowth.map(m => m.revenue));
              const percentage = (month.revenue / maxRevenue) * 100;
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{month.month}</span>
                    <div className="flex gap-4 text-xs">
                      <span className="text-muted-foreground">${(month.revenue / 1000).toFixed(0)}K</span>
                      <span className="text-primary font-semibold">{month.orders} orders</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Insights */}
          <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 rounded-lg">
            <p className="text-xs text-blue-900 dark:text-blue-300">
              📈 Revenue grew {((stats.monthlyGrowth[5].revenue - stats.monthlyGrowth[0].revenue) / stats.monthlyGrowth[0].revenue * 100).toFixed(1)}% from January to June, with consistent month-over-month growth
            </p>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {stats && (
        <div className="glass-card border-2 border-white/20 p-6 rounded-2xl">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Market Category Distribution
          </h3>

          <div className="space-y-3">
            {stats.topCategories.map((category, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                  <Badge className="bg-primary/20 text-primary border-0 text-xs font-semibold">
                    {category.percentage}%
                  </Badge>
                </div>
                <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Repeat Customer Rate */}
          <div className="glass-card border-2 border-emerald-200/50 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-200">Repeat Customer Rate</h4>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">{stats.repeatCustomerRate}%</div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              Customers making multiple purchases
            </p>
          </div>

          {/* Supplier Performance */}
          <div className="glass-card border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200">Active Suppliers</h4>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalSuppliers}</div>
            <p className="text-xs text-blue-800 dark:text-blue-300">
              Average {(stats.totalGMV / stats.totalSuppliers / 1000).toFixed(1)}K per supplier
            </p>
          </div>

          {/* Market Health */}
          <div className="glass-card border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-purple-900 dark:text-purple-200">Market Health</h4>
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">Excellent</div>
            <p className="text-xs text-purple-800 dark:text-purple-300">
              Platform showing strong growth trajectory
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
