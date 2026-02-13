'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Trip = {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string | null;
  dropoffTime: string | null;
  status: string;
  distanceMiles: number | null;
  chassisReceivedAt: string | null;
  chassisReturnedAt: string | null;
  notes: string | null;
  customer: { name: string };
  truck: { plate: string };
  driver: { name: string };
  container: { number: string; size: string; type: string };
};

type Expense = {
  id: string;
  category: string;
  description: string;
  amount: number;
  paidBy: string | null;
  paidAt: string;
  receiptUrl: string | null;
  notes: string | null;
};

type Document = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  uploadedBy: string | null;
  uploadedAt: string;
};

type Activity = {
  id: string;
  activityType: string;
  description: string;
  oldValue: string | null;
  newValue: string | null;
  performedBy: string | null;
  createdAt: string;
};

type Tab = 'overview' | 'expenses' | 'documents' | 'activity';

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Expense form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'FUEL',
    description: '',
    amount: '',
    paidBy: '',
    notes: '',
  });

  // Document form state
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    type: 'BOL',
    title: '',
    description: '',
    fileUrl: '',
    fileName: '',
  });

  useEffect(() => {
    if (tripId) {
      fetchTripDetails();
      fetchExpenses();
      fetchDocuments();
      fetchActivities();
    }
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`);
      if (response.ok) {
        const data = await response.json();
        setTrip(data);
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/expenses`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/activity`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm),
      });

      if (response.ok) {
        fetchExpenses();
        fetchActivities();
        setShowExpenseForm(false);
        setExpenseForm({
          category: 'FUEL',
          description: '',
          amount: '',
          paidBy: '',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Delete this expense?')) return;

    try {
      const response = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchExpenses();
        fetchActivities();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/trips/${tripId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentForm),
      });

      if (response.ok) {
        fetchDocuments();
        fetchActivities();
        setShowDocumentForm(false);
        setDocumentForm({
          type: 'BOL',
          title: '',
          description: '',
          fileUrl: '',
          fileName: '',
        });
      }
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Delete this document?')) return;

    try {
      const response = await fetch(`/api/trips/${tripId}/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDocuments();
        fetchActivities();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FUEL':
        return 'bg-orange-100 text-orange-800';
      case 'TOLLS':
        return 'bg-blue-100 text-blue-800';
      case 'REPAIRS':
        return 'bg-red-100 text-red-800';
      case 'MAINTENANCE':
        return 'bg-purple-100 text-purple-800';
      case 'MEALS':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocTypeColor = (type: string) => {
    switch (type) {
      case 'BOL':
        return 'bg-blue-100 text-blue-800';
      case 'POD':
        return 'bg-green-100 text-green-800';
      case 'INVOICE_COPY':
        return 'bg-purple-100 text-purple-800';
      case 'PHOTO':
        return 'bg-pink-100 text-pink-800';
      case 'RECEIPT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return '🔄';
      case 'ASSIGNMENT_CHANGE':
        return '👤';
      case 'LOCATION_UPDATE':
        return '📍';
      case 'DOCUMENT_UPLOAD':
        return '📄';
      case 'EXPENSE_ADDED':
        return '💰';
      case 'NOTE_ADDED':
        return '📝';
      default:
        return '🔔';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading trip details...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Trip not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50">
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                📦 Trip Details
              </h1>
              <p className="text-orange-100">
                {trip.pickupLocation} → {trip.dropoffLocation}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/trips"
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
              >
                ← Back to Trips
              </Link>
            </div>
          </div>
        </div>

        {/* Trip Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Customer</div>
              <div className="text-lg font-bold text-gray-900">{trip.customer.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Truck</div>
              <div className="text-lg font-bold text-gray-900">{trip.truck.plate}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Driver</div>
              <div className="text-lg font-bold text-gray-900">{trip.driver.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Status</div>
              <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(trip.status)}`}>
                {trip.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Container</div>
              <div className="text-lg font-bold text-gray-900">{trip.container.number}</div>
              <div className="text-xs text-gray-500">{trip.container.size} • {trip.container.type}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Distance</div>
              <div className="text-lg font-bold text-gray-900">
                {trip.distanceMiles ? `${trip.distanceMiles} mi` : '-'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Pickup Time</div>
              <div className="text-sm text-gray-700">
                {trip.pickupTime ? new Date(trip.pickupTime).toLocaleString() : 'Not set'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Dropoff Time</div>
              <div className="text-sm text-gray-700">
                {trip.dropoffTime ? new Date(trip.dropoffTime).toLocaleString() : 'Not set'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                📋 Overview
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  activeTab === 'expenses'
                    ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                💰 Expenses ({expenses.length})
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  activeTab === 'documents'
                    ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                📄 Documents ({documents.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  activeTab === 'activity'
                    ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                📝 Activity Log ({activities.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Route Details</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Pickup</div>
                        <div className="text-base font-bold text-gray-900">{trip.pickupLocation}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-8">
                      <span className="text-gray-400">↓</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Dropoff</div>
                        <div className="text-base font-bold text-gray-900">{trip.dropoffLocation}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {trip.notes && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Notes</h3>
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <p className="text-gray-700">{trip.notes}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="text-sm font-medium text-gray-600 mb-1">Total Expenses</div>
                    <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalExpenses)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="text-sm font-medium text-gray-600 mb-1">Documents</div>
                    <div className="text-2xl font-bold text-purple-700">{documents.length}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="text-sm font-medium text-gray-600 mb-1">Activity Entries</div>
                    <div className="text-2xl font-bold text-green-700">{activities.length}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Trip Expenses</h3>
                    <p className="text-sm text-gray-600">Track fuel, tolls, repairs, and other costs</p>
                  </div>
                  <button
                    onClick={() => setShowExpenseForm(!showExpenseForm)}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {showExpenseForm ? '✕ Cancel' : '+ Add Expense'}
                  </button>
                </div>

                {showExpenseForm && (
                  <form onSubmit={handleAddExpense} className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select
                          required
                          value={expenseForm.category}
                          onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="FUEL">Fuel</option>
                          <option value="TOLLS">Tolls</option>
                          <option value="REPAIRS">Repairs</option>
                          <option value="MAINTENANCE">Maintenance</option>
                          <option value="MEALS">Meals</option>
                          <option value="LODGING">Lodging</option>
                          <option value="PARKING">Parking</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={expenseForm.amount}
                          onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <input
                        type="text"
                        required
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Brief description of expense"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Paid By</label>
                      <input
                        type="text"
                        value={expenseForm.paidBy}
                        onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Driver name or company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={expenseForm.notes}
                        onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={2}
                        placeholder="Additional notes..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                    >
                      ✨ Add Expense
                    </button>
                  </form>
                )}

                {expenses.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">💰</div>
                    <div className="font-semibold text-lg">No expenses recorded</div>
                    <div className="text-sm">Add your first expense to start tracking costs</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${getCategoryColor(expense.category)}`}>
                              {expense.category}
                            </span>
                            <span className="font-bold text-gray-900">{expense.description}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {expense.paidBy && `Paid by ${expense.paidBy} • `}
                            {new Date(expense.paidAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{formatCurrency(Number(expense.amount))}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total Expenses</span>
                        <span className="text-2xl font-bold text-orange-700">{formatCurrency(totalExpenses)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Trip Documents</h3>
                    <p className="text-sm text-gray-600">BOL, POD, receipts, and photos</p>
                  </div>
                  <button
                    onClick={() => setShowDocumentForm(!showDocumentForm)}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {showDocumentForm ? '✕ Cancel' : '+ Add Document'}
                  </button>
                </div>

                {showDocumentForm && (
                  <form onSubmit={handleAddDocument} className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                        <select
                          required
                          value={documentForm.type}
                          onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="BOL">Bill of Lading (BOL)</option>
                          <option value="POD">Proof of Delivery (POD)</option>
                          <option value="INVOICE_COPY">Invoice Copy</option>
                          <option value="PHOTO">Photo</option>
                          <option value="RECEIPT">Receipt</option>
                          <option value="INSPECTION">Inspection Report</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input
                          type="text"
                          required
                          value={documentForm.title}
                          onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Document title"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File URL *</label>
                      <input
                        type="text"
                        required
                        value={documentForm.fileUrl}
                        onChange={(e) => setDocumentForm({ ...documentForm, fileUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File Name *</label>
                      <input
                        type="text"
                        required
                        value={documentForm.fileName}
                        onChange={(e) => setDocumentForm({ ...documentForm, fileName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="document.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={documentForm.description}
                        onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={2}
                        placeholder="Additional notes about this document..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                    >
                      ✨ Add Document
                    </button>
                  </form>
                )}

                {documents.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">📄</div>
                    <div className="font-semibold text-lg">No documents uploaded</div>
                    <div className="text-sm">Add BOL, POD, or other trip documents</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-bold rounded-full ${getDocTypeColor(doc.type)}`}>
                                {doc.type.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="font-bold text-gray-900 mb-1">{doc.title}</div>
                            {doc.description && (
                              <div className="text-sm text-gray-600 mb-2">{doc.description}</div>
                            )}
                            <div className="text-xs text-gray-500">
                              {doc.fileName} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                              {doc.uploadedBy && ` by ${doc.uploadedBy}`}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-800 font-semibold transition-colors ml-3"
                          >
                            🗑️
                          </button>
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-center text-sm transition-all"
                        >
                          📥 View Document
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Activity Timeline</h3>
                  <p className="text-sm text-gray-600">Complete history of trip events and changes</p>
                </div>

                {activities.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">📝</div>
                    <div className="font-semibold text-lg">No activity recorded</div>
                    <div className="text-sm">Activity will appear as the trip progresses</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="bg-gray-50 rounded-xl p-4 flex items-start gap-4">
                        <div className="text-2xl">{getActivityIcon(activity.activityType)}</div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 mb-1">{activity.description}</div>
                          <div className="text-sm text-gray-600">
                            {activity.oldValue && activity.newValue && (
                              <span className="mr-2">
                                <span className="text-red-600">{activity.oldValue}</span>
                                {' → '}
                                <span className="text-green-600">{activity.newValue}</span>
                              </span>
                            )}
                            {!activity.oldValue && activity.newValue && (
                              <span className="mr-2 text-green-600">{activity.newValue}</span>
                            )}
                            {activity.performedBy && `• ${activity.performedBy}`}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(activity.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
