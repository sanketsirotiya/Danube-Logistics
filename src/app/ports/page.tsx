'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTerminals } from '@/lib/hooks/terminals/useTerminals';
import { useCreateTerminal } from '@/lib/hooks/terminals/useCreateTerminal';
import { useUpdateTerminal } from '@/lib/hooks/terminals/useUpdateTerminal';
import { useDeleteTerminal } from '@/lib/hooks/terminals/useDeleteTerminal';

type TerminalForm = { name: string; code: string; street: string; city: string; state: string; zip: string };

const emptyForm: TerminalForm = { name: '', code: '', street: '', city: '', state: '', zip: '' };

export default function PortsPage() {
  const { data: terminals = [], isLoading } = useTerminals();
  const createTerminal = useCreateTerminal();
  const updateTerminal = useUpdateTerminal();
  const deleteTerminal = useDeleteTerminal();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TerminalForm>(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        code: formData.code || undefined,
        address: (formData.street || formData.city || formData.state || formData.zip) ? {
          street: formData.street || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zip: formData.zip || undefined,
          country: 'USA',
        } : undefined,
      };
      if (editingId) {
        await updateTerminal.mutateAsync({ id: editingId, ...data });
      } else {
        await createTerminal.mutateAsync(data);
      }
      resetForm();
    } catch (error: any) {
      alert(error?.message || 'Failed to save port');
    }
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setFormData({
      name: t.name,
      code: t.code || '',
      street: t.address?.street || '',
      city: t.address?.city || '',
      state: t.address?.state || '',
      zip: t.address?.zip || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this port/terminal?')) return;
    try {
      await deleteTerminal.mutateAsync(id);
    } catch (error: any) {
      alert(error?.message || 'Failed to delete port');
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-50">
      <div className="max-w-5xl mx-auto p-6 sm:p-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">Ports & Terminals</h1>
                <p className="text-teal-100">Manage port and terminal locations for delivery orders</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm">
                ← Home
              </Link>
              <button
                onClick={() => { if (!showForm) setFormData(emptyForm); setShowForm(!showForm); if (editingId) resetForm(); }}
                className="bg-white hover:bg-teal-50 text-teal-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {showForm && !editingId ? 'Cancel' : '+ Add Port'}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Port / Terminal' : 'Add New Port / Terminal'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Port Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Port Newark Container Terminal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="PNCT"
                  maxLength={10}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="241 Port Newark Rd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Newark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="NJ"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="07114"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  {editingId ? 'Update Port' : 'Add Port'}
                </button>
                <button type="button" onClick={resetForm} className="px-8 py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ports List */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading ports...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port / Terminal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {terminals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <div className="font-semibold">No ports added yet</div>
                      <div className="text-sm mt-1">Add your first port to get started</div>
                    </td>
                  </tr>
                ) : (
                  terminals.map((t) => (
                    <tr key={t.id} className="hover:bg-teal-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{t.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        {t.code ? (
                          <span className="px-2.5 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded-full">{t.code}</span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {t.address?.street && <div className="text-gray-800">{t.address.street}</div>}
                        <div>{t.address ? `${t.address.city || ''}${t.address.city && t.address.state ? ', ' : ''}${t.address.state || ''}${t.address.zip ? ' ' + t.address.zip : ''}` : '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleEdit(t)} className="text-blue-600 hover:text-blue-800 font-semibold mr-4 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-800 font-semibold transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
