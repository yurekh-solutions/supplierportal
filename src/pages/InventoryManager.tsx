import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/components/ui/card';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Label } from '@/pages/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/pages/components/ui/dialog';
import { Badge } from '@/pages/components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  Edit, 
  Search,
  ArrowLeft,
  ChevronDown,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface InventoryItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    category: string;
    image?: string;
  };
  stock: {
    currentQuantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    unit: string;
    minimumStockLevel: number;
    reorderPoint: number;
  };
  pricing: {
    costPrice: number;
    sellingPrice: number;
    mrp?: number;
    discount: number;
    taxRate: number;
    currency: string;
  };
  sku?: string;
  status: string;
  alerts: {
    lowStockAlert: boolean;
    outOfStockAlert: boolean;
  };
}

const InventoryManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<{ lowStock: InventoryItem[], outOfStock: InventoryItem[], totalAlerts: number }>({ 
    lowStock: [], 
    outOfStock: [], 
    totalAlerts: 0 
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [updateForm, setUpdateForm] = useState({
    quantity: 0,
    type: 'purchase',
    reason: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchInventory();
    fetchAlerts();
  }, []);

  useEffect(() => {
    filterInventoryData();
  }, [inventory, searchQuery, filterStatus]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/inventory`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setInventory(data.data);
        setFilteredInventory(data.data);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch inventory',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to server',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/inventory/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const filterInventoryData = () => {
    let filtered = [...inventory];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'low_stock') {
        filtered = filtered.filter(item => item.alerts.lowStockAlert);
      } else if (filterStatus === 'out_of_stock') {
        filtered = filtered.filter(item => item.alerts.outOfStockAlert);
      } else {
        filtered = filtered.filter(item => item.status === filterStatus);
      }
    }

    setFilteredInventory(filtered);
  };

  const handleUpdateStock = async () => {
    if (!selectedItem || !updateForm.quantity) {
      toast({
        title: 'Error',
        description: 'Please enter a valid quantity',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/inventory/${selectedItem._id}/stock`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity: updateForm.quantity,
          type: updateForm.type,
          reason: updateForm.reason || 'Manual update'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Stock updated successfully'
        });
        setShowUpdateDialog(false);
        setUpdateForm({ quantity: 0, type: 'purchase', reason: '' });
        fetchInventory();
        fetchAlerts();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update stock',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to update stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to server',
        variant: 'destructive'
      });
    }
  };

  const openUpdateDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setUpdateForm({ quantity: 0, type: 'purchase', reason: '' });
    setShowUpdateDialog(true);
  };

  const quickStockUpdate = async (item: InventoryItem, quantity: number, type: 'purchase' | 'sale') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/inventory/${item._id}/stock`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity,
          type,
          reason: 'Quick adjustment'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: `Stock ${type === 'purchase' ? 'added' : 'removed'} successfully`
        });
        fetchInventory();
        fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                Inventory Manager
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your stock levels and track inventory
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/dashboard/add-product')}
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="all">All Items</option>
            <option value="active">Active</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Alert Cards */}
      {(alerts.lowStock.length > 0 || alerts.outOfStock.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {alerts.lowStock.length > 0 && (
            <Card className="border-orange-300 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-orange-600 flex items-center text-lg">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Low Stock Alert ({alerts.lowStock.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {alerts.lowStock.slice(0, 5).map((item) => (
                    <div key={item._id} className="text-sm flex justify-between items-center">
                      <span className="font-medium">{item.productId?.name}</span>
                      <Badge variant="outline" className="bg-white">
                        {item.stock.availableQuantity} {item.stock.unit}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {alerts.outOfStock.length > 0 && (
            <Card className="border-red-300 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-600 flex items-center text-lg">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Out of Stock ({alerts.outOfStock.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {alerts.outOfStock.slice(0, 5).map((item) => (
                    <div key={item._id} className="text-sm font-medium">
                      {item.productId?.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {inventory.filter(i => i.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {alerts.lowStock.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.outOfStock.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>All Inventory ({filteredInventory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No inventory items found</p>
              <p className="text-sm text-gray-500">Add products to start tracking inventory</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInventory.map((item) => (
                <div 
                  key={item._id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.productId?.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-gray-500">SKU: {item.sku || 'N/A'}</p>
                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                        {item.alerts.lowStockAlert && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                            Low Stock
                          </Badge>
                        )}
                        {item.alerts.outOfStockAlert && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        item.alerts.outOfStockAlert ? 'text-red-600' :
                        item.alerts.lowStockAlert ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {item.stock.availableQuantity}
                      </p>
                      <p className="text-sm text-gray-500">{item.stock.unit}</p>
                      {item.stock.reservedQuantity > 0 && (
                        <p className="text-xs text-gray-400">
                          ({item.stock.reservedQuantity} reserved)
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-600 border-green-300 hover:bg-green-50"
                        onClick={() => quickStockUpdate(item, 10, 'purchase')}
                      >
                        +10
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => quickStockUpdate(item, 1, 'sale')}
                      >
                        -1
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openUpdateDialog(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right min-w-[100px]">
                      <p className="font-semibold">₹{item.pricing.sellingPrice.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Cost: ₹{item.pricing.costPrice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Stock Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock - {selectedItem?.productId?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Current Stock</Label>
              <p className="text-2xl font-bold text-green-600">
                {selectedItem?.stock.currentQuantity} {selectedItem?.stock.unit}
              </p>
            </div>
            
            <div>
              <Label>Movement Type</Label>
              <select
                value={updateForm.type}
                onChange={(e) => setUpdateForm({ ...updateForm, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="purchase">Purchase (Add Stock)</option>
                <option value="sale">Sale (Remove Stock)</option>
                <option value="return">Return (Add Stock)</option>
                <option value="damaged">Damaged (Remove Stock)</option>
                <option value="adjustment">Adjustment (Set Exact)</option>
              </select>
            </div>
            
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={updateForm.quantity}
                onChange={(e) => setUpdateForm({ ...updateForm, quantity: Number(e.target.value) })}
                placeholder="Enter quantity"
                min="0"
              />
              {updateForm.type === 'adjustment' && (
                <p className="text-xs text-gray-500 mt-1">
                  This will set the stock to exactly {updateForm.quantity} {selectedItem?.stock.unit}
                </p>
              )}
            </div>
            
            <div>
              <Label>Reason (Optional)</Label>
              <Input
                value={updateForm.reason}
                onChange={(e) => setUpdateForm({ ...updateForm, reason: e.target.value })}
                placeholder="Why are you updating stock?"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleUpdateStock}
                className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
              >
                Update Stock
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUpdateDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManager;
