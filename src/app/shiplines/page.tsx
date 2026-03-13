'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useShipLines } from '@/lib/hooks/shiplines/useShipLines';
import { useCreateShipLine } from '@/lib/hooks/shiplines/useCreateShipLine';
import { useUpdateShipLine } from '@/lib/hooks/shiplines/useUpdateShipLine';
import { useDeleteShipLine } from '@/lib/hooks/shiplines/useDeleteShipLine';
import type { ShipLine } from '@/lib/types';

type FormData = { name: string; code: string; active: boolean; notes: string };
const emptyForm: FormData = { name: '', code: '', active: true, notes: '' };

export default function ShipLinesPage() {
  const { data: shiplines = [], isLoading, error } = useShipLines();
  const createShipLine = useCreateShipLine();
  const updateShipLine = useUpdateShipLine();
  const deleteShipLine = useDeleteShipLine();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ShipLine | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        code: formData.code || undefined,
        active: formData.active,
        notes: formData.notes || undefined,
      };
      if (editingItem) {
        await updateShipLine.mutateAsync({ id: editingItem.id, ...data });
      } else {
        await createShipLine.mutateAsync(data);
      }
      resetForm();
    } catch (err: any) {
      alert(err?.message || 'Failed to save ship line');
    }
  };

  const handleEdit = (item: ShipLine) => {
    setEditingItem(item);
    setFormData({ name: item.name, code: item.code || '', active: item.active, notes: item.notes || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ship line? Orders linked to it will lose the ship line reference.')) return;
    try { await deleteShipLine.mutateAsync(id); }
    catch (err: any) { alert(err?.message || 'Failed to delete ship line'); }
  };

  const resetForm = () => { setFormData(emptyForm); setEditingItem(null); setShowForm(false); };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-600">Loading ship lines...</div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-red-600">Error: {error.message}</div></div>;

  const active = shiplines.filter(s => s.active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-5">

        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 rounded-xl shadow-md px-5 py-3 mb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Ship Lines</h1>
                <p className="text-sky-100 text-sm">{shiplines.length} total · {active} active</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm text-sm">← Home</Link>
              <button
                onClick={() => { if (!showForm) setFormData(emptyForm); setShowForm(!showForm); }}
                className="bg-white hover:bg-sky-50 text-sky-700 px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
              >
                {showForm ? 'Cancel' : '+ Add Ship Line'}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-4 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editingItem ? 'Edit Ship Line' : 'Add Ship Line'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g. MSC (Mediterranean Shipping Company)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g. MSC"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
                  {editingItem ? 'Update' : 'Add Ship Line'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-lg font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ship Line</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shiplines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="font-semibold">No ship lines yet</div>
                    <div className="text-sm mt-1">Add your first ship line above.</div>
                  </td>
                </tr>
              ) : (
                shiplines.map((sl) => (
                  <tr key={sl.id} className="hover:bg-sky-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{sl.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sl.code || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${sl.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {sl.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{sl.notes || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(sl)} className="text-sky-600 hover:text-sky-800 font-semibold mr-3 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(sl.id)} className="text-red-600 hover:text-red-800 font-semibold transition-colors">Delete</button>
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
