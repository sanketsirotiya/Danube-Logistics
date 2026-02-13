'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
  };
  containerNumber?: string;
  containerSize?: string;
  containerType?: string;
  status: string;
  priority: string;
  portOfLoading: string;
  deliveryAddress: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  requestedPickupDate?: string;
  requestedDeliveryDate?: string;
  actualPickupDate?: string;
  actualDeliveryDate?: string;
  customerReference?: string;
  bookingNumber?: string;
  billOfLading?: string;
  cargoDescription?: string;
  weight?: number;
  specialInstructions?: string;
  notes?: string;
  trip?: any;
  createdAt: string;
  updatedAt: string;
}

export default function DeliveryOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/delivery-orders/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching delivery order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!order) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/delivery-orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...order,
          status: newStatus,
          actualPickupDate: newStatus === 'IN_TRANSIT' && !order.actualPickupDate
            ? new Date().toISOString()
            : order.actualPickupDate,
          actualDeliveryDate: newStatus === 'DELIVERED' && !order.actualDeliveryDate
            ? new Date().toISOString()
            : order.actualDeliveryDate,
        }),
      });

      if (response.ok) {
        fetchOrder();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-300',
      IN_TRANSIT: 'bg-purple-100 text-purple-800 border-purple-300',
      DELIVERED: 'bg-green-100 text-green-800 border-green-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-cyan-100 rounded-xl flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="text-lg font-semibold text-gray-700">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700 mb-4">Order not found</div>
          <Link
            href="/delivery-orders"
            className="text-cyan-600 hover:text-cyan-800 font-semibold"
          >
            ← Back to Delivery Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-50">
      <div className="max-w-6xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">Order #{order.orderNumber}</h1>
                <span className={`px-4 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-cyan-100">Created {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/delivery-orders"
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
              >
                ← Back
              </Link>
              <Link
                href={`/delivery-orders`}
                className="bg-white hover:bg-cyan-50 text-cyan-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={() => router.push(`/delivery-orders?edit=${order.id}`)}
              >
                Edit Order
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Customer Name</div>
                  <div className="font-semibold text-gray-900">{order.customer.name}</div>
                </div>
                {order.customer.email && (
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-semibold text-gray-900">{order.customer.email}</div>
                  </div>
                )}
                {order.customer.phone && (
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-semibold text-gray-900">{order.customer.phone}</div>
                  </div>
                )}
                {order.customerReference && (
                  <div>
                    <div className="text-sm text-gray-500">Customer Reference</div>
                    <div className="font-semibold text-gray-900">{order.customerReference}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Container Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                Container & Cargo Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Container Number</div>
                  <div className="font-semibold text-gray-900">{order.containerNumber || 'Not assigned'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Container Size</div>
                  <div className="font-semibold text-gray-900">
                    {order.containerSize ? order.containerSize.replace('_', ' ') : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Container Type</div>
                  <div className="font-semibold text-gray-900">{order.containerType || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Weight</div>
                  <div className="font-semibold text-gray-900">
                    {order.weight ? `${order.weight.toLocaleString()} lbs` : 'N/A'}
                  </div>
                </div>
                {order.cargoDescription && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">Cargo Description</div>
                    <div className="font-semibold text-gray-900">{order.cargoDescription}</div>
                  </div>
                )}
                {order.bookingNumber && (
                  <div>
                    <div className="text-sm text-gray-500">Booking Number</div>
                    <div className="font-semibold text-gray-900">{order.bookingNumber}</div>
                  </div>
                )}
                {order.billOfLading && (
                  <div>
                    <div className="text-sm text-gray-500">Bill of Lading</div>
                    <div className="font-semibold text-gray-900">{order.billOfLading}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Delivery Information
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Port of Loading</div>
                  <div className="font-semibold text-gray-900 bg-cyan-50 p-3 rounded-lg">
                    {order.portOfLoading}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Delivery Address</div>
                  <div className="font-semibold text-gray-900 bg-green-50 p-3 rounded-lg">
                    {order.deliveryAddress}
                    {order.deliveryCity && `, ${order.deliveryCity}`}
                    {order.deliveryState && `, ${order.deliveryState}`}
                    {order.deliveryZip && ` ${order.deliveryZip}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {(order.specialInstructions || order.notes) && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Additional Information
                </h2>
                {order.specialInstructions && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Special Instructions</div>
                    <div className="text-gray-900 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                      {order.specialInstructions}
                    </div>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Notes</div>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {order.notes}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Update Status</h2>
              <div className="space-y-2">
                {['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={updatingStatus || order.status === status}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                      order.status === status
                        ? 'bg-cyan-600 text-white cursor-default'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">Order Created</div>
                    <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                {order.requestedPickupDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">Requested Pickup</div>
                      <div className="text-xs text-gray-500">{new Date(order.requestedPickupDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}

                {order.actualPickupDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">Picked Up</div>
                      <div className="text-xs text-gray-500">{new Date(order.actualPickupDate).toLocaleString()}</div>
                    </div>
                  </div>
                )}

                {order.requestedDeliveryDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">Expected Delivery</div>
                      <div className="text-xs text-gray-500">{new Date(order.requestedDeliveryDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}

                {order.actualDeliveryDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">Delivered</div>
                      <div className="text-xs text-gray-500">{new Date(order.actualDeliveryDate).toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Priority Badge */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Priority Level</h2>
              <div className={`text-center py-3 rounded-lg font-semibold ${
                order.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                order.priority === 'URGENT' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.priority}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
