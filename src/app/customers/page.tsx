'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCustomers } from '@/lib/hooks/customers/useCustomers';
import { useCreateCustomer } from '@/lib/hooks/customers/useCreateCustomer';
import { useUpdateCustomer } from '@/lib/hooks/customers/useUpdateCustomer';
import { useDeleteCustomer } from '@/lib/hooks/customers/useDeleteCustomer';
import { useCustomerLocations } from '@/lib/hooks/customer-locations/useCustomerLocations';
import { useCreateCustomerLocation } from '@/lib/hooks/customer-locations/useCreateCustomerLocation';
import { useUpdateCustomerLocation } from '@/lib/hooks/customer-locations/useUpdateCustomerLocation';
import { useDeleteCustomerLocation } from '@/lib/hooks/customer-locations/useDeleteCustomerLocation';
import type { Customer, CustomerLocation } from '@/lib/types';

type FormData = {
  name: string;
  email: string;
  phone: string;
  pricingType: string;
  billingAddress: string;
  paymentTerms: string;
};

type LocFormData = {
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

function CustomerLocationsPanel({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const { data: locations = [], isLoading } = useCustomerLocations(customerId);
  const createLocation = useCreateCustomerLocation(customerId);
  const updateLocation = useUpdateCustomerLocation(customerId);
  const deleteLocation = useDeleteCustomerLocation(customerId);

  const emptyLocForm: LocFormData = { label: '', street: '', city: '', state: '', zip: '', isDefault: false };
  const [locForm, setLocForm] = useState<LocFormData>(emptyLocForm);
  const [editingLocId, setEditingLocId] = useState<string | null>(null);

  const handleLocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLocId) {
        await updateLocation.mutateAsync({ id: editingLocId, customerId, ...locForm });
      } else {
        await createLocation.mutateAsync(locForm);
      }
      setLocForm(emptyLocForm);
      setEditingLocId(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to save location');
    }
  };

  const handleLocEdit = (loc: CustomerLocation) => {
    setEditingLocId(loc.id);
    setLocForm({ label: loc.label, street: loc.street, city: loc.city, state: loc.state, zip: loc.zip, isDefault: loc.isDefault });
  };

  const handleLocDelete = async (id: string) => {
    if (!confirm('Delete this location?')) return;
    try { await deleteLocation.mutateAsync(id); } catch (err: any) { alert(err?.message || 'Failed'); }
  };

  return (
    <div className="bg-purple-50 border-t border-purple-200 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h4 className="font-semibold text-purple-800 text-sm">Delivery Locations</h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-purple-500 hover:text-purple-700 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-purple-100 transition-colors"
        >
          ✕ Close
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Form */}
        <form onSubmit={handleLocSubmit} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <input
                type="text"
                required
                placeholder="Label (e.g. Main Warehouse)"
                value={locForm.label}
                onChange={(e) => setLocForm({ ...locForm, label: e.target.value })}
                className="w-full border border-purple-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="col-span-2">
              <input
                type="text"
                required
                placeholder="Street Address"
                value={locForm.street}
                onChange={(e) => setLocForm({ ...locForm, street: e.target.value })}
                className="w-full border border-purple-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <input
              type="text"
              required
              placeholder="City"
              value={locForm.city}
              onChange={(e) => setLocForm({ ...locForm, city: e.target.value })}
              className="border border-purple-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="text"
              required
              placeholder="State"
              value={locForm.state}
              maxLength={2}
              onChange={(e) => setLocForm({ ...locForm, state: e.target.value })}
              className="border border-purple-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="text"
              placeholder="ZIP"
              value={locForm.zip}
              onChange={(e) => setLocForm({ ...locForm, zip: e.target.value })}
              className="border border-purple-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <label className="flex items-center gap-2 text-sm text-purple-700">
              <input
                type="checkbox"
                checked={locForm.isDefault}
                onChange={(e) => setLocForm({ ...locForm, isDefault: e.target.checked })}
              />
              Default
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {editingLocId ? 'Update' : 'Add Location'}
            </button>
            {editingLocId && (
              <button
                type="button"
                onClick={() => { setEditingLocId(null); setLocForm(emptyLocForm); }}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Locations list */}
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-purple-500">Loading...</p>
          ) : locations.length === 0 ? (
            <p className="text-sm text-purple-400 text-center py-4">No locations yet</p>
          ) : (
            locations.map((loc) => (
              <div key={loc.id} className="bg-white rounded-lg px-3 py-2 border border-purple-200 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-gray-900">{loc.label}</span>
                    {loc.isDefault && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Default</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{loc.street}, {loc.city}, {loc.state} {loc.zip}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleLocEdit(loc)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                  <button onClick={() => handleLocDelete(loc.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const { data: customers = [], isLoading, error } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const searchParams = useSearchParams();

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const customerId = searchParams.get('customer');
    if (customerId) {
      setExpandedCustomerId(customerId);
      setTimeout(() => {
        document.getElementById(`customer-row-${customerId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [searchParams]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    pricingType: 'FLAT',
    billingAddress: '',
    paymentTerms: '30',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Parse billing address if provided
      let billingAddress = null;
      if (formData.billingAddress.trim()) {
        try {
          billingAddress = JSON.parse(formData.billingAddress);
        } catch {
          alert('Invalid JSON format for billing address');
          return;
        }
      }

      const customerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        pricingType: formData.pricingType as 'FLAT' | 'ITEMIZED',
        billingAddress,
        paymentTerms: parseInt(formData.paymentTerms),
      };

      if (editingCustomer) {
        await updateCustomer.mutateAsync({ id: editingCustomer.id, ...customerData });
      } else {
        await createCustomer.mutateAsync(customerData);
      }
      resetForm();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      alert(error?.message || 'Failed to save customer');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      pricingType: customer.pricingType,
      billingAddress: customer.billingAddress ? JSON.stringify(customer.billingAddress, null, 2) : '',
      paymentTerms: customer.paymentTerms.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      await deleteCustomer.mutateAsync(id);
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      alert(error?.message || 'Failed to delete customer');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      pricingType: 'FLAT',
      billingAddress: '',
      paymentTerms: '30',
    });
    setEditingCustomer(null);
    setShowForm(false);
  };

  const getPricingTypeColor = (type: string) => {
    return type === 'FLAT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        {/* Header */}
        <div className="mb-3">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-md px-5 py-3 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Customers Management</h1>
                  <p className="text-purple-100">Manage your customer accounts and billing preferences</p>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href="/"
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm"
                >
                  ← Home
                </a>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-white hover:bg-purple-50 text-purple-700 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                >
                  {showForm ? 'Cancel' : '+ Add New Customer'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-gray-900 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Customers</div>
              <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Flat Rate</div>
              <div className="text-2xl font-bold text-green-600">
                {customers.filter((c) => c.pricingType === 'FLAT').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Itemized</div>
              <div className="text-2xl font-bold text-blue-600">
                {customers.filter((c) => c.pricingType === 'ITEMIZED').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Routes</div>
              <div className="text-2xl font-bold text-purple-600">
                {customers.reduce((sum, c) => sum + (c.rates?.length || 0), 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-4 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ABC Logistics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@abc.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="555-0123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pricing Type
                </label>
                <select
                  value={formData.pricingType}
                  onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="FLAT">Flat Rate</option>
                  <option value="ITEMIZED">Itemized</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms (NET days)
                </label>
                <input
                  type="number"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                  min="0"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Address (JSON format)
                </label>
                <textarea
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={5}
                  placeholder='{"street": "123 Main St", "city": "Los Angeles", "state": "CA", "zip": "90001"}'
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {editingCustomer ? 'Update Customer' : 'Create Customer'}
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

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Company</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Pricing / Rates</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="text-gray-400 text-lg">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="font-semibold">No customers found</div>
                      <div className="text-sm mt-2">Add your first customer to get started!</div>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <>
                    <tr key={customer.id} id={`customer-row-${customer.id}`} className={`transition-colors duration-150 ${expandedCustomerId === customer.id ? 'bg-purple-50 border-l-4 border-l-purple-500' : 'hover:bg-purple-50'}`}>
                      {/* Company + Payment Terms */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{customer.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-medium">
                            NET {customer.paymentTerms}
                          </span>
                          {customer._count && (
                            <span className="text-xs text-gray-400">
                              {customer._count.trips} trips · {customer._count.invoices} invoices
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4 text-sm">
                        <div className="text-gray-900">{customer.email}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{customer.phone || '—'}</div>
                      </td>

                      {/* Pricing Type + Rates */}
                      <td className="px-5 py-4 text-sm">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${getPricingTypeColor(customer.pricingType)}`}>
                          {customer.pricingType}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {customer.rates && customer.rates.length > 0 ? (
                            <>
                              {customer.rates.length} rate{customer.rates.length > 1 ? 's' : ''} ·{' '}
                              {customer.rates[0].routeFrom && customer.rates[0].routeTo
                                ? `${customer.rates[0].routeFrom} → ${customer.rates[0].routeTo}`
                                : `${customer.rates[0].containerType} $${Number(customer.rates[0].flatRate).toFixed(0)}`}
                              {customer.rates.length > 1 && `, +${customer.rates.length - 1} more`}
                            </>
                          ) : (
                            <span className="text-gray-400">No rates</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:text-blue-800 font-semibold mr-3 transition-colors">Edit</button>
                        <button
                          onClick={() => setExpandedCustomerId(expandedCustomerId === customer.id ? null : customer.id)}
                          className="text-purple-600 hover:text-purple-800 font-semibold mr-3 transition-colors inline-flex items-center gap-1"
                        >
                          {expandedCustomerId === customer.id ? (
                            <>Hide Locations <span className="text-xs">▲</span></>
                          ) : (
                            <>Locations <span className="text-xs">▼</span></>
                          )}
                        </button>
                        <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-800 font-semibold transition-colors">Delete</button>
                      </td>
                    </tr>
                    {expandedCustomerId === customer.id && (
                      <tr key={`${customer.id}-locations`}>
                        <td colSpan={4} className="p-0">
                          <CustomerLocationsPanel customerId={customer.id} onClose={() => setExpandedCustomerId(null)} />
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
