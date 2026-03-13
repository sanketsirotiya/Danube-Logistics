'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useImportOrders } from '@/lib/hooks/import-orders/useImportOrders';
import { useCreateImportOrder } from '@/lib/hooks/import-orders/useCreateImportOrder';
import { useUpdateImportOrder } from '@/lib/hooks/import-orders/useUpdateImportOrder';
import { useDeleteImportOrder } from '@/lib/hooks/import-orders/useDeleteImportOrder';
import { useCustomers } from '@/lib/hooks/customers/useCustomers';
import { useTerminals } from '@/lib/hooks/terminals/useTerminals';
import { useCustomerLocations } from '@/lib/hooks/customer-locations/useCustomerLocations';
import { useShipLines } from '@/lib/hooks/shiplines/useShipLines';
import type { ImportOrder, CreateImportOrderInput } from '@/lib/types';

type FormData = {
  customerId: string;
  containerNumber: string;
  containerSize: string;
  containerType: string;
  priority: string;
  portOfLoading: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  containerAvailableDate: string;
  requestedDeliveryDate: string;
  customerReference: string;
  billOfLading: string;
  shipLineId: string;
  notes: string;
};

const emptyForm: FormData = {
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
  containerAvailableDate: '',
  requestedDeliveryDate: '',
  customerReference: '',
  billOfLading: '',
  shipLineId: '',
  notes: '',
};

export default function ImportOrdersPage() {
  const { data: orders = [], isLoading, error } = useImportOrders();
  const createOrder = useCreateImportOrder();
  const updateOrder = useUpdateImportOrder();
  const deleteOrder = useDeleteImportOrder();
  const { data: customers = [] } = useCustomers();
  const { data: terminals = [] } = useTerminals();
  const { data: shipLines = [] } = useShipLines();

  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ImportOrder | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [selectedLocationId, setSelectedLocationId] = useState('');

  const { data: customerLocations = [] } = useCustomerLocations(formData.customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.containerAvailableDate &&
      formData.requestedDeliveryDate &&
      formData.requestedDeliveryDate < formData.containerAvailableDate
    ) {
      alert('Requested Delivery Date must be on or after the Container Available Date.');
      return;
    }
    try {
      const data: CreateImportOrderInput = {
        customerId: formData.customerId,
        containerNumber: formData.containerNumber,
        containerSize: formData.containerSize as any,
        containerType: formData.containerType as any,
        priority: formData.priority as any,
        portOfLoading: formData.portOfLoading,
        deliveryAddress: formData.deliveryAddress,
        deliveryCity: formData.deliveryCity || undefined,
        deliveryState: formData.deliveryState || undefined,
        deliveryZip: formData.deliveryZip || undefined,
        containerAvailableDate: formData.containerAvailableDate || undefined,
        requestedDeliveryDate: formData.requestedDeliveryDate || undefined,
        customerReference: formData.customerReference || undefined,
        billOfLading: formData.billOfLading || undefined,
        shipLineId: formData.shipLineId || undefined,
        notes: formData.notes || undefined,
      };

      if (editingOrder) {
        await updateOrder.mutateAsync({ id: editingOrder.id, ...data });
      } else {
        await createOrder.mutateAsync(data);
      }
      resetForm();
    } catch (err: any) {
      alert(err?.message || 'Failed to save import order');
    }
  };

  const handleEdit = (order: ImportOrder) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      containerNumber: order.containerNumber,
      containerSize: order.containerSize,
      containerType: order.containerType,
      priority: order.priority,
      portOfLoading: order.portOfLoading,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity || '',
      deliveryState: order.deliveryState || '',
      deliveryZip: order.deliveryZip || '',
      containerAvailableDate: order.containerAvailableDate?.split('T')[0] || '',
      requestedDeliveryDate: order.requestedDeliveryDate?.split('T')[0] || '',
      customerReference: order.customerReference,
      billOfLading: order.billOfLading || '',
      shipLineId: order.shipLineId || '',
      notes: order.notes || '',
    });
    setSelectedLocationId('');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this import order?')) return;
    try {
      await deleteOrder.mutateAsync(id);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete import order');
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading import orders...</div>
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
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    assigned: orders.filter((o) => o.status === 'ASSIGNED').length,
    inTransit: orders.filter((o) => o.status === 'IN_TRANSIT').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-5">

        {/* Header */}
        <div className="mb-3">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md px-5 py-3 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Import Orders</h1>
                  <p className="text-blue-100 text-sm">Port → Customer · Container delivery inbound</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm text-sm">
                  ← Home
                </Link>
                <Link href="/export-orders" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm text-sm">
                  Exports →
                </Link>
                <button
                  onClick={() => { if (!showForm) setFormData(emptyForm); setShowForm(!showForm); }}
                  className="bg-white hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
                >
                  {showForm ? 'Cancel' : '+ New Import'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
            {[
              { label: 'Total', value: stats.total, color: 'border-blue-900', text: 'text-blue-900' },
              { label: 'Pending', value: stats.pending, color: 'border-yellow-500', text: 'text-yellow-600' },
              { label: 'Assigned', value: stats.assigned, color: 'border-blue-500', text: 'text-blue-600' },
              { label: 'In Transit', value: stats.inTransit, color: 'border-purple-500', text: 'text-purple-600' },
              { label: 'Delivered', value: stats.delivered, color: 'border-green-500', text: 'text-green-600' },
            ].map((s) => (
              <div key={s.label} className={`bg-white rounded-lg shadow-sm p-3 border-l-4 ${s.color}`}>
                <div className="text-xs text-gray-600 mb-1">{s.label}</div>
                <div className={`text-2xl font-bold ${s.text}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-4 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingOrder ? 'Edit Import Order' : 'New Import Order'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => {
                    setFormData({ ...formData, customerId: e.target.value, deliveryAddress: '', deliveryCity: '', deliveryState: '', deliveryZip: '' });
                    setSelectedLocationId('');
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="URGENT">Urgent</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Container Number *</label>
                <input
                  required
                  type="text"
                  value={formData.containerNumber}
                  onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABCD1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill of Lading</label>
                <input
                  type="text"
                  value={formData.billOfLading}
                  onChange={(e) => setFormData({ ...formData, billOfLading: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="BOL-12345"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Ship Line</label>
                  <Link href="/shiplines" className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Manage</Link>
                </div>
                <select
                  value={formData.shipLineId}
                  onChange={(e) => setFormData({ ...formData, shipLineId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Ship Line</option>
                  {shipLines.filter(s => s.active).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Container Size *</label>
                <select
                  required
                  value={formData.containerSize}
                  onChange={(e) => setFormData({ ...formData, containerSize: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="DRY">Dry</option>
                  <option value="REEFER">Reefer</option>
                  <option value="TANK">Tank</option>
                  <option value="FLAT_RACK">Flat Rack</option>
                </select>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Port of Loading *</label>
                    <Link href="/ports" className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Manage Ports</Link>
                  </div>
                  <select
                    required
                    value={formData.portOfLoading}
                    onChange={(e) => setFormData({ ...formData, portOfLoading: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Port</option>
                    {terminals.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}{t.code ? ` (${t.code})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Delivery Location *</label>
                    <Link href="/customers" className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Manage Locations</Link>
                  </div>
                  {!formData.customerId ? (
                    <div className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-400 text-sm">Select a customer first</div>
                  ) : customerLocations.length === 0 ? (
                    <div className="w-full border border-orange-200 rounded-lg px-4 py-2 bg-orange-50 text-orange-600 text-sm">
                      No saved locations —{' '}
                      <Link href="/customers" className="underline font-medium hover:text-orange-800">add on Customers page</Link>
                    </div>
                  ) : (
                    <select
                      required
                      value={selectedLocationId}
                      onChange={(e) => handleLocationSelect(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Container Available Date</label>
                  <p className="text-xs text-gray-400 mb-1">When container is ready at port</p>
                  <input
                    type="date"
                    value={formData.containerAvailableDate}
                    onChange={(e) => setFormData({ ...formData, containerAvailableDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requested Delivery Date</label>
                  <input
                    type="date"
                    value={formData.requestedDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.containerAvailableDate && formData.requestedDeliveryDate && formData.requestedDeliveryDate < formData.containerAvailableDate && (
                    <p className="text-xs text-red-500 mt-1">Must be on or after the Container Available Date.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Reference</label>
                <input
                  type="text"
                  value={formData.customerReference}
                  onChange={(e) => setFormData({ ...formData, customerReference: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PO-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Additional notes"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {editingOrder ? 'Update Import Order' : 'Create Import Order'}
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

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Container</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port → Delivery</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Del. Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    <div className="font-semibold">No import orders yet</div>
                    <div className="text-sm mt-1">Create your first import order above.</div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {order.customer?.name
                        ? <Link href={`/customers/${order.customerId}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">{order.customer.name}</Link>
                        : <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{order.containerNumber}</div>
                      <div className="text-xs text-gray-500">
                        {order.containerSize?.replace('_FT', ' ft').replace('TWENTY', '20').replace('FORTY_FIVE', '45').replace('FORTY', '40')} · {order.containerType}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <div className="text-sm text-gray-900 truncate">{order.portOfLoading}</div>
                      <div className="text-xs text-gray-500 truncate">→ {order.deliveryCity || order.deliveryAddress}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {order.requestedDeliveryDate ? new Date(order.requestedDeliveryDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(order)} className="text-blue-600 hover:text-blue-800 font-semibold mr-3 transition-colors">Edit</button>
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
