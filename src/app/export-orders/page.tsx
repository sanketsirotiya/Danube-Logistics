'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useExportOrders } from '@/lib/hooks/export-orders/useExportOrders';
import { useCreateExportOrder } from '@/lib/hooks/export-orders/useCreateExportOrder';
import { useUpdateExportOrder } from '@/lib/hooks/export-orders/useUpdateExportOrder';
import { useDeleteExportOrder } from '@/lib/hooks/export-orders/useDeleteExportOrder';
import { useCustomers } from '@/lib/hooks/customers/useCustomers';
import { useTerminals } from '@/lib/hooks/terminals/useTerminals';
import { useShipLines } from '@/lib/hooks/shiplines/useShipLines';
import type { ExportOrder, CreateExportOrderInput } from '@/lib/types';

type FormData = {
  customerId: string;
  bookingNumber: string;
  containerSize: string;
  containerType: string;
  numberOfContainers: string; // used only on create to batch — not stored
  priority: string;
  pickupAddress: string;
  portOfDischarge: string;
  requestedPickupDate: string;
  requestedDeliveryDate: string;
  shipLineId: string;
  notes: string;
};

const emptyForm: FormData = {
  customerId: '',
  bookingNumber: '',
  containerSize: '',
  containerType: '',
  numberOfContainers: '1',
  priority: 'STANDARD',
  pickupAddress: '',
  portOfDischarge: '',
  requestedPickupDate: '',
  requestedDeliveryDate: '',
  shipLineId: '',
  notes: '',
};

export default function ExportOrdersPage() {
  const { data: orders = [], isLoading, error } = useExportOrders();
  const createOrder = useCreateExportOrder();
  const updateOrder = useUpdateExportOrder();
  const deleteOrder = useDeleteExportOrder();
  const { data: customers = [] } = useCustomers();
  const { data: terminals = [] } = useTerminals();
  const { data: shipLines = [] } = useShipLines();

  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ExportOrder | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const count = formData.numberOfContainers ? parseInt(formData.numberOfContainers) : 1;
      const data: CreateExportOrderInput = {
        customerId: formData.customerId,
        bookingNumber: formData.bookingNumber,
        containerSize: formData.containerSize as any,
        containerType: formData.containerType as any,
        numberOfContainers: 1,
        priority: formData.priority as any,
        pickupAddress: formData.pickupAddress,
        portOfDischarge: formData.portOfDischarge,
        requestedPickupDate: formData.requestedPickupDate || undefined,
        requestedDeliveryDate: formData.requestedDeliveryDate || undefined,
        shipLineId: formData.shipLineId || undefined,
        notes: formData.notes || undefined,
      };

      if (editingOrder) {
        await updateOrder.mutateAsync({ id: editingOrder.id, ...data });
      } else {
        if (count > 1 && !confirm(`This will create ${count} separate export orders (one per container). Each can be assigned its own driver and pickup. Continue?`)) return;
        for (let i = 0; i < count; i++) {
          await createOrder.mutateAsync(data);
        }
      }
      resetForm();
    } catch (err: any) {
      alert(err?.data?.detail || err?.message || 'Failed to save export order');
    }
  };

  const handleEdit = (order: ExportOrder) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      bookingNumber: order.bookingNumber,
      containerSize: order.containerSize,
      containerType: order.containerType,
      numberOfContainers: '1',
      priority: order.priority,
      pickupAddress: order.pickupAddress,
      portOfDischarge: order.portOfDischarge,
      requestedPickupDate: order.requestedPickupDate?.split('T')[0] || '',
      requestedDeliveryDate: order.requestedDeliveryDate?.split('T')[0] || '',
      shipLineId: order.shipLineId || '',
      notes: order.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this export order?')) return;
    try {
      await deleteOrder.mutateAsync(id);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete export order');
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingOrder(null);
    setShowForm(false);
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
        <div className="text-xl text-gray-600">Loading export orders...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-5">

        {/* Header */}
        <div className="mb-3">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl shadow-md px-5 py-3 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Export Orders</h1>
                  <p className="text-emerald-100 text-sm">Customer → Port · Container pickup outbound</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm text-sm">
                  ← Home
                </Link>
                <Link href="/import-orders" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm text-sm">
                  ← Imports
                </Link>
                <button
                  onClick={() => { if (!showForm) setFormData(emptyForm); setShowForm(!showForm); }}
                  className="bg-white hover:bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
                >
                  {showForm ? 'Cancel' : '+ New Export'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
            {[
              { label: 'Total', value: stats.total, color: 'border-emerald-900', text: 'text-emerald-900' },
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
              {editingOrder ? 'Edit Export Order' : 'New Export Order'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="URGENT">Urgent</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Number *</label>
                <input
                  required
                  type="text"
                  value={formData.bookingNumber}
                  onChange={(e) => setFormData({ ...formData, bookingNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="BK-12345"
                />
              </div>


              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Ship Line</label>
                  <Link href="/shiplines" className="text-xs text-emerald-600 hover:text-emerald-800 font-medium">+ Manage</Link>
                </div>
                <select
                  value={formData.shipLineId}
                  onChange={(e) => setFormData({ ...formData, shipLineId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Size</option>
                  <option value="TWENTY_FT">20 ft</option>
                  <option value="FORTY_FT">40 ft</option>
                  <option value="FORTY_FIVE_FT">45 ft</option>
                </select>
              </div>

              {!editingOrder && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Containers *
                    <span className="ml-2 text-xs text-emerald-600 font-normal">Creates one order per container</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="99"
                    value={formData.numberOfContainers}
                    onChange={(e) => setFormData({ ...formData, numberOfContainers: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Container Type *</label>
                <select
                  required
                  value={formData.containerType}
                  onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Type</option>
                  <option value="DRY">Dry</option>
                  <option value="REEFER">Reefer</option>
                  <option value="TANK">Tank</option>
                  <option value="FLAT_RACK">Flat Rack</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Pick Up Terminal *</label>
                  <Link href="/ports" className="text-xs text-emerald-600 hover:text-emerald-800 font-medium">+ Manage Terminals</Link>
                </div>
                <select
                  required
                  value={formData.pickupAddress}
                  onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Terminal</option>
                  {terminals.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}{t.code ? ` (${t.code})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Delivery Terminal (Port of Discharge) *</label>
                  <Link href="/ports" className="text-xs text-emerald-600 hover:text-emerald-800 font-medium">+ Manage Ports</Link>
                </div>
                <select
                  required
                  value={formData.portOfDischarge}
                  onChange={(e) => setFormData({ ...formData, portOfDischarge: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Port</option>
                  {terminals.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}{t.code ? ` (${t.code})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested Pickup Date</label>
                <input
                  type="date"
                  value={formData.requestedPickupDate}
                  onChange={(e) => setFormData({ ...formData, requestedPickupDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested Delivery to Port Date</label>
                <input
                  type="date"
                  value={formData.requestedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>


              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                  placeholder="Additional notes"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                >
                  {editingOrder ? 'Update Export Order' : 'Create Export Order'}
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
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Container</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup → Port</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    <div className="font-semibold">No export orders yet</div>
                    <div className="text-sm mt-1">Create your first export order above.</div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-emerald-50 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">BK: {order.bookingNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {order.customer?.name
                        ? <Link href={`/customers/${order.customerId}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">{order.customer.name}</Link>
                        : <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-500">
                        {order.containerSize?.replace('_FT', ' ft').replace('TWENTY', '20').replace('FORTY_FIVE', '45').replace('FORTY', '40')} · {order.containerType}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <div className="text-sm text-gray-900 truncate">{order.pickupAddress}</div>
                      <div className="text-xs text-gray-500 truncate">→ {order.portOfDischarge}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {order.requestedPickupDate ? new Date(order.requestedPickupDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(order)} className="text-emerald-600 hover:text-emerald-800 font-semibold mr-3 transition-colors">Edit</button>
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
