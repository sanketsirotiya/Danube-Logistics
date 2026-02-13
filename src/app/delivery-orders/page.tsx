'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDeliveryOrders } from '@/lib/hooks/delivery-orders/useDeliveryOrders';
import { useCreateDeliveryOrder } from '@/lib/hooks/delivery-orders/useCreateDeliveryOrder';
import { useUpdateDeliveryOrder } from '@/lib/hooks/delivery-orders/useUpdateDeliveryOrder';
import { useDeleteDeliveryOrder } from '@/lib/hooks/delivery-orders/useDeleteDeliveryOrder';
import { useCustomers } from '@/lib/hooks/customers/useCustomers';
import type { DeliveryOrder } from '@/lib/types';

export default function DeliveryOrdersPage() {
  const { data: deliveryOrders = [], isLoading, error } = useDeliveryOrders();
  const createDeliveryOrder = useCreateDeliveryOrder();
  const updateDeliveryOrder = useUpdateDeliveryOrder();
  const deleteDeliveryOrder = useDeleteDeliveryOrder();
  const { data: customers = [] } = useCustomers();

  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<DeliveryOrder | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    containerNumber: '',
    containerSize: '',
    containerType: '',
    priority: 'STANDARD',
    portOfLoading: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZip: '',
    requestedPickupDate: '',
    requestedDeliveryDate: '',
    customerReference: '',
    bookingNumber: '',
    billOfLading: '',
    cargoDescription: '',
    weight: '',
    specialInstructions: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const orderData = {
        customerId: formData.customerId,
        containerNumber: formData.containerNumber || undefined,
        containerSize: formData.containerSize as any,
        containerType: formData.containerType as any,
        priority: formData.priority as any,
        portOfLoading: formData.portOfLoading,
        deliveryAddress: formData.deliveryAddress,
        deliveryCity: formData.deliveryCity || undefined,
        deliveryState: formData.deliveryState || undefined,
        deliveryZip: formData.deliveryZip || undefined,
        requestedPickupDate: formData.requestedPickupDate || undefined,
        requestedDeliveryDate: formData.requestedDeliveryDate || undefined,
        customerReference: formData.customerReference || undefined,
        bookingNumber: formData.bookingNumber || undefined,
        billOfLading: formData.billOfLading || undefined,
        cargoDescription: formData.cargoDescription || undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        specialInstructions: formData.specialInstructions || undefined,
        notes: formData.notes || undefined,
      };

      if (editingOrder) {
        await updateDeliveryOrder.mutateAsync({ id: editingOrder.id, ...orderData });
      } else {
        await createDeliveryOrder.mutateAsync(orderData);
      }
      resetForm();
    } catch (error: any) {
      console.error('Error saving delivery order:', error);
      alert(error?.message || 'Failed to save delivery order');
    }
  };

  const handleEdit = (order: DeliveryOrder) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      containerNumber: order.containerNumber || '',
      containerSize: order.containerSize || '',
      containerType: order.containerType || '',
      priority: order.priority,
      portOfLoading: order.portOfLoading,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity || '',
      deliveryState: order.deliveryState || '',
      deliveryZip: order.deliveryZip || '',
      requestedPickupDate: order.requestedPickupDate?.split('T')[0] || '',
      requestedDeliveryDate: order.requestedDeliveryDate?.split('T')[0] || '',
      customerReference: order.customerReference || '',
      bookingNumber: order.bookingNumber || '',
      billOfLading: order.billOfLading || '',
      cargoDescription: order.cargoDescription || '',
      weight: order.weight?.toString() || '',
      specialInstructions: order.specialInstructions || '',
      notes: order.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery order?')) return;

    try {
      await deleteDeliveryOrder.mutateAsync(id);
    } catch (error: any) {
      console.error('Error deleting delivery order:', error);
      alert(error?.message || 'Failed to delete delivery order');
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      containerNumber: '',
      containerSize: '',
      containerType: '',
      priority: 'STANDARD',
      portOfLoading: '',
      deliveryAddress: '',
      deliveryCity: '',
      deliveryState: '',
      deliveryZip: '',
      requestedPickupDate: '',
      requestedDeliveryDate: '',
      customerReference: '',
      bookingNumber: '',
      billOfLading: '',
      cargoDescription: '',
      weight: '',
      specialInstructions: '',
      notes: '',
    });
    setEditingOrder(null);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      IN_TRANSIT: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      STANDARD: 'bg-gray-100 text-gray-800',
      URGENT: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading delivery orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  const stats = {
    total: deliveryOrders?.length || 0,
    pending: deliveryOrders?.filter(o => o.status === 'PENDING').length || 0,
    inTransit: deliveryOrders?.filter(o => o.status === 'IN_TRANSIT').length || 0,
    delivered: deliveryOrders?.filter(o => o.status === 'DELIVERED').length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-50">
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Delivery Orders</h1>
                  <p className="text-cyan-100">Manage container delivery orders from port to customer locations</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/"
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
                >
                  ← Home
                </Link>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-white hover:bg-cyan-50 text-cyan-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {showForm ? 'Cancel' : '+ New Order'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-900 hover:shadow-lg transition-shadow">
              <div className="text-sm text-gray-600 mb-1">Total Orders</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
              <div className="text-sm text-gray-600 mb-1">Pending</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="text-sm text-gray-600 mb-1">In Transit</div>
              <div className="text-3xl font-bold text-purple-600">{stats.inTransit}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="text-sm text-gray-600 mb-1">Delivered</div>
              <div className="text-3xl font-bold text-green-600">{stats.delivered}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingOrder ? 'Edit Delivery Order' : 'Create New Delivery Order'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="URGENT">Urgent</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Container Number
                </label>
                <input
                  type="text"
                  value={formData.containerNumber}
                  onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="ABCD1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Container Size
                </label>
                <select
                  value={formData.containerSize}
                  onChange={(e) => setFormData({ ...formData, containerSize: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select Size</option>
                  <option value="TWENTY_FT">20 ft</option>
                  <option value="FORTY_FT">40 ft</option>
                  <option value="FORTY_FIVE_FT">45 ft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Container Type
                </label>
                <select
                  value={formData.containerType}
                  onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select Type</option>
                  <option value="DRY">Dry</option>
                  <option value="REEFER">Reefer</option>
                  <option value="TANK">Tank</option>
                  <option value="FLAT_RACK">Flat Rack</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="25000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Port of Loading *
                </label>
                <input
                  type="text"
                  required
                  value={formData.portOfLoading}
                  onChange={(e) => setFormData({ ...formData, portOfLoading: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Port of Los Angeles"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.deliveryCity}
                  onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Los Angeles"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.deliveryState}
                  onChange={(e) => setFormData({ ...formData, deliveryState: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="CA"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.deliveryZip}
                  onChange={(e) => setFormData({ ...formData, deliveryZip: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="90001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Pickup Date
                </label>
                <input
                  type="date"
                  value={formData.requestedPickupDate}
                  onChange={(e) => setFormData({ ...formData, requestedPickupDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.requestedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Reference
                </label>
                <input
                  type="text"
                  value={formData.customerReference}
                  onChange={(e) => setFormData({ ...formData, customerReference: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="PO-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Number
                </label>
                <input
                  type="text"
                  value={formData.bookingNumber}
                  onChange={(e) => setFormData({ ...formData, bookingNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="BK-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill of Lading
                </label>
                <input
                  type="text"
                  value={formData.billOfLading}
                  onChange={(e) => setFormData({ ...formData, billOfLading: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="BOL-12345"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo Description
                </label>
                <input
                  type="text"
                  value={formData.cargoDescription}
                  onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Electronics, fragile items"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={2}
                  placeholder="Handle with care, temperature controlled"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={2}
                  placeholder="Additional notes"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {editingOrder ? 'Update Order' : 'Create Order'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Container
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!deliveryOrders || deliveryOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="text-gray-400 text-lg">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="font-semibold">No delivery orders found</div>
                        <div className="text-sm mt-2">Create your first delivery order to get started!</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  deliveryOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-cyan-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{order.orderNumber}</div>
                        {order.customerReference && (
                          <div className="text-xs text-gray-500">Ref: {order.customerReference}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.customer?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.containerNumber || 'N/A'}</div>
                        {order.containerSize && (
                          <div className="text-xs text-gray-500">
                            {order.containerSize.replace('_', ' ')} - {order.containerType}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{order.portOfLoading}</div>
                        <div className="text-xs text-gray-500">→ {order.deliveryCity || order.deliveryAddress}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.requestedDeliveryDate
                          ? new Date(order.requestedDeliveryDate).toLocaleDateString()
                          : 'Not set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                          {order.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/delivery-orders/${order.id}`}
                          className="text-cyan-600 hover:text-cyan-800 font-semibold mr-4 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleEdit(order)}
                          className="text-blue-600 hover:text-blue-800 font-semibold mr-4 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
