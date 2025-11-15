import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, Upload, Send } from 'lucide-react';
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

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<typeof predefinedProducts>([]);

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

  const handleSearch = (value: string) => {
    setSearchInput(value);
    if (value.trim().length >= 1) {
      const searchTerm = value.toLowerCase().trim();
      const results = predefinedProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
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
    <div className="min-h-screen bg-gradient-subtle overflow-x-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8dcd0' }}>
        <div className="w-full px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>Add Product</h1>
            <p className="text-sm mt-1" style={{ color: '#6b5d54' }}>Add products to your inventory</p>
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

      {/* Main Content - Scrollable */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div className="w-full px-6 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Search Section */}
            <div className="mb-8">
              <div className="relative mb-4">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="h-12 text-base rounded-lg border px-5 pr-12"
                  style={{ borderColor: '#ddd', background: '#faf9f8', color: '#1a1a1a' }}
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#c1482b' }} />
              </div>

              {/* Suggestions Grid - 4 Columns Full Width */}
              {searchInput.trim().length >= 1 && suggestions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {suggestions.slice(0, 20).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="rounded-lg cursor-pointer transition-all hover:shadow-md overflow-hidden flex flex-col"
                      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', background: 'white' }}
                    >
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-32 object-cover"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      )}
                      <div className="p-3 flex flex-col flex-1">
                        <p className="font-bold text-xs" style={{ color: '#1a1a1a' }}>{product.name}</p>
                        <p className="text-xs mt-1 line-clamp-2 flex-1" style={{ color: '#6b5d54' }}>{product.description}</p>
                        <button className="w-full mt-2 py-1.5 rounded text-xs font-semibold text-white bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-lg transition-all hover:scale-105">
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2 Column Layout - Form & Info - Matching Contact Us */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Form Column - 2/3 width */}
            <div className="lg:col-span-2 bg-white rounded-lg p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 className="text-2xl font-bold mb-4 inline-block" style={{ color: '#c1482b' }}>Product Details</h3>
              <p className="text-sm mb-4" style={{ color: '#6b5d54' }}>Fill in all required information for your product</p>

              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Product Name *</Label>
                  <Input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Enter product name"
                    className="mt-2 h-12 border rounded-lg text-sm px-4"
                    style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                  />
                </div>

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
                  <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Description</Label>
                  <Textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Product details..."
                    rows={4}
                    className="mt-2 border rounded-lg text-sm px-4 py-3"
                    style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                  />
                </div>

                {/* Grid Fields - 2 Columns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Price</Label>
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
                    <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Delivery</Label>
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
                    <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Quality</Label>
                    <Input
                      type="text"
                      value={productForm.quality}
                      onChange={(e) => setProductForm({ ...productForm, quality: e.target.value })}
                      placeholder="ISI"
                      className="mt-2 h-12 border rounded-lg text-sm px-4"
                      style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                    />
                  </div>
                </div>

                {/* More Fields - 2 Columns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Standard</Label>
                    <Input
                      type="text"
                      value={productForm.materialStandard}
                      onChange={(e) => setProductForm({ ...productForm, materialStandard: e.target.value })}
                      placeholder="IS 1786"
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
                      placeholder="Bundle"
                      className="mt-2 h-12 border rounded-lg text-sm px-4"
                      style={{ borderColor: '#ddd', background: '#faf9f8', color: '#6b5d54' }}
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Testing</Label>
                    <Input
                      type="text"
                      value={productForm.testingCertificate}
                      onChange={(e) => setProductForm({ ...productForm, testingCertificate: e.target.value })}
                      placeholder="Certificate"
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
                      placeholder="In Stock"
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
                  <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Grades</Label>
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
                  <Label className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Features</Label>
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

                {/* Checkbox Agreement */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agree"
                    className="mt-1 w-4 h-4 cursor-pointer"
                    style={{ accentColor: '#c1482b' }}
                  />
                  <label htmlFor="agree" className="text-sm" style={{ color: '#6b5d54' }}>
                    I confirm that the product information is accurate and complete. *
                  </label>
                </div>
              </div>

              {/* Privacy Notice */}
              <p className="text-xs mt-6" style={{ color: '#6b5d54' }}>
                By submitting this form, you agree to our Terms of Service and Privacy Policy. We respect your privacy and will only use your information to process your product listing.
              </p>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-8 py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg bg-gradient-to-r from-primary via-primary-glow to-secondary hover:scale-105 duration-300 relative overflow-hidden group"
              >
                <Send className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{loading ? 'Adding Product...' : 'Add to Account'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Info Column - 1/3 width */}
            <div className="bg-white rounded-lg p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
              <h4 className="text-base font-bold mb-4" style={{ color: '#c1482b' }}>Information</h4>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-primary via-primary-glow to-secondary text-white">
                      <span className="text-lg">📋</span>
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: '#1a1a1a' }}>Complete All Fields</p>
                      <p className="text-sm" style={{ color: '#6b5d54' }}>Fill in all required information for your product</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-primary via-primary-glow to-secondary text-white">
                      <span className="text-lg">🖼️</span>
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: '#1a1a1a' }}>Add Product Image</p>
                      <p className="text-sm" style={{ color: '#6b5d54' }}>Upload a clear product image for better visibility</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-primary via-primary-glow to-secondary text-white">
                      <span className="text-lg">⚡</span>
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: '#1a1a1a' }}>Quick Access</p>
                      <p className="text-sm" style={{ color: '#6b5d54' }}>Your products will be instantly available on your account</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 2 Column Layout - Form & Info */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
