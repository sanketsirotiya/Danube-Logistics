'use client';

import { useState, useEffect } from 'react';
import { useInvoices } from '@/lib/hooks/invoices/useInvoices';
import { useCreateInvoice } from '@/lib/hooks/invoices/useCreateInvoice';
import { useUpdateInvoice } from '@/lib/hooks/invoices/useUpdateInvoice';
import { useDeleteInvoice } from '@/lib/hooks/invoices/useDeleteInvoice';
import { useTrips } from '@/lib/hooks/trips/useTrips';
import type { Invoice } from '@/lib/types';

type Trip = {
  id: string;
  customer: {
    id: string;
    name: string;
    pricingType: string;
  };
  pickupLocation: string;
  dropoffLocation: string;
  distanceMiles: number | null;
  status: string;
  container?: {
    number: string;
  };
};

type ChargeType = {
  id: string;
  code: string;
  name: string;
  defaultRate: number;
  calculationUnit: string;
};

export default function InvoicesPage() {
  const { data: invoices = [], isLoading: invoicesLoading, error: invoicesError } = useInvoices();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  // Fetch trips data
  const { data: tripsData = [] } = useTrips();
  const completedTrips = (tripsData as any[]).filter((t: any) => t.status === 'COMPLETED') as Trip[];

  const [showForm, setShowForm] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [chargeTypes, setChargeTypes] = useState<ChargeType[]>([]);

  // Invoice form state
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [taxRate, setTaxRate] = useState('0');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchChargeTypes();
  }, []);

  const fetchChargeTypes = async () => {
    try {
      const response = await fetch('/api/charge-types');
      if (response.ok) {
        const data = await response.json();
        setChargeTypes(data);
      }
    } catch (error) {
      console.error('Error fetching charge types:', error);
    }
  };

  const handleCreateInvoice = (trip: Trip) => {
    setSelectedTrip(trip);

    // Initialize line items based on pricing type
    if (trip.customer.pricingType === 'FLAT') {
      // For FLAT rate, add single line item
      setLineItems([{
        description: `Transport: ${trip.pickupLocation} to ${trip.dropoffLocation}`,
        quantity: 1,
        rate: 500.00, // Default rate - user can edit
        amount: 500.00,
      }]);
    } else {
      // For ITEMIZED, add base rate + empty items for additional charges
      const baseCharge = chargeTypes.find(ct => ct.code === 'BASE_RATE');
      setLineItems([{
        description: `Base Transport Rate`,
        quantity: 1,
        rate: baseCharge?.defaultRate || 400.00,
        amount: baseCharge?.defaultRate || 400.00,
      }]);
    }

    setShowForm(true);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    }]);
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[index][field] = value;

    // Recalculate amount
    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = (updated[index].quantity || 0) * (updated[index].rate || 0);
    }

    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (parseFloat(taxRate) / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTrip) return;

    const subtotal = calculateSubtotal();
    const taxAmount = calculateTax();
    const totalAmount = calculateTotal();

    // Set due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (selectedTrip.customer.pricingType === 'FLAT' ? 30 : 45));

    try {
      await createInvoice.mutateAsync({
        tripId: selectedTrip.id,
        customerId: selectedTrip.customer.id,
        pricingType: selectedTrip.customer.pricingType,
        lineItems,
        subtotal: subtotal.toFixed(2),
        taxRate: taxRate,
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        dueDate: dueDate.toISOString(),
        notes,
      });
      resetForm();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      alert(error?.message || 'Failed to create invoice');
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await updateInvoice.mutateAsync({
        id,
        paid: true,
        paidAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      alert(error?.message || 'Failed to mark invoice as paid');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await deleteInvoice.mutateAsync(id);
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      alert(error?.message || 'Failed to delete invoice');
    }
  };

  const resetForm = () => {
    setSelectedTrip(null);
    setLineItems([]);
    setTaxRate('0');
    setNotes('');
    setShowForm(false);
  };

  const getStatusColor = (invoice: Invoice) => {
    if (invoice.paid) {
      return 'bg-green-100 text-green-800';
    }
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    if (dueDate < now) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (invoice: Invoice) => {
    if (invoice.paid) {
      return 'PAID';
    }
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    if (dueDate < now) {
      return 'OVERDUE';
    }
    return 'PENDING';
  };

  if (invoicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading invoices...</div>
      </div>
    );
  }

  if (invoicesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {invoicesError.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50">
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Invoices & Billing</h1>
                  <p className="text-indigo-100">Generate and manage customer invoices</p>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href="/"
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
                >
                  ← Home
                </a>
                {completedTrips.length > 0 && (
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-white hover:bg-indigo-50 text-indigo-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {showForm ? 'Cancel' : '+ Create Invoice'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-900 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Invoices</div>
              <div className="text-3xl font-bold text-gray-900">{invoices.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Paid</div>
              <div className="text-3xl font-bold text-green-600">
                {invoices.filter((inv) => inv.paid).length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Pending</div>
              <div className="text-3xl font-bold text-yellow-600">
                {invoices.filter((inv) => !inv.paid && new Date(inv.dueDate) >= new Date()).length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Overdue</div>
              <div className="text-3xl font-bold text-red-600">
                {invoices.filter((inv) => !inv.paid && new Date(inv.dueDate) < new Date()).length}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create Invoice from Trip
            </h2>

            {!selectedTrip ? (
              <div>
                <p className="text-gray-600 mb-4">Select a completed trip to create an invoice:</p>
                <div className="space-y-2">
                  {completedTrips.map((trip) => (
                    <button
                      key={trip.id}
                      onClick={() => handleCreateInvoice(trip)}
                      className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{trip.customer.name}</div>
                          <div className="text-sm text-gray-600">
                            {trip.pickupLocation} → {trip.dropoffLocation}
                          </div>
                          <div className="text-xs text-gray-500">
                            Container: {trip.container?.number} • Distance: {trip.distanceMiles || 'N/A'} miles
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          trip.customer.pricingType === 'FLAT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {trip.customer.pricingType}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Trip Details</h3>
                  <div className="text-sm text-gray-600">
                    <div>Customer: {selectedTrip.customer.name} ({selectedTrip.customer.pricingType})</div>
                    <div>Route: {selectedTrip.pickupLocation} → {selectedTrip.dropoffLocation}</div>
                    <div>Distance: {selectedTrip.distanceMiles || 'N/A'} miles</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">Line Items</h3>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Line Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {lineItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            placeholder="Rate"
                            value={item.rate}
                            onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={`$${(item.amount || 0).toFixed(2)}`}
                            readOnly
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700"
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLineItem(index)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Tax Rate (%):</span>
                      <input
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                        step="0.01"
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax Amount:</span>
                      <span className="font-medium">${calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Create Invoice
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
            )}
          </div>
        )}

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Trip Route
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Amount
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
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-gray-400 text-lg">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="font-semibold">No invoices found</div>
                        <div className="text-sm mt-2">Create your first invoice from a completed trip!</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-indigo-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{invoice.customer?.name}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        invoice.pricingType === 'FLAT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {invoice.pricingType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{invoice.trip?.pickupLocation}</div>
                      <div className="text-xs">↓</div>
                      <div>{invoice.trip?.dropoffLocation}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">
                        ${Number(invoice.totalAmount).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Tax: ${Number(invoice.taxAmount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice)}`}
                      >
                        {getStatusText(invoice)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!invoice.paid && (
                        <button
                          onClick={() => handleMarkPaid(invoice.id)}
                          className="text-green-600 hover:text-green-800 font-semibold mr-4 transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(invoice.id)}
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

        {/* Stats */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Invoices</div>
            <div className="text-2xl font-bold text-gray-900">{invoices.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Paid</div>
            <div className="text-2xl font-bold text-green-600">
              {invoices.filter((i) => i.paid).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {invoices.filter((i) => !i.paid && new Date(i.dueDate) >= new Date()).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold text-blue-600">
              ${invoices.filter((i) => i.paid).reduce((sum, i) => sum + Number(i.totalAmount), 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
