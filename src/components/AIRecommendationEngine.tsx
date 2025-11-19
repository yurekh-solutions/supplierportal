import { useState, useEffect } from 'react';
import { TrendingUp, Target, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Badge } from '@/pages/components/ui/badge';
import { Spinner } from '@/pages/components/ui/spinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  enrichment?: {
    qualityScore: number;
  };
}

interface Recommendations {
  crossSell: string[];
  upSell: string[];
  qualityScore: number;
  improvements: string[];
}

interface Props {
  product: Product;
  onSelectProduct?: (productName: string) => void;
}

export default function AIRecommendationEngine({ product, onSelectProduct }: Props) {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('supplierToken');

  useEffect(() => {
    fetchRecommendations();
  }, [product._id]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/enrich/product-recommendations/${product._id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations ? {
          crossSell: data.recommendations.crossSell || [],
          upSell: data.recommendations.upSell || [],
          qualityScore: data.qualityScore || 0,
          improvements: data.improvements || [],
        } : null);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card border-2 border-primary/30 p-6 rounded-xl flex items-center justify-center gap-3">
        <Spinner className="w-5 h-5" />
        <p className="text-muted-foreground">Analyzing product opportunities...</p>
      </div>
    );
  }

  if (!recommendations || (!recommendations.crossSell.length && !recommendations.upSell.length)) {
    return (
      <div className="glass-card border-2 border-yellow-200/50 bg-yellow-50/50 dark:bg-yellow-900/20 p-6 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-yellow-600" />
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">No Recommendations Yet</h3>
        </div>
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          Enrich this product with AI analysis to unlock personalized recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cross-Sell Recommendations */}
      {recommendations.crossSell.length > 0 && (
        <div className="glass-card border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-bold text-blue-900 dark:text-blue-200">Cross-Sell Opportunities</h4>
            <Badge className="ml-auto bg-blue-600 text-white border-0 text-xs">
              {recommendations.crossSell.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {recommendations.crossSell.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/30 border border-blue-200/50 dark:border-blue-200/20 hover:bg-white/80 dark:hover:bg-black/50 transition-all cursor-pointer"
                onClick={() => onSelectProduct?.(item)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span className="font-medium text-blue-900 dark:text-blue-200 text-sm">{item}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600/50" />
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-3 p-2 bg-white/30 dark:bg-black/30 rounded-lg">
            💡 Tip: Bundle these products together to increase average order value
          </p>
        </div>
      )}

      {/* Up-Sell Recommendations */}
      {recommendations.upSell.length > 0 && (
        <div className="glass-card border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className="font-bold text-purple-900 dark:text-purple-200">Up-Sell Opportunities</h4>
            <Badge className="ml-auto bg-purple-600 text-white border-0 text-xs">
              {recommendations.upSell.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {recommendations.upSell.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/30 border border-purple-200/50 dark:border-purple-200/20 hover:bg-white/80 dark:hover:bg-black/50 transition-all cursor-pointer"
                onClick={() => onSelectProduct?.(item)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                  <span className="font-medium text-purple-900 dark:text-purple-200 text-sm">{item}</span>
                </div>
                <Zap className="w-4 h-4 text-purple-600/50" />
              </div>
            ))}
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-3 p-2 bg-white/30 dark:bg-black/30 rounded-lg">
            ⭐ Tip: Position these premium products as upgrades for higher-value customers
          </p>
        </div>
      )}

      {/* Improvement Suggestions */}
      {recommendations.improvements.length > 0 && (
        <div className="glass-card border-2 border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-bold text-amber-900 dark:text-amber-200">Suggested Improvements</h4>
          </div>
          <ul className="space-y-2">
            {recommendations.improvements.map((suggestion, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-amber-800 dark:text-amber-300">
                <span className="text-amber-600 mt-0.5">→</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
