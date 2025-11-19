import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/pages/components/ui/tabs';
import { Brain, TrendingUp, Target, Search, BarChart3, Sparkles } from 'lucide-react';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import SmartProductSearch from '@/components/SmartProductSearch';
import LeadScoringDashboard from '@/components/LeadScoringDashboard';
import PlatformGrowthAnalytics from '@/components/PlatformGrowthAnalytics';
import ProductDetailModal from '@/components/ProductDetailModal';
import { useState as useStateCallback } from 'react';

interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  status: string;
  specifications?: Record<string, any>;
}

export default function AIBusinessIntelligence() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              AI Business Intelligence Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Powered by advanced machine learning and data analytics
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-max mb-6 glass-card border-2 border-white/20 p-1 rounded-xl">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Growth</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Trends</span>
            </TabsTrigger>
          </TabsList>

          {/* Supplier Insights */}
          <TabsContent value="insights" className="space-y-6">
            <div className="glass-card border-2 border-primary/30 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Your AI-Powered Business Profile
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Deep analysis of your supplier profile, performance metrics, and growth opportunities
              </p>
            </div>
            <AIInsightsPanel />
          </TabsContent>

          {/* Smart Product Search */}
          <TabsContent value="search" className="space-y-6">
            <div className="glass-card border-2 border-primary/30 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3 mb-2">
                <Search className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Smart Product Discovery
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered semantic search with vector embeddings and intelligent recommendations
              </p>
            </div>
            <SmartProductSearch
              onOpenModal={(product) => {
                setSelectedProduct(product);
                setShowProductDetail(true);
              }}
            />
          </TabsContent>

          {/* Lead Scoring */}
          <TabsContent value="leads" className="space-y-6">
            <div className="glass-card border-2 border-primary/30 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Lead Scoring & Buyer Intent
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Intelligent buyer behavior analysis and lead qualification
              </p>
            </div>
            <LeadScoringDashboard />
          </TabsContent>

          {/* Platform Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="glass-card border-2 border-primary/30 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Platform Growth Metrics
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time analytics of platform performance and market intelligence
              </p>
            </div>
            <PlatformGrowthAnalytics />
          </TabsContent>

          {/* Market Trends */}
          <TabsContent value="trends" className="space-y-6">
            <div className="glass-card border-2 border-primary/30 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Market Trends & Insights
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Industry analysis and market trend predictions using AI
              </p>
            </div>

            {/* Market Trends Content */}
            <div className="space-y-4">
              {/* Trend Cards */}
              {[
                {
                  title: 'Steel & Metal Market',
                  trend: 'Bullish',
                  change: '+12.5%',
                  forecast: 'Strong demand expected in Q3',
                  color: 'from-blue-600 to-cyan-600',
                },
                {
                  title: 'Construction Sector',
                  trend: 'Neutral',
                  change: '+2.3%',
                  forecast: 'Stable growth with seasonal variations',
                  color: 'from-yellow-600 to-orange-600',
                },
                {
                  title: 'Electrical Components',
                  trend: 'Bullish',
                  change: '+18.7%',
                  forecast: 'High growth driven by infrastructure projects',
                  color: 'from-purple-600 to-pink-600',
                },
              ].map((trend, idx) => (
                <div
                  key={idx}
                  className="glass-card border-2 border-white/20 p-6 rounded-xl hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{trend.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{trend.forecast}</p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold bg-gradient-to-r ${trend.color} bg-clip-text text-transparent`}
                      >
                        {trend.change}
                      </div>
                      <div className="text-xs font-semibold text-foreground mt-1">{trend.trend}</div>
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-white/40 dark:bg-black/30">
                      <p className="text-xs text-muted-foreground mb-1">Market Size</p>
                      <p className="font-semibold text-foreground">$2.4B</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/40 dark:bg-black/30">
                      <p className="text-xs text-muted-foreground mb-1">Growth Rate</p>
                      <p className="font-semibold text-foreground">+15%/yr</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/40 dark:bg-black/30">
                      <p className="text-xs text-muted-foreground mb-1">Opportunities</p>
                      <p className="font-semibold text-foreground">High</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={showProductDetail}
        onOpenChange={setShowProductDetail}
      />

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto mt-12 p-6 glass-card border-2 border-white/20 rounded-2xl text-center">
        <p className="text-sm text-muted-foreground mb-2">
          🔐 All data is encrypted and secure. Your business insights are private.
        </p>
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()} | Real-time analytics powered by AI
        </p>
      </div>
    </div>
  );
}
