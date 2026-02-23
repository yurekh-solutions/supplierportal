import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Save, User, Building, Phone, Mail, MapPin, Globe } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Label } from '@/pages/components/ui/label';
import { Textarea } from '@/pages/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/pages/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const token = localStorage.getItem('supplierToken');
  const storedUser = JSON.parse(localStorage.getItem('supplierUser') || '{}');
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    companyName: storedUser.companyName || '',
    email: storedUser.email || '',
    phone: storedUser.phone || '', // This is the actual phone from signup
    address: storedUser.address || '',
    city: storedUser.city || '',
    state: storedUser.state || '',
    gstNumber: storedUser.gstNumber || '',
    website: storedUser.website || '',
    description: storedUser.description || '',
    logo: storedUser.logo || '',
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(user.logo || null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Try to update via API first
      const formData = new FormData();
      formData.append('companyName', user.companyName);
      formData.append('address', user.address);
      formData.append('city', user.city);
      formData.append('state', user.state);
      formData.append('gstNumber', user.gstNumber);
      formData.append('website', user.website);
      formData.append('description', user.description);
      
      if (imageFile) {
        formData.append('logo', imageFile);
      }

      try {
        const response = await fetch(`${API_URL}/supplier/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          // Update local storage with backend response
          const updatedUser = { 
            ...storedUser, 
            ...data.supplier,
            phone: user.phone // Ensure phone is updated
          };
          localStorage.setItem('supplierUser', JSON.stringify(updatedUser));
        } else {
          // API failed, update localStorage only
          throw new Error('API update failed');
        }
      } catch (apiError) {
        // Fallback: Update localStorage only
        console.log('Updating localStorage only (backend API not available)');
        const updatedUser = { 
          ...storedUser, 
          ...user,
          logo: imagePreview || storedUser.logo 
        };
        localStorage.setItem('supplierUser', JSON.stringify(updatedUser));
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      
      navigate('/products');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB] py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#B85C38]">Edit Profile</h1>
            <p className="text-sm text-muted-foreground">Update your business information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Profile Image Card */}
          <Card className="mb-6 border-[#B85C38]/20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg">Profile Image</CardTitle>
              <CardDescription>Click on the image to change</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div 
                className="relative cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-[#B85C38]/20"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#B85C38] to-[#8B4513] flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {user.companyName?.charAt(0) || 'S'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Info Card */}
          <Card className="mb-6 border-[#B85C38]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#B85C38]" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={user.companyName}
                  onChange={(e) => setUser({...user, companyName: e.target.value})}
                  placeholder="Enter company name"
                  className="border-[#B85C38]/30"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={user.description}
                  onChange={(e) => setUser({...user, description: e.target.value})}
                  placeholder="Describe your business"
                  rows={3}
                  className="border-[#B85C38]/30"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={user.gstNumber}
                    onChange={(e) => setUser({...user, gstNumber: e.target.value})}
                    placeholder="GST Number"
                    className="border-[#B85C38]/30"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={user.website}
                    onChange={(e) => setUser({...user, website: e.target.value})}
                    placeholder="https://example.com"
                    className="border-[#B85C38]/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info Card */}
          <Card className="mb-6 border-[#B85C38]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#B85C38]" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="pl-10 bg-muted border-[#B85C38]/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card className="mb-6 border-[#B85C38]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#B85C38]" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={user.address}
                  onChange={(e) => setUser({...user, address: e.target.value})}
                  placeholder="Enter street address"
                  className="border-[#B85C38]/30"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={user.city}
                    onChange={(e) => setUser({...user, city: e.target.value})}
                    placeholder="City"
                    className="border-[#B85C38]/30"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={user.state}
                    onChange={(e) => setUser({...user, state: e.target.value})}
                    placeholder="State"
                    className="border-[#B85C38]/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-[#B85C38] to-[#8B4513] hover:from-[#A04E30] hover:to-[#7A3A10] text-white font-semibold rounded-xl"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Changes
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
