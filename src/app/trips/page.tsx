'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTrips } from '@/lib/hooks/trips/useTrips';
import { useCreateTrip } from '@/lib/hooks/trips/useCreateTrip';
import { useUpdateTrip } from '@/lib/hooks/trips/useUpdateTrip';
import { useDeleteTrip } from '@/lib/hooks/trips/useDeleteTrip';
import { useCustomers } from '@/lib/hooks/customers/useCustomers';
import { useTrucks } from '@/lib/hooks/trucks/useTrucks';
import { useDrivers } from '@/lib/hooks/drivers/useDrivers';
import { useContainers } from '@/lib/hooks/containers/useContainers';
import { useDeliveryOrders } from '@/lib/hooks/delivery-orders/useDeliveryOrders';
import type { Trip } from '@/lib/types';

type FormData = {
  deliveryOrderId: string;
  customerId: string;
  truckId: string;
  driverId: string;
  containerId: string;
  pickupLocation: string;
  pickupTime: string;
  dropoffLocation: string;
  dropoffTime: string;
  status: string;
  distanceMiles: string;
  chassisReceivedAt: string;
  chassisReturnedAt: string;
  notes: string;
};

type SelectOption = {
  id: string;
  label: string;
};

export default function TripsPage() {
  const { data: trips = [], isLoading: tripsLoading, error: tripsError } = useTrips();
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();

  // Fetch dropdown data
  const { data: customersData = [] } = useCustomers();
  const { data: trucksData = [] } = useTrucks();
  const { data: driversData = [] } = useDrivers();
  const { data: containersData = [] } = useContainers();
  const { data: deliveryOrdersData = [] } = useDeliveryOrders();

  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  // Convert data to dropdown options
  const customers: SelectOption[] = customersData.map((c: any) => ({ id: c.id, label: c.name }));
  const trucks: SelectOption[] = trucksData.map((t: any) => ({ id: t.id, label: `${t.plate} - ${t.make} ${t.model}` }));
  const drivers: SelectOption[] = driversData.map((d: any) => ({ id: d.id, label: d.name }));
  const containers: SelectOption[] = containersData.map((c: any) => ({ id: c.id, label: `${c.number} (${c.size})` }));
  const deliveryOrders = deliveryOrdersData.filter(
    (order: any) => !order.tripId && (order.status === 'PENDING' || order.status === 'ASSIGNED')
  );

  const [formData, setFormData] = useState<FormData>({
    deliveryOrderId: '',
    customerId: '',
    truckId: '',
    driverId: '',
    containerId: '',
    pickupLocation: '',
    pickupTime: '',
    dropoffLocation: '',
    dropoffTime: '',
    status: 'SCHEDULED',
    distanceMiles: '',
    chassisReceivedAt: '',
    chassisReturnedAt: '',
    notes: '',
  });

  const handleDeliveryOrderSelect = (orderId: string) => {
    if (!orderId) {
      // Reset form if no order selected
      setFormData({
        ...formData,
        deliveryOrderId: '',
        pickupLocation: '',
        dropoffLocation: '',
        notes: '',
        containerId: '',
      });
      return;
    }

    const selectedOrder = deliveryOrders.find((order) => order.id === orderId);
    if (selectedOrder) {
      // Try to find matching container by container number
      let matchingContainerId = '';
      if (selectedOrder.containerNumber) {
        const matchingContainer = containers.find(
          (c) => c.label.includes(selectedOrder.containerNumber || '')
        );
        if (matchingContainer) {
          matchingContainerId = matchingContainer.id;
        }
        // Note: Container should exist since it's auto-created with delivery order
        // If not found, user can select manually from dropdown
      }

      setFormData({
        ...formData,
        deliveryOrderId: orderId,
        customerId: selectedOrder.customerId,
        containerId: matchingContainerId,
        pickupLocation: selectedOrder.portOfLoading,
        dropoffLocation: selectedOrder.deliveryAddress,
        notes: `Delivery Order: ${selectedOrder.orderNumber}\nContainer: ${selectedOrder.containerNumber || 'Not specified'} - ${selectedOrder.containerSize || ''} ${selectedOrder.containerType || ''}\n${selectedOrder.specialInstructions || ''}\n${selectedOrder.notes || ''}`.trim(),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tripData = {
        deliveryOrderId: formData.deliveryOrderId || undefined,
        customerId: formData.customerId,
        truckId: formData.truckId,
        driverId: formData.driverId,
        containerId: formData.containerId,
        pickupLocation: formData.pickupLocation,
        pickupTime: formData.pickupTime || undefined,
        dropoffLocation: formData.dropoffLocation,
        dropoffTime: formData.dropoffTime || undefined,
        status: formData.status as any,
        distanceMiles: formData.distanceMiles ? parseFloat(formData.distanceMiles) : undefined,
        chassisReceivedAt: formData.chassisReceivedAt || undefined,
        chassisReturnedAt: formData.chassisReturnedAt || undefined,
        notes: formData.notes || undefined,
      };

      if (editingTrip) {
        await updateTrip.mutateAsync({ id: editingTrip.id, ...tripData });
      } else {
        await createTrip.mutateAsync(tripData);
      }
      resetForm();
    } catch (error: any) {
      console.error('Error saving trip:', error);
      alert(error?.message || 'Failed to save trip');
    }
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({
      deliveryOrderId: trip.deliveryOrderId || '',
      customerId: trip.customerId,
      truckId: trip.truckId,
      driverId: trip.driverId,
      containerId: trip.containerId,
      pickupLocation: trip.pickupLocation,
      pickupTime: trip.pickupTime ? trip.pickupTime.split('T')[0] + 'T' + trip.pickupTime.split('T')[1].substring(0, 5) : '',
      dropoffLocation: trip.dropoffLocation,
      dropoffTime: trip.dropoffTime ? trip.dropoffTime.split('T')[0] + 'T' + trip.dropoffTime.split('T')[1].substring(0, 5) : '',
      status: trip.status,
      distanceMiles: trip.distanceMiles?.toString() || '',
      chassisReceivedAt: trip.chassisReceivedAt ? trip.chassisReceivedAt.split('T')[0] + 'T' + trip.chassisReceivedAt.split('T')[1].substring(0, 5) : '',
      chassisReturnedAt: trip.chassisReturnedAt ? trip.chassisReturnedAt.split('T')[0] + 'T' + trip.chassisReturnedAt.split('T')[1].substring(0, 5) : '',
      notes: trip.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      await deleteTrip.mutateAsync(id);
    } catch (error: any) {
      console.error('Error deleting trip:', error);
      alert(error?.message || 'Failed to delete trip');
    }
  };

  const resetForm = () => {
    setFormData({
      deliveryOrderId: '',
      customerId: '',
      truckId: '',
      driverId: '',
      containerId: '',
      pickupLocation: '',
      pickupTime: '',
      dropoffLocation: '',
      dropoffTime: '',
      status: 'SCHEDULED',
      distanceMiles: '',
      chassisReceivedAt: '',
      chassisReturnedAt: '',
      notes: '',
    });
    setEditingTrip(null);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (tripsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading trips...</div>
      </div>
    );
  }

  if (tripsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {tripsError.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50">
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Trips Management</h1>
                  <p className="text-orange-100">Manage and track all container trips and deliveries</p>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href="/"
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
                >
                  ← Home
                </a>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-white hover:bg-orange-50 text-orange-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {showForm ? 'Cancel' : '+ Add New Trip'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-900 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Trips</div>
              <div className="text-3xl font-bold text-gray-900">{trips.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Scheduled</div>
              <div className="text-3xl font-bold text-blue-600">
                {trips.filter((t) => t.status === 'SCHEDULED').length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">In Progress</div>
              <div className="text-3xl font-bold text-yellow-600">
                {trips.filter((t) => t.status === 'IN_PROGRESS').length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-600">
                {trips.filter((t) => t.status === 'COMPLETED').length}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingTrip ? 'Edit Trip' : 'Add New Trip'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Order Selection - Spans full width */}
              <div className="md:col-span-2 bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-cyan-900 mb-2">
                  📦 Link to Delivery Order (Optional)
                </label>
                <select
                  value={formData.deliveryOrderId}
                  onChange={(e) => handleDeliveryOrderSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                  disabled={editingTrip !== null}
                >
                  <option value="">-- Create trip manually (no delivery order) --</option>
                  {deliveryOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} - {order.customer?.name} - {order.containerNumber || 'No container'} - {order.portOfLoading} → {order.deliveryAddress}
                    </option>
                  ))}
                </select>
                {formData.deliveryOrderId && (
                  <div className="mt-3 p-3 bg-cyan-100 rounded-lg">
                    <p className="text-sm font-semibold text-cyan-900 mb-1">✓ Auto-filled from delivery order:</p>
                    <ul className="text-xs text-cyan-800 space-y-1 ml-4">
                      <li>• Customer</li>
                      <li>• Container (if found in system)</li>
                      <li>• Pickup Location (port)</li>
                      <li>• Dropoff Location (delivery address)</li>
                      <li>• Notes (order details & instructions)</li>
                    </ul>
                  </div>
                )}
                {editingTrip && (
                  <p className="mt-2 text-sm text-gray-600">
                    ℹ️ Delivery order cannot be changed when editing an existing trip.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Truck *
                </label>
                <select
                  required
                  value={formData.truckId}
                  onChange={(e) => setFormData({ ...formData, truckId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select truck...</option>
                  {trucks.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver *
                </label>
                <select
                  required
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select driver...</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Container *
                </label>
                <select
                  required
                  value={formData.containerId}
                  onChange={(e) => setFormData({ ...formData, containerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select container...</option>
                  {containers.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Port of Los Angeles"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dropoff Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.dropoffLocation}
                  onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Warehouse District"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dropoff Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.dropoffTime}
                  onChange={(e) => setFormData({ ...formData, dropoffTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance (miles)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.distanceMiles}
                  onChange={(e) => setFormData({ ...formData, distanceMiles: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chassis Received At
                </label>
                <input
                  type="datetime-local"
                  value={formData.chassisReceivedAt}
                  onChange={(e) => setFormData({ ...formData, chassisReceivedAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chassis Returned At
                </label>
                <input
                  type="datetime-local"
                  value={formData.chassisReturnedAt}
                  onChange={(e) => setFormData({ ...formData, chassisReturnedAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {editingTrip ? 'Update Trip' : 'Create Trip'}
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

        {/* Trips Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Trip Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="text-gray-400 text-lg">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <div className="font-semibold">No trips found</div>
                        <div className="text-sm mt-2">Add your first trip to get started!</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-orange-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {trip.truck?.plate} - {trip.driver?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Container: {trip.container?.number} ({trip.container?.size})
                        </div>
                        {trip.distanceMiles && (
                          <div className="text-xs text-gray-500">
                            Distance: {Number(trip.distanceMiles).toFixed(1)} miles
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {trip.customer?.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-gray-900">{trip.pickupLocation}</div>
                      <div className="text-xs text-gray-500">↓</div>
                      <div className="text-gray-900">{trip.dropoffLocation}</div>
                      {trip.pickupTime && (
                        <div className="text-xs text-gray-500 mt-1">
                          Pickup: {new Date(trip.pickupTime).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          trip.status
                        )}`}
                      >
                        {trip.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/trips/${trip.id}`}
                        className="text-purple-600 hover:text-purple-800 font-semibold mr-4 transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleEdit(trip)}
                        className="text-blue-600 hover:text-blue-800 font-semibold mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(trip.id)}
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
