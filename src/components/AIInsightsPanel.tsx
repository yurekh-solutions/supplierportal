import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertCircle, Target, Zap, Award } from 'lucide-react';
import { Badge } from './ui/badge';

interface AIInsights {
  demographics: {
    supplierType: string;
    businessSize: string;
    maturityLevel: string;
  };
  predictions: {
    nextMonthTrend: string;
    likelyGrowth: number;
    riskFactors: string[];
  };
  recommendations: {
    improvements: string[];
    opportunities: string[];
    warnings: string[];
  };
  businessImpact: {
    estimatedRevenuePotential: string;
    marketPosition: string;
    competitiveAdvantage: string;
  };
}

interface Props {
  supplierId?: string;
}

export default function AIInsightsPanel({ supplierId }: Props) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchAIInsights();
  }, [supplierId]);

  const fetchAIInsights = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('supplierToken');
      
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/ai/supplier-insights`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        if (data.insights) {
          setInsights(data.insights);
        }
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }
      } else {
        setError(data.message || 'Failed to fetch insights');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching AI insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card border-2 border-white/30 p-6 rounded-2xl backdrop-blur-2xl mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="relative z-10 flex items-center justify-center h-40">
          <div className="animate-spin">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <span className="ml-3 text-muted-foreground">Generating AI insights...</span>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Demographics Card */}
      <div className="glass-card border-2 border-primary/30 p-6 rounded-2xl backdrop-blur-2xl relative overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-foreground">AI Business Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card border border-white/20 p-4 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Supplier Type</p>
              <p className="font-bold text-foreground">{insights.demographics.supplierType}</p>
            </div>
            <div className="glass-card border border-white/20 p-4 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Business Size</p>
              <Badge className="bg-primary/20 text-primary border-0 mt-1">{insights.demographics.businessSize}</Badge>
            </div>
            <div className="glass-card border border-white/20 p-4 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Maturity Level</p>
              <Badge className="bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-0 mt-1">
                {insights.demographics.maturityLevel}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions & Growth */}
      <div className="glass-card border-2 border-yellow-300/30 p-6 rounded-2xl backdrop-blur-2xl relative overflow-hidden bg-gradient-to-br from-yellow-50/50 to-orange-100/30 dark:from-yellow-900/20 dark:to-orange-800/10">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Growth Predictions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Next Month Trend</p>
              <p className="font-semibold text-foreground">{insights.predictions.nextMonthTrend}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Likely Growth</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted/30 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                    style={{ width: `${Math.min(insights.predictions.likelyGrowth, 100)}%` }}
                  ></div>
                </div>
                <span className="font-bold text-yellow-600">{insights.predictions.likelyGrowth}%</span>
              </div>
            </div>
          </div>

          {insights.predictions.riskFactors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Risk Factors
              </p>
              <div className="space-y-1">
                {insights.predictions.riskFactors.map((risk, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">• {risk}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card border-2 border-green-300/30 p-6 rounded-2xl backdrop-blur-2xl relative overflow-hidden bg-gradient-to-br from-green-50/50 to-emerald-100/30 dark:from-green-900/20 dark:to-emerald-800/10">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Smart Recommendations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Improvements */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">📈 Improvements</p>
              <ul className="space-y-2">
                {insights.recommendations.improvements.slice(0, 2).map((item, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">🎯 Opportunities</p>
              <ul className="space-y-2">
                {insights.recommendations.opportunities.slice(0, 2).map((item, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-green-600">★</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings */}
            {insights.recommendations.warnings.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">⚠️ Warnings</p>
                <ul className="space-y-2">
                  {insights.recommendations.warnings.slice(0, 2).map((item, idx) => (
                    <li key={idx} className="text-sm text-red-600 flex gap-2">
                      <span>!</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Business Impact */}
      <div className="glass-card border-2 border-purple-300/30 p-6 rounded-2xl backdrop-blur-2xl relative overflow-hidden bg-gradient-to-br from-purple-50/50 to-indigo-100/30 dark:from-purple-900/20 dark:to-indigo-800/10">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Business Impact</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card border border-white/20 p-4 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Revenue Potential</p>
              <p className="font-semibold text-foreground">{insights.businessImpact.estimatedRevenuePotential}</p>
            </div>
            <div className="glass-card border border-white/20 p-4 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Market Position</p>
              <p className="font-semibold text-foreground">{insights.businessImpact.marketPosition}</p>
            </div>
            <div className="glass-card border border-white/20 p-4 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Competitive Advantage</p>
              <p className="font-semibold text-foreground">{insights.businessImpact.competitiveAdvantage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Recommendations */}
      {recommendations.length > 0 && (
        <div className="glass-card border-2 border-blue-300/30 p-6 rounded-2xl backdrop-blur-2xl relative overflow-hidden bg-gradient-to-br from-blue-50/50 to-cyan-100/30 dark:from-blue-900/20 dark:to-cyan-800/10">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Product Strategies</h3>
            </div>

            <div className="space-y-2">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="glass-card border border-white/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-foreground">{idx + 1}. {rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
