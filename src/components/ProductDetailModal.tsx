import { useState } from 'react';
import { X, Sparkles, TrendingUp, Award, Loader, Users, DollarSign, Tag, Lightbulb, FileText, Settings, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/pages/components/ui/dialog';
import { Button } from '@/pages/components/ui/button';
import { Badge } from '@/pages/components/ui/badge';
import AIRecommendationEngine from './AIRecommendationEngine';
import SmartProductSearch from './SmartProductSearch';
import { getFixedImageUrl } from '@/lib/imageUtils';

interface ProductDetail {
  _id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  status: string;
  specifications?: Record<string, any>;
  price?: { amount: number; currency: string; unit: string };
  stock?: { available: boolean; quantity?: number };
  createdAt?: string;
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
  product: ProductDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: ProductDetail) => void;
}

export default function ProductDetailModal({ product, open, onOpenChange, onEdit }: Props) {
  const [enriching, setEnriching] = useState(false);

  if (!product) return null;

  const fixedImageUrl = getFixedImageUrl((product as any)?.image || (product as any)?.imagePreview);

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
      <DialogContent className="max-w-4xl glass-card border-2 border-white/30 rounded-2xl bg-white/70 dark:bg-black/40 backdrop-blur-3xl shadow-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-foreground">{product.name}</DialogTitle>
          <DialogDescription className="flex gap-2 mt-2">
            <Badge className="bg-primary/20 text-primary border-0 text-sm px-3 py-1">{product.category}</Badge>
            <Badge className={product.status === 'active' ? 'bg-green-100 text-green-800 text-sm px-3 py-1' : product.status === 'inactive' ? 'bg-gray-100 text-gray-800 text-sm px-3 py-1' : 'bg-yellow-100 text-yellow-800 text-sm px-3 py-1'}>
              {product.status}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Image - Always Show */}
          <div className="w-full h-80 rounded-xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            {fixedImageUrl ? (
              <img 
                src={fixedImageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.warn(`📸 Image failed to load: ${fixedImageUrl}`);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="text-center">
                <Package className="w-24 h-24 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold text-lg text-foreground mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed text-base">{product.description}</p>
          </div>

          {/* Price & Stock Info */}
          {(product.price || product.stock) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.price && (
                <div className="glass-card border-2 border-primary/30 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Price
                  </h4>
                  <p className="text-xl font-bold text-primary">{product.price.currency} {product.price.amount}</p>
                  {product.price.unit && <p className="text-xs text-muted-foreground mt-1">per {product.price.unit}</p>}
                </div>
              )}
              {product.stock && (
                <div className="glass-card border-2 border-green-300/30 p-4 rounded-xl bg-gradient-to-br from-green-5 to-emerald-5">
                  <h4 className="font-semibold text-foreground mb-2">Stock Status</h4>
                  <p className={`font-bold ${product.stock.available ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock.available ? '✓ In Stock' : '✗ Out of Stock'}
                  </p>
                  {product.stock.quantity && <p className="text-sm text-muted-foreground mt-1">Available: {product.stock.quantity}</p>}
                </div>
              )}
            </div>
          )}

          {/* All Specifications - Display Everything */}
        {/* Product Images Array - if multiple images exist */}
        {(product as any)?.images && (product as any).images.length > 0 && (
          <div>
            <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Additional Images
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(product as any).images.map((imageUrl: string, index: number) => {
                const fixedUrl = getFixedImageUrl(imageUrl);
                return (
                  <div key={index} className="rounded-lg overflow-hidden border-2 border-white/20">
                    <img
                      src={fixedUrl}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-24 object-cover hover:scale-110 transition-transform"
                      onError={(e) => {
                        console.warn(`📸 Image failed to load: ${fixedUrl}`);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* All Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                All Specifications & Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(product.specifications).map(([key, value]) => {
                  // Format the key nicely
                  const formattedKey = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim();
                  
                  // Format the value
                  let formattedValue = value;
                  if (typeof value === 'object') {
                    if (Array.isArray(value)) {
                      formattedValue = value.join(', ');
                    } else {
                      formattedValue = JSON.stringify(value, null, 2);
                    }
                  }
                  
                  return (
                    <div key={key} className="glass-card border-2 border-white/20 p-4 rounded-lg hover:border-primary/50 transition-colors">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{formattedKey}</p>
                      <p className="text-sm font-medium text-foreground leading-relaxed line-clamp-3">
                        {String(formattedValue)}
                      </p>
                    </div>
                  );
                })}
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

              {/* AI Recommendations */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Intelligent Recommendations
                </h3>
                <AIRecommendationEngine product={product} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass-card border-2 border-primary/30 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground mb-2">Unlock AI-Powered Insights</h3>
                    <p className="text-sm text-muted-foreground mb-4">Analyze this product with artificial intelligence to get:</p>
                    <ul className="text-sm text-muted-foreground space-y-2 mb-5">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                        <span><strong>Quality Score</strong> - How good your product is (0-100)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                        <span><strong>Market Appeal</strong> - Why buyers will want it</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                        <span><strong>Target Buyers</strong> - Who should buy this (e.g., Builders, Contractors)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                        <span><strong>SEO Keywords</strong> - Best search terms for visibility</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                        <span><strong>Pricing Recommendation</strong> - Competitive price range</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                        <span><strong>Improvements</strong> - How to make your product better</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                        <span><strong>Cross-Sell Ideas</strong> - Products to bundle together</span>
                      </li>
                    </ul>
                    <Button
                      onClick={handleEnrich}
                      disabled={enriching}
                      className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-6 hover:shadow-lg text-base"
                    >
                      {enriching ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing with AI... (2-3 seconds)
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Start AI Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
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
