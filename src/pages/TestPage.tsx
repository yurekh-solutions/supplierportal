import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/pages/components/ui/card';
import { Button } from '@/pages/components/ui/button';
import { Package, User, LayoutDashboard, LogIn } from 'lucide-react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Supplier Portal Structure</h1>
          <p className="text-lg text-gray-600">
            Successfully organized supplier functionality into dedicated folder structure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LayoutDashboard className="mr-2 h-5 w-5 text-[#B85C38]" />
                Dashboard
              </CardTitle>
              <CardDescription>Supplier dashboard component</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Moved from: <code className="bg-gray-100 px-2 py-1 rounded">/src/pages/SupplierDashboard.tsx</code>
              </p>
              <p className="text-sm text-gray-500">
                Now at: <code className="bg-gray-100 px-2 py-1 rounded">/src/pages/supplier/pages/Dashboard.tsx</code>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LogIn className="mr-2 h-5 w-5 text-[#B85C38]" />
                Login
              </CardTitle>
              <CardDescription>Supplier login page</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Moved from: <code className="bg-gray-100 px-2 py-1 rounded">/src/pages/SupplierLogin.tsx</code>
              </p>
              <p className="text-sm text-gray-500">
                Now at: <code className="bg-gray-100 px-2 py-1 rounded">/src/pages/supplier/pages/Login.tsx</code>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-[#B85C38]" />
                Onboarding
              </CardTitle>
              <CardDescription>Supplier registration form</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Moved from: <code className="bg-gray-100 px-2 py-1 rounded">/src/pages/SupplierOnboarding.tsx</code>
              </p>
              <p className="text-sm text-gray-500">
                Now at: <code className="bg-gray-100 px-2 py-1 rounded">/src/pages/supplier/pages/Onboarding.tsx</code>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-[#B85C38]" />
                Product Dashboard
              </CardTitle>
              <CardDescription>Supplier product management</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Moved from: <code className="bg-gray-100 px-2 py-1 rounded">/src/pages/SupplierProductDashboard.tsx</code>
              </p>
              <p className="text-sm text-gray-500">
                Now at: <code className="bg-gray-100 px-2 py-1 rounded">/src/pages/supplier/pages/ProductDashboard.tsx</code>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">Structure Benefits</h2>
          <ul className="list-disc list-inside text-blue-700 space-y-2">
            <li>✅ Isolated supplier functionality from main application</li>
            <li>✅ Better organization and maintainability</li>
            <li>✅ Easier to scale supplier features independently</li>
            <li>✅ Clear separation of concerns</li>
            <li>✅ Simplified navigation and routing</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link to="/supplier/login">
            <Button className="bg-gradient-to-r from-[#B85C38] to-[#8B4513] hover:from-[#8B4513] hover:to-[#B85C38]">
              Go to Supplier Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestPage;