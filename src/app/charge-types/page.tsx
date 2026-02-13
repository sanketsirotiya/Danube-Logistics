'use client';

import { useEffect, useState } from 'react';

type ChargeType = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  category: string;
  defaultRate: number | null;
  isActive: boolean;
  displayOrder: number | null;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  name: string;
  code: string;
  description: string;
  category: string;
  defaultRate: string;
  isActive: boolean;
  displayOrder: string;
};

const CATEGORIES = [
  'BASE',
  'ACCESSORIAL',
  'FUEL',
  'STORAGE',
  'DETENTION',
  'OTHER',
];

export default function ChargeTypesPage() {
  const [chargeTypes, setChargeTypes] = useState<ChargeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChargeType, setEditingChargeType] = useState<ChargeType | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    description: '',
    category: 'ACCESSORIAL',
    defaultRate: '',
    isActive: true,
    displayOrder: '',
  });

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingChargeType ? `/api/charge-types/${editingChargeType.id}` : '/api/charge-types';
    const method = editingChargeType ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchChargeTypes();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save charge type');
      }
    } catch (error) {
      console.error('Error saving charge type:', error);
      alert('Failed to save charge type');
    }
  };

  const handleEdit = (chargeType: ChargeType) => {
    setEditingChargeType(chargeType);
    setFormData({
      name: chargeType.name,
      code: chargeType.code,
      description: chargeType.description || '',
      category: chargeType.category,
      defaultRate: chargeType.defaultRate?.toString() || '',
      isActive: chargeType.isActive,
      displayOrder: chargeType.displayOrder?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this charge type?')) return;

    try {
      const response = await fetch(`/api/charge-types/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchChargeTypes();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete charge type');
      }
    } catch (error) {
      console.error('Error deleting charge type:', error);
      alert('Failed to delete charge type');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'ACCESSORIAL',
      defaultRate: '',
      isActive: true,
      displayOrder: '',
    });
    setEditingChargeType(null);
    setShowForm(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'BASE':
        return 'bg-blue-100 text-blue-800';
      case 'ACCESSORIAL':
        return 'bg-purple-100 text-purple-800';
      case 'FUEL':
        return 'bg-orange-100 text-orange-800';
      case 'STORAGE':
        return 'bg-yellow-100 text-yellow-800';
      case 'DETENTION':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading charge types...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Charge Types Management</h1>
                  <p className="text-purple-100">Configure billing charge types and default rates</p>
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
                  className="bg-white hover:bg-purple-50 text-purple-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {showForm ? 'Cancel' : '+ Add Charge Type'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-900 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Types</div>
              <div className="text-3xl font-bold text-gray-900">{chargeTypes.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Active</div>
              <div className="text-3xl font-bold text-green-600">
                {chargeTypes.filter((ct) => ct.isActive).length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-400 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Inactive</div>
              <div className="text-3xl font-bold text-gray-400">
                {chargeTypes.filter((ct) => !ct.isActive).length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Categories</div>
              <div className="text-3xl font-bold text-purple-600">
                {new Set(chargeTypes.map(ct => ct.category)).size}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingChargeType ? 'Edit Charge Type' : 'Add New Charge Type'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Fuel Surcharge"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., FUEL_SUR"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Rate ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.defaultRate}
                  onChange={(e) => setFormData({ ...formData, defaultRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {editingChargeType ? 'Update Charge Type' : 'Create Charge Type'}
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

        {/* Charge Types Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Default Rate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Display Order
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
                {chargeTypes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="text-gray-400 text-lg">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="font-semibold">No charge types found</div>
                        <div className="text-sm mt-2">Add your first charge type to get started!</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  chargeTypes.map((chargeType) => (
                    <tr key={chargeType.id} className="hover:bg-purple-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{chargeType.name}</div>
                        {chargeType.description && (
                          <div className="text-xs text-gray-500 mt-1">{chargeType.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">
                          {chargeType.code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${getCategoryColor(
                            chargeType.category
                          )}`}
                        >
                          {chargeType.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                        {formatCurrency(chargeType.defaultRate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {chargeType.displayOrder ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${
                            chargeType.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {chargeType.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(chargeType)}
                          className="text-blue-600 hover:text-blue-800 font-semibold mr-4 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(chargeType.id)}
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
