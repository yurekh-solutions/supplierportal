import { useState } from 'react';
import { X, Sparkles, TrendingUp, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/pages/components/ui/dialog';
import { Button } from '@/pages/components/ui/button';
import { Badge } from '@/pages/components/ui/badge';

interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  status: string;
  specifications?: Record<string, any>;
  enrichment?: {
    qualityScore: number;
    keywords: string[];
    marketAppeal: string;
    targetBuyers: string[];
    competitiveAdvantage: string;
    pricingRecommendation: string;
    improvementSuggestions: string[];
  };
}

interface Props {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: Product) => void;
}

export default function ProductDetailModal({ product, open, onOpenChange, onEdit }: Props) {
  const [enriching, setEnriching] = useState(false);

  if (!product) return null;

  const handleEnrich = async () => {
    try {
      setEnriching(true);
      const token = localStorage.getItem('supplierToken');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/enrich/enrich-product/${product._id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        // Refresh product data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error enriching product:', error);
    } finally {
      setEnriching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass-card border-2 border-white/30 rounded-2xl bg-white/70 dark:bg-black/40 backdrop-blur-3xl shadow-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">{product.name}</DialogTitle>
          <DialogDescription className="flex gap-2 mt-2">
            <Badge className="bg-primary/20 text-primary border-0">{product.category}</Badge>
            <Badge className={product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {product.status}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Image */}
          {product.image && (
            <div className="w-full h-64 rounded-xl overflow-hidden bg-muted">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="glass-card border border-white/20 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{key}</p>
                    <p className="font-medium text-foreground">{JSON.stringify(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Enrichment Section */}
          {product.enrichment ? (
            <div className="space-y-4">
              {/* Quality Score */}
              <div className="glass-card border-2 border-primary/30 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Quality Score</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{product.enrichment.qualityScore}/100</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    style={{ width: `${product.enrichment.qualityScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Market Appeal & Target Buyers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card border border-white/20 p-4 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Market Appeal
                  </h4>
                  <p className="text-sm text-muted-foreground">{product.enrichment.marketAppeal}</p>
                </div>

                <div className="glass-card border border-white/20 p-4 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">Target Buyers</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.enrichment.targetBuyers.map((buyer, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-800 border-0 text-xs">
                        {buyer}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Competitive Advantage */}
              <div className="glass-card border border-white/20 p-4 rounded-xl">
                <h4 className="font-semibold text-foreground mb-2">Competitive Advantage</h4>
                <p className="text-sm text-muted-foreground">{product.enrichment.competitiveAdvantage}</p>
              </div>

              {/* Pricing Recommendation */}
              <div className="glass-card border border-primary/20 bg-primary/5 p-4 rounded-xl">
                <h4 className="font-semibold text-foreground mb-2">Pricing Recommendation</h4>
                <p className="text-sm font-medium text-primary">{product.enrichment.pricingRecommendation}</p>
              </div>

              {/* Keywords */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">SEO Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {product.enrichment.keywords.map((keyword, idx) => (
                    <Badge key={idx} className="bg-purple-100 text-purple-800 border-0">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              {product.enrichment.improvementSuggestions.length > 0 && (
                <div className="glass-card border border-yellow-200/50 bg-yellow-50/50 dark:bg-yellow-900/20 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-3">💡 Improvement Suggestions</h4>
                  <ul className="space-y-2">
                    {product.enrichment.improvementSuggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-yellow-800 dark:text-yellow-300 flex gap-2">
                        <span className="text-yellow-600">→</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card border-2 border-primary/30 p-6 rounded-xl text-center">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Enrich this product with AI analysis to unlock insights</p>
              <Button
                onClick={handleEnrich}
                disabled={enriching}
                className="bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg"
              >
                {enriching ? 'Analyzing...' : 'Enrich with AI'}
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-border/30">
          {onEdit && (
            <Button
              onClick={() => {
                onEdit(product);
                onOpenChange(false);
              }}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              ✏️ Edit Product
            </Button>
          )}
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
