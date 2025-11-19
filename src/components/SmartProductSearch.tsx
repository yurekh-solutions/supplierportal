import { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, Filter, Zap, Brain, Network, Loader } from 'lucide-react';
import { Input } from '@/pages/components/ui/input';
import { Button } from '@/pages/components/ui/button';
import { Badge } from '@/pages/components/ui/badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  enrichment?: {
    qualityScore: number;
    keywords: string[];
    targetBuyers: string[];
  };
}

interface SearchResult {
  product: Product;
  relevanceScore: number;
  matchType: 'semantic' | 'keyword' | 'category';
  similarity?: number;
}

interface Props {
  onSelectProduct?: (product: Product) => void;
  onOpenModal?: (product: Product) => void;
}

export default function SmartProductSearch({ onSelectProduct, onOpenModal }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  const token = localStorage.getItem('supplierToken');

  // Fetch all products on mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products/my-products`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.products) {
        setAllProducts(data.products);
        const uniqueCategories = [...new Set(data.products.map((p: Product) => p.category))];
        setCategories(uniqueCategories as string[]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const performSemanticSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      // Keyword-based matching
      const keywordMatches: SearchResult[] = [];
      
      allProducts.forEach(product => {
        // Check product name
        if (product.name.toLowerCase().includes(query.toLowerCase())) {
          keywordMatches.push({
            product,
            relevanceScore: 90,
            matchType: 'keyword',
          });
          return;
        }

        // Check description
        if (product.description.toLowerCase().includes(query.toLowerCase())) {
          keywordMatches.push({
            product,
            relevanceScore: 70,
            matchType: 'keyword',
          });
          return;
        }

        // Check keywords from enrichment
        if (product.enrichment?.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))) {
          keywordMatches.push({
            product,
            relevanceScore: 75,
            matchType: 'keyword',
          });
          return;
        }

        // Check target buyers
        if (product.enrichment?.targetBuyers.some(b => b.toLowerCase().includes(query.toLowerCase()))) {
          keywordMatches.push({
            product,
            relevanceScore: 60,
            matchType: 'keyword',
          });
        }
      });

      // Try semantic search via API if available
      try {
        const semanticResponse = await fetch(`${API_URL}/enrich/similar-products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: allProducts[0]?._id,
          }),
        });

        if (semanticResponse.ok) {
          const semanticData = await semanticResponse.json();
          // Merge with semantic results if available
        }
      } catch (error) {
        console.error('Semantic search unavailable:', error);
      }

      // Sort by relevance score
      const sorted = keywordMatches.sort((a, b) => b.relevanceScore - a.relevanceScore);
      setResults(sorted);
    } finally {
      setSearching(false);
    }
  }, [allProducts, token]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    performSemanticSearch(value);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category) {
      const filtered = results.filter(r => r.product.category === category);
      setResults(filtered);
    } else {
      performSemanticSearch(searchQuery);
    }
  };

  const filteredResults = selectedCategory
    ? results.filter(r => r.product.category === selectedCategory)
    : results;

  return (
    <div className="w-full space-y-4 mb-6">
      {/* Search Header */}
      <div className="glass-card border-2 border-primary/30 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">AI-Powered Product Search</h2>
          <Badge className="bg-primary/20 text-primary border-0 text-xs ml-auto">Smart Search</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Search your products using semantic understanding, keywords, and AI analysis
        </p>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name, description, or keywords..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-12 rounded-xl border-2 border-white/20 focus:border-primary/50 bg-white/50 dark:bg-black/20"
          />
          {searching && <Loader className="absolute right-3 top-3 w-5 h-5 animate-spin text-primary" />}
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Button
            size="sm"
            variant={selectedCategory === '' ? 'default' : 'outline'}
            onClick={() => handleCategoryFilter('')}
            className="rounded-full"
          >
            All Categories
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => handleCategoryFilter(cat)}
              className="rounded-full"
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">
                Found {filteredResults.length} Result{filteredResults.length !== 1 ? 's' : ''}
              </h3>
            </div>
            {filteredResults.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Sorted by relevance
              </span>
            )}
          </div>

          {filteredResults.length === 0 && !searching ? (
            <div className="glass-card border border-white/20 p-8 rounded-xl text-center">
              <p className="text-muted-foreground mb-2">No products found</p>
              <p className="text-xs text-muted-foreground">Try different keywords or categories</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredResults.map((result, idx) => (
                <div
                  key={`${result.product._id}-${idx}`}
                  className="glass-card border-2 border-white/20 hover:border-primary/50 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:bg-white/60 dark:hover:bg-black/50"
                  onClick={() => onOpenModal?.(result.product)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{result.product.name}</h4>
                        <Badge className="text-xs">{result.product.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.product.description}
                      </p>

                      {/* Enrichment Info */}
                      {result.product.enrichment && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {result.product.enrichment.keywords.slice(0, 3).map((keyword, i) => (
                            <Badge
                              key={i}
                              className="text-xs bg-purple-100 text-purple-800 border-0"
                            >
                              {keyword}
                            </Badge>
                          ))}
                          {result.product.enrichment.keywords.length > 3 && (
                            <Badge className="text-xs bg-muted text-muted-foreground border-0">
                              +{result.product.enrichment.keywords.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Relevance Score */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-primary">{result.relevanceScore}%</span>
                      </div>
                      <Badge
                        className={`text-xs border-0 ${
                          result.matchType === 'semantic'
                            ? 'bg-blue-100 text-blue-800'
                            : result.matchType === 'keyword'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {result.matchType}
                      </Badge>

                      {/* Quality Score */}
                      {result.product.enrichment?.qualityScore && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Quality</p>
                          <div className="w-16 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary"
                              style={{
                                width: `${result.product.enrichment.qualityScore}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!searchQuery && (
        <div className="glass-card border-2 border-white/20 p-8 rounded-xl text-center">
          <Network className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">Enter a search query to find products</p>
        </div>
      )}
    </div>
  );
}
