'use client';

import { useState } from 'react';
import { useChassis } from '@/lib/hooks/chassis/useChassis';
import { useCreateChassis } from '@/lib/hooks/chassis/useCreateChassis';
import { useUpdateChassis } from '@/lib/hooks/chassis/useUpdateChassis';
import type { Chassis, ChassisSize, CreateChassisInput } from '@/lib/types';
import { CHASSIS_SIZE_LABELS, CHASSIS_SIZES } from '@/lib/types';

type FormData = {
  number: string;
  size: ChassisSize | '';
  notes: string;
};

const emptyForm: FormData = { number: '', size: '', notes: '' };

function getStatusBadge(chassis: Chassis) {
  if (!chassis.isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
        Out of Service
      </span>
    );
  }
  if (!chassis.isAvailable) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
        In Use
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
      Available
    </span>
  );
}

export default function ChassisPage() {
  const { data: chassisList = [], isLoading, error } = useChassis();
  const createChassis = useCreateChassis();
  const updateChassis = useUpdateChassis();

  const [showForm, setShowForm] = useState(false);
  const [editingChassis, setEditingChassis] = useState<Chassis | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.size) return;

    try {
      const data: CreateChassisInput = {
        number: formData.number,
        size: formData.size as ChassisSize,
        notes: formData.notes || undefined,
      };

      if (editingChassis) {
        await updateChassis.mutateAsync({ id: editingChassis.id, ...data });
      } else {
        await createChassis.mutateAsync(data);
      }
      resetForm();
    } catch (error: any) {
      alert(error?.message || 'Failed to save chassis');
    }
  };

  const handleEdit = (chassis: Chassis) => {
    setEditingChassis(chassis);
    setFormData({ number: chassis.number, size: chassis.size, notes: chassis.notes || '' });
    setShowForm(true);
  };

  const handleToggleActive = async (chassis: Chassis) => {
    // Cannot mark Out of Service if currently in use
    if (chassis.isActive && !chassis.isAvailable) {
      alert('Cannot mark a chassis as Out of Service while it is currently assigned to a trip.');
      return;
    }
    try {
      await updateChassis.mutateAsync({ id: chassis.id, isActive: !chassis.isActive });
    } catch (error: any) {
      alert(error?.message || 'Failed to update chassis');
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingChassis(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading chassis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {(error as any).message}</div>
      </div>
    );
  }

  const availableCount = chassisList.filter((c) => c.isActive && c.isAvailable).length;
  const inUseCount = chassisList.filter((c) => c.isActive && !c.isAvailable).length;
  const outOfServiceCount = chassisList.filter((c) => !c.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-5">
        {/* Header */}
        <div className="mb-3">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-md px-5 py-3 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Available Chassis</h1>
                  <p className="text-indigo-100">Manage chassis units and their availability</p>
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
                  onClick={() => { resetForm(); setShowForm(!showForm); }}
                  className="bg-white hover:bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                >
                  {showForm && !editingChassis ? 'Cancel' : '+ Add Chassis'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-gray-900">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Chassis</div>
              <div className="text-2xl font-bold text-gray-900">{chassisList.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-green-500">
              <div className="text-sm font-medium text-gray-600 mb-1">Available</div>
              <div className="text-2xl font-bold text-green-600">{availableCount}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-orange-500">
              <div className="text-sm font-medium text-gray-600 mb-1">In Use</div>
              <div className="text-2xl font-bold text-orange-600">{inUseCount}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-gray-400">
              <div className="text-sm font-medium text-gray-600 mb-1">Out of Service</div>
              <div className="text-2xl font-bold text-gray-500">{outOfServiceCount}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-4 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingChassis ? 'Edit Chassis' : 'Add New Chassis'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chassis Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g. CHAS-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chassis Size *
                </label>
                <select
                  required
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value as ChassisSize })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select size...</option>
                  {CHASSIS_SIZES.map((size) => (
                    <option key={size} value={size}>{CHASSIS_SIZE_LABELS[size]}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Optional notes..."
                />
              </div>

              <div className="md:col-span-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createChassis.isPending || updateChassis.isPending}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg font-medium transition-colors"
                >
                  {(createChassis.isPending || updateChassis.isPending)
                    ? 'Saving...'
                    : editingChassis ? 'Save Changes' : 'Add Chassis'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {chassisList.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <p className="text-lg font-medium">No chassis added yet</p>
              <p className="text-sm mt-1">Click "+ Add Chassis" to get started</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Chassis Number</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Size</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Notes</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {chassisList.map((chassis) => (
                  <tr key={chassis.id} className={`hover:bg-gray-50 transition-colors ${!chassis.isActive ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-3 font-mono font-semibold text-gray-900">{chassis.number}</td>
                    <td className="px-5 py-3 text-gray-700">{CHASSIS_SIZE_LABELS[chassis.size]}</td>
                    <td className="px-5 py-3">{getStatusBadge(chassis)}</td>
                    <td className="px-5 py-3 text-gray-500 text-sm">{chassis.notes || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(chassis)}
                          disabled={!chassis.isActive}
                          className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(chassis)}
                          disabled={updateChassis.isPending || (!chassis.isActive === false && !chassis.isAvailable)}
                          title={chassis.isActive && !chassis.isAvailable ? 'Cannot disable — chassis is currently in use' : undefined}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                            chassis.isActive
                              ? 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                              : 'border border-green-300 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {chassis.isActive ? 'Out of Service' : 'Restore'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
