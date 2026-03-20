import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, Search } from 'lucide-react';
import { useToast } from './components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  deliveryAddress: string;
  expectedDeliveryDate?: string;
  trackingNumber?: string;
  createdAt: string;
}

const statusConfig = {
  pending: { label: 'New Orders', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-500', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-500', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [trackingNumber, setTrackingNumber] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const supplierId = localStorage.getItem('supplierId');
  const token = localStorage.getItem('supplierToken');

  useEffect(() => {
    if (supplierId) {
      fetchOrders();
    }
  }, [supplierId]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/supplier/${supplierId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load orders',
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error loading orders',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string, tracking?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: tracking,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: `Order ${newStatus} successfully`,
        });
        fetchOrders();
        setTrackingNumber({ ...trackingNumber, [orderId]: '' });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update order status',
      });
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.status === activeTab &&
      (order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id.includes(searchTerm))
  );

  const stats = {
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c15738]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
          <p className="text-gray-600">Manage incoming orders and update order status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('pending')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New Orders</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('confirmed')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('processing')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.processing}</p>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('shipped')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Shipped</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.shipped}</p>
                </div>
                <Truck className="w-8 h-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('delivered')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by customer name, product, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Orders Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending">New ({stats.pending})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({stats.confirmed})</TabsTrigger>
            <TabsTrigger value="processing">Processing ({stats.processing})</TabsTrigger>
            <TabsTrigger value="shipped">Shipped ({stats.shipped})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({stats.delivered})</TabsTrigger>
          </TabsList>

          {/* Orders List */}
          {(['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const).map((status) => (
            <TabsContent key={status} value={status} className="space-y-4 mt-6">
              {filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'No orders match your search' : `No ${status} orders at the moment`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-bold text-gray-900">
                              Order #{order._id.slice(-8)}
                            </h3>
                            <Badge className={statusConfig[order.status as keyof typeof statusConfig]?.color || 'bg-gray-500'}>
                              {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-600">Customer</p>
                              <p className="font-semibold">{order.customerName}</p>
                              <p className="text-xs text-gray-500">{order.customerPhone}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Product</p>
                              <p className="font-semibold">{order.productName}</p>
                              <p className="text-xs text-gray-500">
                                Qty: {order.quantity} {order.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Amount</p>
                              <p className="font-semibold text-[#c15738]">₹{order.totalAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Delivery Address</p>
                              <p className="font-semibold text-xs">{order.deliveryAddress}</p>
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 mt-3">
                            Ordered on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 md:w-64">
                          {status === 'pending' && (
                            <>
                              <Button
                                onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accept Order
                              </Button>
                              <Button
                                onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                                variant="outline"
                                className="w-full border-red-500 text-red-500 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                            </>
                          )}

                          {status === 'confirmed' && (
                            <Button
                              onClick={() => handleUpdateStatus(order._id, 'processing')}
                              className="w-full bg-[#c15738] hover:bg-[#5c2d23]"
                            >
                              <Package className="w-4 h-4 mr-2" />
                              Start Processing
                            </Button>
                          )}

                          {status === 'processing' && (
                            <>
                              <Input
                                placeholder="Enter tracking number"
                                value={trackingNumber[order._id] || ''}
                                onChange={(e) =>
                                  setTrackingNumber({ ...trackingNumber, [order._id]: e.target.value })
                                }
                              />
                              <Button
                                onClick={() =>
                                  handleUpdateStatus(order._id, 'shipped', trackingNumber[order._id])
                                }
                                className="w-full bg-[#c15738] hover:bg-[#5c2d23]"
                                disabled={!trackingNumber[order._id]}
                              >
                                <Truck className="w-4 h-4 mr-2" />
                                Mark as Shipped
                              </Button>
                            </>
                          )}

                          {status === 'shipped' && (
                            <>
                              <p className="text-xs text-gray-600 text-center">
                                Tracking: {order.trackingNumber}
                              </p>
                              <Button
                                onClick={() => handleUpdateStatus(order._id, 'delivered')}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Delivered
                              </Button>
                            </>
                          )}

                          {status === 'delivered' && (
                            <Badge className="w-full justify-center bg-green-500 text-white">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
