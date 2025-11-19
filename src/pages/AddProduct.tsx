import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Upload, Send, Package, Home, Zap, Award, TrendingUp, CheckCircle, MapPin, Clock, Lightbulb, Star, Globe } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Label } from '@/pages/components/ui/label';
import { Textarea } from '@/pages/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { products as predefinedProducts } from '../data';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Supplier {
  _id: string;
  companyName: string;
  location?: string;
  rating?: number;
  verified?: boolean;
}

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<typeof predefinedProducts>([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [userProducts, setUserProducts] = useState<any[]>([]);

  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    description: '',
    features: [] as string[],
    pricing: '',
    moq: '',
    leadTime: '',
    materialStandard: '',
    packaging: '',
    testingCertificate: '',
    brands: [] as string[],
    grades: [] as string[],
    delivery: '',
    quality: '',
    availability: '',
    imageFile: null as File | null,
    imagePreview: '',
  });

  const token = localStorage.getItem('supplierToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCategories();
    fetchSuppliers();
    fetchUserProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/public`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSuppliers = async () => {
    // Suppliers will be dynamically fetched based on selected product
    // No static data needed - will be populated from product data
  };

  const fetchUserProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setUserProducts(data.data.slice(0, 4)); // Get latest 4 products
      }
    } catch (error) {
      console.error('Failed to fetch user products:', error);
    }
  };

  const getSupplierSuggestionsForProduct = (productCategory: string) => {
    // Get the selected product from predefinedProducts
    const selectedProduct = predefinedProducts.find(p => p.name === productForm.name);
    
    if (!selectedProduct || !selectedProduct.specifications?.brand) {
      return [];
    }
    
    // Convert brand names to supplier objects
    return selectedProduct.specifications.brand.map((brandName, idx) => ({
      _id: String(idx),
      companyName: brandName,
      location: '', // Can be enhanced later
      rating: undefined,
      verified: true
    })).slice(0, 3); // Show first 3 suppliers
  };

  const getRecommendedProducts = () => {
    // Get the selected product
    const selectedProduct = predefinedProducts.find(p => p.name === productForm.name);
    
    if (!selectedProduct) {
      return [];
    }
    
    // Get all products in the same category, excluding the current product
    const recommendedProducts = predefinedProducts
      .filter(p => p.category === selectedProduct.category && p.name !== selectedProduct.name);
    
    return recommendedProducts; // Return ALL products, not just 4
  };

  const getRecommendedProductsForDropdown = () => {
    // For dropdown: show related products based on first suggestion's category
    if (suggestions.length === 0) return [];
    
    const firstSuggestion = suggestions[0];
    return predefinedProducts
      .filter(p => p.category === firstSuggestion.category && p.name !== firstSuggestion.name)
      .slice(0, 4);
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    if (value.trim().length >= 1) {
      const searchTerm = value.toLowerCase().trim();
      // Filter by product name AND category (if category is selected)
      const results = predefinedProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) &&
        (productForm.category === '' || product.category === productForm.category)
      );
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectProduct = async (product: typeof predefinedProducts[0]) => {
    let imageFile: File | null = null;
    let imagePreview = '';

    try {
      const response = await fetch(product.image);
      const blob = await response.blob();
      const fileName = product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
      imageFile = new File([blob], fileName, { type: blob.type });
      imagePreview = URL.createObjectURL(blob);
    } catch (error) {
      imagePreview = product.image;
    }

    setProductForm({
      name: product.name,
      category: product.category,
      description: product.description,
      features: product.features || [],
      pricing: '',
      moq: '',
      leadTime: '',
      materialStandard: product.specifications?.materialStandard || '',
      packaging: product.specifications?.packaging || '',
      testingCertificate: product.specifications?.testingCertificate || '',
      brands: product.specifications?.brand || [],
      grades: product.specifications?.grades || [],
      delivery: product.specifications?.delivery || '',
      quality: product.specifications?.quality || '',
      availability: product.specifications?.availability || '',
      imageFile,
      imagePreview,
    });
    setSearchInput('');
    setSuggestions([]);
  };

  const handleSubmit = async () => {
    if (!productForm.name || !productForm.category) {
      toast({ title: 'Error', description: 'Product name and category are required', variant: 'destructive' });
      return;
    }

    if (!agreeToTerms) {
      toast({ title: 'Error', description: 'Please confirm that the product information is accurate and complete', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', productForm.name);
      formDataToSend.append('category', productForm.category);
      formDataToSend.append('description', productForm.description);
      formDataToSend.append('features', JSON.stringify(productForm.features));
      formDataToSend.append('pricing', productForm.pricing);
      formDataToSend.append('moq', productForm.moq);
      formDataToSend.append('leadTime', productForm.leadTime);

      if (productForm.imageFile) {
        const imageBlob = await fetch(productForm.imagePreview).then(r => r.blob());
        const imageFileName = `${productForm.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
        const imageFileToSend = new File([imageBlob], imageFileName, { type: 'image/jpeg' });
        formDataToSend.append('productImage', imageFileToSend);
      }

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend,
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Product added to your account!' });
        navigate('/products');
      } else {
        throw new Error(data.message || 'Failed to add product');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f0ec] overflow-x-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8dcd0' }}>
        <div className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#c1482b' }}>Add Product</h1>
            <p className="text-sm mt-1" style={{ color: '#6b5d54' }}>Expand your product catalog and reach B2B buyers across India</p>
          </div>
          <Button
            onClick={() => navigate('/products')}
            className="rounded-lg font-medium border-2"
            style={{ borderColor: '#c1482b', color: '#c1482b', background: 'white' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div className="w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Grid Layout - Form Left (2/3), Products Right (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Form Column - 2/3 width */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-8" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#c1482b' }}>Product Details</h3>
                <p className="text-sm mb-6" style={{ color: '#6b5d54' }}>Fill in all required information for your industrial product listing</p>

                <div className="space-y-4">
                  {/* Product Name with Suggestions */}
                  <div className="relative">
                    <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Product Name *</Label>
                    <Input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => {
                        setProductForm({ ...productForm, name: e.target.value });
                        handleSearch(e.target.value);
                      }}
                      placeholder="Enter product name (e.g., TMT Bars, Steel Pipes, Cement)"
                      className="mt-2 h-12 border rounded-lg text-sm px-4"
                      style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                    />
                  </div>

                  {/* Suggestions Dropdown */}
{searchInput.trim().length >= 1 &&
 (suggestions.length > 0 ||
  getSupplierSuggestionsForProduct(productForm.category).length > 0 ||
  getRecommendedProducts().length > 0) && (
  <div
    className="mt-2 p-3 border rounded-lg shadow-lg overflow-y-auto no-scrollbar"
    style={{
      borderColor: '#e8dcd0',
      backgroundColor: 'white',
      maxHeight: '400px',
    }}
  >
    {/* Matching Products */}
    {suggestions.length > 0 && (
      <div className="mb-4">
        <p
          className="text-xs font-bold mb-3 px-2 overflow-hidden"
          style={{ color: '#c1482b' }}
        >
          Products ({suggestions.length})
        </p>

        {/* 2 Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.slice(0, 8).map((product) => (
            <div
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              className="p-3 rounded-lg cursor-pointer transition-all hover:shadow-md border group"
              style={{ borderColor: '#e8dcd0', backgroundColor: '#faf9f8' }}
            >
              <div className="flex items-start gap-3">
                {/* Product Image */}
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/64x64?text=${encodeURIComponent(
                        product.name.substring(0, 10)
                      )}`;
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {product.description}
                  </p>

                  <div className="flex gap-2 mt-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: '#e8dcd0',
                        color: '#6b5d54',
                      }}
                    >
                      {product.category}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: '#d4f7e8',
                        color: '#10B981',
                      }}
                    >
                      ✓ Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}


                  {/* Category - 2 Column Grid */}
                  <div>
                    <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Category *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.slug}
                          onClick={() => setProductForm({ ...productForm, category: cat.slug })}
                          className="p-2 border rounded-lg text-sm font-medium transition-all"
                          style={{
                            borderColor: productForm.category === cat.slug ? '#c1482b' : '#ddd',
                            backgroundColor: productForm.category === cat.slug ? '#c1482b' : '#faf9f8',
                            color: productForm.category === cat.slug ? 'white' : '#6b5d54'
                          }}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Description *</Label>
                    <Textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Describe your product specifications, applications, and benefits..."
                      rows={3}
                      className="mt-2 border rounded-lg text-sm px-4 py-3"
                      style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                    />
                  </div>

                  {/* Grid Fields - 2 Columns */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Price (₹)</Label>
                      <Input
                        type="text"
                        value={productForm.pricing}
                        onChange={(e) => setProductForm({ ...productForm, pricing: e.target.value })}
                        placeholder="₹500"
                        className="mt-2 h-12 border rounded-lg text-sm px-4"
                        style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Min Order</Label>
                      <Input
                        type="text"
                        value={productForm.moq}
                        onChange={(e) => setProductForm({ ...productForm, moq: e.target.value })}
                        placeholder="10"
                        className="mt-2 h-12 border rounded-lg text-sm px-4"
                        style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Delivery Time</Label>
                      <Input
                        type="text"
                        value={productForm.leadTime}
                        onChange={(e) => setProductForm({ ...productForm, leadTime: e.target.value })}
                        placeholder="5-7 days"
                        className="mt-2 h-12 border rounded-lg text-sm px-4"
                        style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Quality/Grade</Label>
                      <Input
                        type="text"
                        value={productForm.quality}
                        onChange={(e) => setProductForm({ ...productForm, quality: e.target.value })}
                        placeholder="ISI, BIS Certified"
                        className="mt-2 h-12 border rounded-lg text-sm px-4"
                        style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                      />
                    </div>
                  </div>

                  {/* More Fields - 2 Columns */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Material Standard</Label>
                      <Input
                        type="text"
                        value={productForm.materialStandard}
                        onChange={(e) => setProductForm({ ...productForm, materialStandard: e.target.value })}
                        placeholder="IS 1786, ASTM A36"
                        className="mt-2 h-12 border rounded-lg text-sm px-4"
                        style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Packaging</Label>
                      <Input
                        type="text"
                        value={productForm.packaging}
                        onChange={(e) => setProductForm({ ...productForm, packaging: e.target.value })}
                        placeholder="Bundle, Pallet, Crate"
                        className="mt-2 h-12 border rounded-lg text-sm px-4"
                        style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Testing Certificate</Label>
                      <Input
                        type="text"
                        value={productForm.testingCertificate}
                        onChange={(e) => setProductForm({ ...productForm, testingCertificate: e.target.value })}
                        placeholder="MTC, CTC Available"
                        className="mt-2 h-12 border rounded-lg text-sm px-4"
                        style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Availability</Label>
                      <Input
                        type="text"
                        value={productForm.availability}
                        onChange={(e) => setProductForm({ ...productForm, availability: e.target.value })}
                        placeholder="In Stock, On Demand"
                        className="mt-2 h-12 border rounded-lg text-sm px-4"
                        style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                      />
                    </div>
                  </div>

                  {/* Brands */}
                  <div>
                    <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Brands</Label>
                    <div className="mt-2 space-y-2">
                      {productForm.brands.map((brand, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            type="text"
                            value={brand}
                            onChange={(e) => {
                              const newBrands = [...productForm.brands];
                              newBrands[idx] = e.target.value;
                              setProductForm({ ...productForm, brands: newBrands });
                            }}
                            placeholder="Brand name"
                            className="h-12 border rounded-lg flex-1 text-sm px-4"
                            style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                          />
                          <button
                            onClick={() => {
                              const newBrands = productForm.brands.filter((_, i) => i !== idx);
                              setProductForm({ ...productForm, brands: newBrands });
                            }}
                            className="px-3 rounded-lg flex items-center justify-center"
                            style={{ background: '#c1482b', color: 'white' }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setProductForm({ ...productForm, brands: [...productForm.brands, ''] })}
                        className="w-full py-3 text-sm font-medium rounded-lg border"
                        style={{ borderColor: '#ddd', background: '#faf9f8', color: '#c1482b' }}
                      >
                        + Add Brand
                      </button>
                    </div>
                  </div>

                  {/* Grades */}
                  <div>
                    <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Grades/Specifications</Label>
                    <div className="mt-2 space-y-2">
                      {productForm.grades.map((grade, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            type="text"
                            value={grade}
                            onChange={(e) => {
                              const newGrades = [...productForm.grades];
                              newGrades[idx] = e.target.value;
                              setProductForm({ ...productForm, grades: newGrades });
                            }}
                            placeholder="Grade name"
                            className="h-12 border rounded-lg flex-1 text-sm px-4"
                            style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                          />
                          <button
                            onClick={() => {
                              const newGrades = productForm.grades.filter((_, i) => i !== idx);
                              setProductForm({ ...productForm, grades: newGrades });
                            }}
                            className="px-3 rounded-lg flex items-center justify-center"
                            style={{ background: '#c1482b', color: 'white' }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setProductForm({ ...productForm, grades: [...productForm.grades, ''] })}
                        className="w-full py-3 text-sm font-medium rounded-lg border"
                        style={{ borderColor: '#ddd', background: '#faf9f8', color: '#c1482b' }}
                      >
                        + Add Grade
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Key Features</Label>
                    <div className="mt-2 space-y-2">
                      {productForm.features.map((feature, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            type="text"
                            value={feature}
                            onChange={(e) => {
                              const newFeatures = [...productForm.features];
                              newFeatures[idx] = e.target.value;
                              setProductForm({ ...productForm, features: newFeatures });
                            }}
                            placeholder="Feature"
                            className="h-12 border rounded-lg flex-1 text-sm px-4"
                            style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                          />
                          <button
                            onClick={() => {
                              const newFeatures = productForm.features.filter((_, i) => i !== idx);
                              setProductForm({ ...productForm, features: newFeatures });
                            }}
                            className="px-3 rounded-lg flex items-center justify-center"
                            style={{ background: '#c1482b', color: 'white' }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setProductForm({ ...productForm, features: [...productForm.features, ''] })}
                        className="w-full py-3 text-sm font-medium rounded-lg border"
                        style={{ borderColor: '#ddd', background: '#faf9f8', color: '#c1482b' }}
                      >
                        + Add Feature
                      </button>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Product Image</Label>
                    {productForm.imagePreview ? (
                      <div className="mt-2 relative w-full h-40 rounded-lg overflow-hidden border" style={{ borderColor: '#ddd' }}>
                        <img src={productForm.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setProductForm({ ...productForm, imageFile: null, imagePreview: '' })}
                          className="absolute top-2 right-2 w-8 h-8 text-white rounded-full flex items-center justify-center"
                          style={{ background: '#c1482b' }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="mt-2 block p-6 border rounded-lg text-center cursor-pointer" style={{ borderColor: '#ddd', background: '#faf9f8' }}>
                        <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: '#c1482b' }} />
                        <p className="font-medium text-sm" style={{ color: '#6b5d54' }}>Click to upload product image</p>
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setProductForm({
                                ...productForm,
                                imageFile: file,
                                imagePreview: URL.createObjectURL(file)
                              });
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Checkbox Agreement - MANDATORY */}
                  <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#faf9f8', borderLeft: '4px solid #c1482b' }}>
                    <input
                      type="checkbox"
                      id="agree"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 cursor-pointer"
                      style={{ accentColor: '#c1482b' }}
                    />
                    <label htmlFor="agree" className="text-sm font-medium cursor-pointer" style={{ color: '#1a1a1a' }}>
                      I confirm that the product information is accurate and complete. *
                    </label>
                  </div>
                  {!agreeToTerms && (
                    <div className="text-xs font-semibold" style={{ color: '#c1482b' }}>
                      ⚠️ You must confirm to submit the product
                    </div>
                  )}
                </div>

                {/* Privacy Notice */}
                <p className="text-xs mt-6" style={{ color: '#6b5d54' }}>
                  By submitting this form, you agree to our Terms of Service and Privacy Policy. Your product will be reviewed and listed within 24 hours.
                </p>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full mt-8 py-3 rounded-lg text-white bg-gradient-to-br from-primary to-secondary  font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                  style={{
                    
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: 1
                  }}
                >
                  <Send className="w-5 h-5" />
                  <span>{loading ? 'Adding Product...' : 'Add to Account'}</span>
                </button>
              </div>

              {/* Products Column - 1/3 width */}
              <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <h4 className="text-2xl font-bold mb-6" style={{ color: '#c1482b' }}>Popular Products</h4>
                <div className="space-y-4">
                  {predefinedProducts.slice(0, 6).map((product, idx) => {
                    const icons = [Package, Home, Zap, Award, TrendingUp, CheckCircle];
                    const gradients = [
                      'bg-gradient-to-br from-primary to-secondary ',
                      'bg-gradient-to-br from-primary to-secondary ',
                      'bg-gradient-to-br from-primary to-secondary ',
                      'bg-gradient-to-br from-primary to-secondary ',
                   
                    ];
                    const IconComponent = icons[idx % icons.length];
                    const gradient = gradients[idx % gradients.length];
                    
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className="p-4 rounded-xl border transition-all cursor-pointer hover:shadow-lg group"
                        style={{ borderColor: '#e8dcd0', backgroundColor: '#faf9f8' }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{product.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
                            <button className="mt-2 text-xs font-semibold" style={{ color: '#c1482b' }}>
                              Select →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Two Section Container - Attractive Glass Design */}
                <div className="mt-6 space-y-6">
                  {/* Supplier Suggestions - Glass Card Design */}
                  {productForm.name.trim().length > 0 && getSupplierSuggestionsForProduct(productForm.category).length > 0 && (
                    <div className="pt-6 border-t" style={{ borderColor: '#e8dcd0' }}>
                      <p className="text-xs font-bold mb-3 px-2" style={{ color: '#c1482b' }}>🏢 Suppliers Available</p>
                      <div className="grid grid-cols-3 gap-2">
                        {getSupplierSuggestionsForProduct(productForm.category).map((supplier) => (
                          <div
                            key={supplier._id}
                            className="group perspective-1000 h-full"
                          >
                            <div
                              className="relative p-4 rounded-xl border-2 border-white/30 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                              style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', borderColor: '#e8dcd0' }}
                            >
                              {/* Icon */}
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white group-hover:scale-110 transition-transform mx-auto mb-2">
                                <Globe className="w-5 h-5" />
                              </div>
                              {/* Name */}
                              <p className="font-bold text-xs text-center text-foreground group-hover:text-primary transition-colors line-clamp-2">{supplier.companyName}</p>
                              {/* Badge */}
                              {supplier.verified && (
                                <div className="flex justify-center mt-2">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#d4f7e8', color: '#10B981' }}>
                                    ✓ Verified
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Products by AI - Enhanced Design */}
                  {userProducts.length > 0 && (
                    <div className="pt-6 border-t" style={{ borderColor: '#e8dcd0' }}>
                      <div className="flex items-center gap-2 mb-4 px-2">
                        <p className="text-sm font-bold" style={{ color: '#c1482b' }}>✨ Recommended by AI</p>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ffe4d4', color: '#c1482b' }}>Smart Match</span>
                      </div>
                      <p className="text-xs mb-3 px-2" style={{ color: '#6b5d54' }}>AI-powered product recommendations based on your latest additions</p>
                      <div className="grid grid-cols-2 gap-2">
                        {userProducts.map((product) => (
                          <div
                            key={product._id}
                            onClick={() => handleSelectProduct({
                              id: product._id,
                              name: product.name,
                              category: product.category,
                              description: product.description,
                              image: product.image || '',
                              features: [],
                              specifications: {}
                            })}
                            className="group perspective-1000 h-full cursor-pointer"
                          >
                            <div
                              className="relative rounded-xl border-2 border-white/30 backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-40"
                              style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', borderColor: '#e8dcd0' }}
                            >
                              {/* Image Container */}
                              <div className="relative h-20 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                                {(product as any)?.image ? (
                                  <img
                                    src={(product as any)?.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                      e.currentTarget.src = `https://placehold.co/64x64?text=${encodeURIComponent(product.name.substring(0, 10))}`;
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#f3f0ec' }}>
                                    <Package className="w-6 h-6" style={{ color: '#c1482b' }} />
                                  </div>
                                )}
                              </div>
                              {/* Content */}
                              <div className="p-3 flex flex-col justify-between h-20">
                                <p className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                  {product.name}
                                </p>
                                <button
                                  className="mt-auto text-xs font-semibold py-1 px-2 rounded-lg transition-all w-full"
                                  style={{ color: '#fff', backgroundColor: '#c1482b' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a53019'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#c1482b'; }}
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Why List Your Products - Info Card Style */}
                <div className="border rounded-2xl p-6 mt-8" style={{ borderColor: '#e8dcd0', backgroundColor: 'white' }}>
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary to-secondary " style={{ backgroundColor: '#c1482b' }}>
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h5 className="text-lg font-bold mb-2" style={{ color: '#c1482b' }}>Boost Your Sales</h5>
                      <p className="text-sm" style={{ color: '#6b5d54' }}>Reach 10,000+ verified B2B buyers and increase revenue by 3x with our industrial marketplace</p>
                      <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#ffe4d4', color: '#c1482b' }}>
                        Proven Results
                      </div>
                    </div>
                  </div>
                </div>

                {/* How It Works - Info Card Style */}
                <div className="border rounded-2xl p-6 mt-6 " style={{ borderColor: '#e8dcd0', backgroundColor: 'white' }}>
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary to-secondary " style={{ backgroundColor: '#8B5CF6' }}>
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h5 className="text-lg font-bold mb-2" style={{ color: '#c1482b' }}>How It Works</h5>
                      <ol className="space-y-2 text-sm" style={{ color: '#6b5d54' }}>
                        <li className="flex gap-2">
                          <span className="font-bold" style={{ color: '#c1482b' }}>1.</span>
                          <span>Fill product details</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold" style={{ color: '#c1482b' }}>2.</span>
                          <span>24-hour verification</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold" style={{ color: '#c1482b' }}>3.</span>
                          <span>Go live instantly</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Popular Categories - Info Card Style */}
                {/* <div className="border rounded-2xl p-6 mt-6" style={{ borderColor: '#e8dcd0', backgroundColor: 'white' }}>
                  <h5 className="text-lg font-bold mb-4" style={{ color: '#c1482b' }}>Popular Categories</h5>
                  <div className="space-y-2">
                    {[
                      { name: 'Steel & Construction', count: '2,340 sellers' },
                      { name: 'Electrical Materials', count: '1,890 sellers' },
                      { name: 'Industrial Equipment', count: '1,650 sellers' },
                      { name: 'Building Materials', count: '1,420 sellers' }
                    ].map((cat, idx) => (
                      <div key={idx} className="flex justify-between items-center pb-2" style={{ borderBottom: idx < 3 ? '1px solid #e8dcd0' : 'none' }}>
                        <span className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{cat.name}</span>
                        <span className="text-xs" style={{ color: '#6b5d54' }}>{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div> */}

                {/* Pro Tips - Info Card Style */}
                {/* <div className="border rounded-2xl p-6 mt-6" style={{ borderColor: '#e8dcd0', backgroundColor: '#faf9f8' }}>
                  <h5 className="text-lg font-bold mb-4" style={{ color: '#c1482b' }}>Pro Tips for Success</h5>
                  <ul className="space-y-3 text-sm" style={{ color: '#6b5d54' }}>
                    <li className="flex gap-2">
                      <span style={{ color: '#c1482b' }}>✓</span>
                      <span>High-quality product images attract 5x more buyers</span>
                    </li>
                    <li className="flex gap-2">
                      <span style={{ color: '#c1482b' }}>✓</span>
                      <span>Complete certifications build trust</span>
                    </li>
                    <li className="flex gap-2">
                      <span style={{ color: '#c1482b' }}>✓</span>
                      <span>Regular updates boost search ranking</span>
                    </li>
                  </ul>
                </div> */}

                {/* Support Info - Info Card Style */}
                <div className="border rounded-2xl p-6 mt-6" style={{ borderColor: '#e8dcd0', backgroundColor: 'white' }}>
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary to-secondary " style={{ backgroundColor: '#10B981' }}>
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h5 className="text-lg font-bold mb-1 " style={{ color: '#c1482b' }}>24/7 Support</h5>
                      <p className="text-sm" style={{ color: '#6b5d54' }}>Our team is available to help you anytime</p>
                      <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d4f7e8', color: '#10B981' }}>
                        Always Available
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
