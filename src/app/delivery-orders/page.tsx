'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDeliveryOrders } from '@/lib/hooks/delivery-orders/useDeliveryOrders';
import { useCreateDeliveryOrder } from '@/lib/hooks/delivery-orders/useCreateDeliveryOrder';
import { useUpdateDeliveryOrder } from '@/lib/hooks/delivery-orders/useUpdateDeliveryOrder';
import { useDeleteDeliveryOrder } from '@/lib/hooks/delivery-orders/useDeleteDeliveryOrder';
import { useCustomers } from '@/lib/hooks/customers/useCustomers';
import { useTerminals } from '@/lib/hooks/terminals/useTerminals';
import { useCustomerLocations } from '@/lib/hooks/customer-locations/useCustomerLocations';
import type { DeliveryOrder, DeliveryOrderType } from '@/lib/types';

type FormData = {
  customerId: string;
  orderType: DeliveryOrderType;
  containerNumber: string;
  containerSize: string;
  containerType: string;
  priority: string;
  portOfLoading: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  requestedPickupDate: string;
  requestedDeliveryDate: string;
  customerReference: string;
  bookingNumber: string;
  billOfLading: string;
  weight: string;
  notes: string;
};

const emptyForm: FormData = {
  customerId: '',
  orderType: 'IMPORT',
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
  weight: '',
  notes: '',
};

export default function DeliveryOrdersPage() {
  const { data: deliveryOrders = [], isLoading, error } = useDeliveryOrders();
  const createDeliveryOrder = useCreateDeliveryOrder();
  const updateDeliveryOrder = useUpdateDeliveryOrder();
  const deleteDeliveryOrder = useDeleteDeliveryOrder();
  const { data: customers = [] } = useCustomers();
  const { data: terminals = [] } = useTerminals();

  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<DeliveryOrder | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  const { data: customerLocations = [] } = useCustomerLocations(formData.customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.requestedPickupDate &&
      formData.requestedDeliveryDate &&
      formData.requestedDeliveryDate < formData.requestedPickupDate
    ) {
      alert('Requested Delivery Date must be on or after the Container Available Date.');
      return;
    }
    try {
      const orderData = {
        customerId: formData.customerId,
        orderType: formData.orderType,
        containerNumber: formData.containerNumber || undefined,
        containerSize: formData.containerSize as any,
        containerType: formData.containerType as any,
        priority: formData.priority as any,
        portOfLoading: formData.portOfLoading || undefined,
        deliveryAddress: formData.deliveryAddress,
        deliveryCity: formData.deliveryCity || undefined,
        deliveryState: formData.deliveryState || undefined,
        deliveryZip: formData.deliveryZip || undefined,
        requestedPickupDate: formData.requestedPickupDate || undefined,
        requestedDeliveryDate: formData.requestedDeliveryDate || undefined,
        customerReference: formData.customerReference || undefined,
        bookingNumber: formData.bookingNumber || undefined,
        billOfLading: formData.billOfLading || undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        notes: formData.notes || undefined,
      };

      if (editingOrder) {
        await updateDeliveryOrder.mutateAsync({ id: editingOrder.id, ...orderData });
      } else {
        await createDeliveryOrder.mutateAsync(orderData);
      }
      resetForm();
    } catch (error: any) {
      alert(error?.message || 'Failed to save delivery order');
    }
  };

  const handleEdit = (order: DeliveryOrder) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      orderType: order.orderType,
      containerNumber: order.containerNumber || '',
      containerSize: order.containerSize || '',
      containerType: order.containerType || '',
      priority: order.priority,
      portOfLoading: order.portOfLoading || '',
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity || '',
      deliveryState: order.deliveryState || '',
      deliveryZip: order.deliveryZip || '',
      requestedPickupDate: order.requestedPickupDate?.split('T')[0] || '',
      requestedDeliveryDate: order.requestedDeliveryDate?.split('T')[0] || '',
      customerReference: order.customerReference || '',
      bookingNumber: order.bookingNumber || '',
      billOfLading: order.billOfLading || '',
      weight: order.weight?.toString() || '',
      notes: order.notes || '',
    });
    setSelectedLocationId('');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery order?')) return;
    try {
      await deleteDeliveryOrder.mutateAsync(id);
    } catch (error: any) {
      alert(error?.message || 'Failed to delete delivery order');
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingOrder(null);
    setShowForm(false);
    setSelectedLocationId('');
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
    if (!locationId) return;
    const loc = customerLocations.find((l) => l.id === locationId);
    if (loc) {
      setFormData((prev) => ({
        ...prev,
        deliveryAddress: loc.street,
        deliveryCity: loc.city,
        deliveryState: loc.state,
        deliveryZip: loc.zip,
      }));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      IN_TRANSIT: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      STANDARD: 'bg-gray-100 text-gray-800',
      URGENT: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
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
    total: deliveryOrders.length,
    imports: deliveryOrders.filter(o => o.orderType === 'IMPORT').length,
    exports: deliveryOrders.filter(o => o.orderType === 'EXPORT').length,
    pending: deliveryOrders.filter(o => o.status === 'PENDING').length,
    inTransit: deliveryOrders.filter(o => o.status === 'IN_TRANSIT').length,
    delivered: deliveryOrders.filter(o => o.status === 'DELIVERED').length,
  };

  const isImport = formData.orderType === 'IMPORT';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-5">

        {/* Header */}
        <div className="mb-3">
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-xl shadow-md px-5 py-3 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Delivery Orders</h1>
                  <p className="text-cyan-100">Manage import &amp; export container delivery orders</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm">
                  ← Home
                </Link>
                <button
                  onClick={() => { if (!showForm) { setFormData(emptyForm); } setShowForm(!showForm); }}
                  className="bg-white hover:bg-cyan-50 text-cyan-700 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                >
                  {showForm ? 'Cancel' : '+ New Order'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3">
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-gray-900">
              <div className="text-xs text-gray-600 mb-1">Total</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-blue-500">
              <div className="text-xs text-gray-600 mb-1">Imports</div>
              <div className="text-2xl font-bold text-blue-600">{stats.imports}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-emerald-500">
              <div className="text-xs text-gray-600 mb-1">Exports</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.exports}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-yellow-500">
              <div className="text-xs text-gray-600 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-purple-500">
              <div className="text-xs text-gray-600 mb-1">In Transit</div>
              <div className="text-2xl font-bold text-purple-600">{stats.inTransit}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-green-500">
              <div className="text-xs text-gray-600 mb-1">Delivered</div>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            </div>
          </div>
        </div>

        {/* Order Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-4 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingOrder ? 'Edit Delivery Order' : 'Create New Delivery Order'}
              </h2>
            </div>

            {/* Order Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Type *</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, orderType: 'IMPORT', portOfLoading: '' })}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold border-2 transition-all ${
                    formData.orderType === 'IMPORT'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Import
                  </div>
                  <div className="text-xs font-normal mt-0.5">Port → Customer</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, orderType: 'EXPORT', portOfLoading: '' })}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold border-2 transition-all ${
                    formData.orderType === 'EXPORT'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Export
                  </div>
                  <div className="text-xs font-normal mt-0.5">Customer → Port</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => { setFormData({ ...formData, customerId: e.target.value, deliveryAddress: '', deliveryCity: '', deliveryState: '', deliveryZip: '' }); setSelectedLocationId(''); }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Container Number</label>
                <input
                  type="text"
                  value={formData.containerNumber}
                  onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="ABCD1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Container Size *</label>
                <select
                  required
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Container Type *</label>
                <select
                  required
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="25000"
                />
              </div>

              {/* Port of Loading — Import only */}
              {isImport && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Port of Loading *</label>
                    <Link href="/ports" className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">
                      + Manage Ports
                    </Link>
                  </div>
                  <select
                    required={isImport}
                    value={formData.portOfLoading}
                    onChange={(e) => setFormData({ ...formData, portOfLoading: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select Port</option>
                    {terminals.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}{t.code ? ` (${t.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Delivery Location */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Delivery Location *</label>
                  <Link
                    href={formData.customerId ? `/customers?customer=${formData.customerId}` : '/customers'}
                    className="text-xs text-cyan-600 hover:text-cyan-800 font-medium"
                  >
                    + Manage Locations
                  </Link>
                </div>
                {!formData.customerId ? (
                  <div className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-400 text-sm">
                    Select a customer first
                  </div>
                ) : customerLocations.length === 0 ? (
                  <div className="w-full border border-orange-200 rounded-lg px-4 py-2 bg-orange-50 text-orange-600 text-sm">
                    No saved locations for this customer —{' '}
                    <Link href="/customers" className="underline font-medium hover:text-orange-800">
                      add locations on the Customers page
                    </Link>
                  </div>
                ) : (
                  <select
                    required
                    value={selectedLocationId}
                    onChange={(e) => handleLocationSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select delivery location</option>
                    {customerLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.label} — {loc.street}, {loc.city}, {loc.state} {loc.zip}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Container Available Date</label>
                <p className="text-xs text-gray-400 mb-1">When container is ready at port · Will auto-fill from terminal later</p>
                <input
                  type="date"
                  value={formData.requestedPickupDate}
                  onChange={(e) => setFormData({ ...formData, requestedPickupDate: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    formData.requestedPickupDate && formData.requestedDeliveryDate && formData.requestedPickupDate > formData.requestedDeliveryDate
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {formData.requestedPickupDate && formData.requestedDeliveryDate && formData.requestedPickupDate > formData.requestedDeliveryDate && (
                  <p className="text-xs text-red-500 mt-1">Must be on or before the Requested Delivery Date.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested Delivery Date</label>
                <input
                  type="date"
                  value={formData.requestedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    formData.requestedPickupDate && formData.requestedDeliveryDate && formData.requestedDeliveryDate < formData.requestedPickupDate
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {formData.requestedPickupDate && formData.requestedDeliveryDate && formData.requestedDeliveryDate < formData.requestedPickupDate && (
                  <p className="text-xs text-red-500 mt-1">Must be on or after the Container Available Date.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Reference *</label>
                <input
                  required
                  type="text"
                  value={formData.customerReference}
                  onChange={(e) => setFormData({ ...formData, customerReference: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="PO-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Number</label>
                <input
                  type="text"
                  value={formData.bookingNumber}
                  onChange={(e) => setFormData({ ...formData, bookingNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="BK-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill of Lading</label>
                <input
                  type="text"
                  value={formData.billOfLading}
                  onChange={(e) => setFormData({ ...formData, billOfLading: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="BOL-12345"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
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
                  className={`flex-1 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    isImport
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                  }`}
                >
                  {editingOrder ? 'Update Order' : `Create ${formData.orderType} Order`}
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
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Container</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Del. Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status / Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deliveryOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
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
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="text-sm font-semibold text-gray-900 truncate">{order.orderNumber}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          order.orderType === 'IMPORT' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {order.orderType}
                        </span>
                        {order.customerReference && (
                          <span className="text-xs text-gray-500">Ref: {order.customerReference}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{order.customer?.name || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{order.containerNumber || '—'}</div>
                      {order.containerSize && (
                        <div className="text-xs text-gray-500">
                          {order.containerSize.replace('_FT', ' ft').replace('TWENTY', '20').replace('FORTY_FIVE', '45').replace('FORTY', '40')} · {order.containerType}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      {order.orderType === 'IMPORT' ? (
                        <>
                          <div className="text-sm text-gray-900 truncate">{order.portOfLoading || '—'}</div>
                          <div className="text-xs text-gray-500 truncate">→ {order.deliveryCity || order.deliveryAddress}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm text-gray-900 truncate">{order.deliveryCity || order.deliveryAddress}</div>
                          <div className="text-xs text-gray-500">→ Export</div>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {order.requestedDeliveryDate
                        ? new Date(order.requestedDeliveryDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <div className="mt-1">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                          {order.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <Link href={`/delivery-orders/${order.id}`} className="text-cyan-600 hover:text-cyan-800 font-semibold mr-2 transition-colors">View</Link>
                      <button onClick={() => handleEdit(order)} className="text-blue-600 hover:text-blue-800 font-semibold mr-2 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-800 font-semibold transition-colors">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
