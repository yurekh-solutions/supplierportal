import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  AlertCircle,
  Zap,
  Globe,
  BarChart3,
  Users,
  Heart,
} from 'lucide-react';
import { Badge } from '@/pages/components/ui/badge';
import { Card } from '@/pages/components/ui/card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface LeadScore {
  leadScore: number;
  confidence: 'high' | 'medium' | 'low';
  recommendations: string[];
}

interface BuyerMetrics {
  totalBuyers: number;
  activeBuyers: number;
  totalInquiries: number;
  avgTimeOnPlatform: number;
  conversionRate: number;
  topBuyerTypes: Array<{ type: string; count: number }>;
}

export default function LeadScoringDashboard() {
  const [leads, setLeads] = useState<LeadScore[]>([]);
  const [metrics, setMetrics] = useState<BuyerMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeadMetrics();
  }, []);

  const fetchLeadMetrics = async () => {
    try {
      setLoading(true);
      // Simulate fetch - in real implementation would connect to backend
      const mockMetrics: BuyerMetrics = {
        totalBuyers: 342,
        activeBuyers: 128,
        totalInquiries: 456,
        avgTimeOnPlatform: 8.5,
        conversionRate: 22.5,
        topBuyerTypes: [
          { type: 'Manufacturing', count: 89 },
          { type: 'Retail', count: 76 },
          { type: 'Wholesale', count: 54 },
          { type: 'Distribution', count: 43 },
        ],
      };
      setMetrics(mockMetrics);

      // Mock lead scores
      const mockLeads: LeadScore[] = [
        {
          leadScore: 92,
          confidence: 'high',
          recommendations: [
            'Schedule follow-up call immediately',
            'Offer premium package discount',
            'Provide dedicated account manager',
          ],
        },
        {
          leadScore: 78,
          confidence: 'high',
          recommendations: [
            'Send product comparison guide',
            'Invite to webinar',
            'Offer trial period',
          ],
        },
        {
          leadScore: 65,
          confidence: 'medium',
          recommendations: [
            'Email nurture sequence',
            'Add to product updates list',
            'Monitor for engagement signals',
          ],
        },
        {
          leadScore: 45,
          confidence: 'medium',
          recommendations: [
            'General product information',
            'Add to newsletter',
            'Re-engage in 30 days',
          ],
        },
      ];
      setLeads(mockLeads);
    } catch (error) {
      console.error('Error fetching lead metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 55) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceBadgeColor = (confidence: string) => {
    if (confidence === 'high') return 'bg-green-100 text-green-800 border-0';
    if (confidence === 'medium') return 'bg-yellow-100 text-yellow-800 border-0';
    return 'bg-orange-100 text-orange-800 border-0';
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Header */}
      <div className="glass-card border-2 border-primary/30 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Lead Scoring Dashboard</h2>
          <Badge className="ml-auto bg-primary/20 text-primary border-0">B2B Intelligence</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-powered buyer intent analysis and lead qualification
        </p>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Buyers */}
          <div className="glass-card border border-white/20 p-4 rounded-xl hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Total Buyers</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-foreground">{metrics.totalBuyers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered users</p>
          </div>

          {/* Active Buyers */}
          <div className="glass-card border border-white/20 p-4 rounded-xl hover:border-green-300/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Active Buyers</span>
              <Heart className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{metrics.activeBuyers}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </div>

          {/* Total Inquiries */}
          <div className="glass-card border border-white/20 p-4 rounded-xl hover:border-purple-300/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Total Inquiries</span>
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600">{metrics.totalInquiries}</div>
            <p className="text-xs text-muted-foreground mt-1">Product requests</p>
          </div>

          {/* Avg Time */}
          <div className="glass-card border border-white/20 p-4 rounded-xl hover:border-yellow-300/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Avg Time</span>
              <Globe className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">{metrics.avgTimeOnPlatform}m</div>
            <p className="text-xs text-muted-foreground mt-1">Per session</p>
          </div>

          {/* Conversion Rate */}
          <div className="glass-card border border-white/20 p-4 rounded-xl hover:border-red-300/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Conversion</span>
              <TrendingUp className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600">{metrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall rate</p>
          </div>
        </div>
      )}

      {/* Buyer Type Distribution */}
      {metrics && (
        <div className="glass-card border-2 border-white/20 p-6 rounded-2xl">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Top Buyer Types
          </h3>
          <div className="space-y-3">
            {metrics.topBuyerTypes.map((type, idx) => {
              const maxCount = Math.max(...metrics.topBuyerTypes.map(t => t.count));
              const percentage = (type.count / maxCount) * 100;
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{type.type}</span>
                    <Badge className="bg-primary/20 text-primary border-0">{type.count}</Badge>
                  </div>
                  <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lead Scores */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Lead Quality Tiers
        </h3>

        {leads.map((lead, idx) => (
          <div
            key={idx}
            className="glass-card border-2 border-white/20 hover:border-primary/30 p-5 rounded-xl transition-all duration-300"
          >
            {/* Score Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {/* Circular Progress */}
                  <div className="absolute w-full h-full rounded-full border-4 border-muted/30"></div>
                  <div
                    className="absolute w-full h-full rounded-full border-4 border-transparent border-t-primary border-r-primary transition-all duration-300"
                    style={{
                      transform: `rotate(${(lead.leadScore / 100) * 360}deg)`,
                    }}
                  ></div>
                  <span className={`text-xl font-bold ${getScoreColor(lead.leadScore)}`}>
                    {lead.leadScore}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {lead.leadScore >= 85
                      ? 'Hot Lead'
                      : lead.leadScore >= 70
                      ? 'Warm Lead'
                      : lead.leadScore >= 55
                      ? 'Engaged Prospect'
                      : 'Cold Lead'}
                  </h4>
                  <Badge className={`mt-1 text-xs ${getConfidenceBadgeColor(lead.confidence)}`}>
                    {lead.confidence} confidence
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 ml-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Score Progress</span>
                  <span className="text-xs font-semibold text-foreground">{lead.leadScore}%</span>
                </div>
                <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                    style={{ width: `${lead.leadScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Recommended Actions
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {lead.recommendations.map((rec, ridx) => (
                  <div
                    key={ridx}
                    className="flex items-start gap-2 p-2 bg-white/40 dark:bg-black/30 rounded-lg border border-white/20"
                  >
                    <span className="text-primary text-sm mt-0.5">→</span>
                    <span className="text-sm text-foreground">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="glass-card border border-yellow-200/50 bg-yellow-50/50 dark:bg-yellow-900/20 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1">
            💡 Lead Scoring Tips
          </p>
          <ul className="text-xs text-yellow-800 dark:text-yellow-300 space-y-1">
            <li>• Hot leads (80+): Require immediate follow-up within 24 hours</li>
            <li>• Warm leads (70-79): Schedule demos and send detailed proposals</li>
            <li>• Engaged prospects (55-69): Nurture with educational content</li>
            <li>• Cold leads (&lt;55): Implement re-engagement campaigns</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
