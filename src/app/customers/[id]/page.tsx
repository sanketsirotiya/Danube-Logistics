'use client';

import { use } from 'react';
import Link from 'next/link';
import { useCustomers } from '@/lib/hooks/customers/useCustomers';
import { useImportOrders } from '@/lib/hooks/import-orders/useImportOrders';
import { useExportOrders } from '@/lib/hooks/export-orders/useExportOrders';

export default function CustomerOrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: customers = [] } = useCustomers();
  const { data: allImportOrders = [], isLoading: loadingImports } = useImportOrders();
  const { data: allExportOrders = [], isLoading: loadingExports } = useExportOrders();

  const customer = customers.find((c) => c.id === id);
  const importOrders = allImportOrders.filter((o) => o.customerId === id);
  const exportOrders = allExportOrders.filter((o) => o.customerId === id);

  const isLoading = loadingImports || loadingExports;

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

  const formatSize = (size: string) =>
    size?.replace('_FT', ' ft').replace('TWENTY', '20').replace('FORTY_FIVE', '45').replace('FORTY', '40');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-5">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-md px-5 py-3 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">{customer?.name || 'Customer'}</h1>
              <p className="text-purple-100 text-sm">
                {customer?.email} {customer?.phone ? `· ${customer.phone}` : ''} · {customer?.pricingType} pricing
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/customers" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm">
                ← Customers
              </Link>
              <Link href="/import-orders" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm">
                Import Orders
              </Link>
              <Link href="/export-orders" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm">
                Export Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-purple-500">
            <div className="text-xs text-gray-500 mb-1">Total Orders</div>
            <div className="text-3xl font-bold text-purple-700">{importOrders.length + exportOrders.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-blue-500">
            <div className="text-xs text-gray-500 mb-1">Import Orders</div>
            <div className="text-3xl font-bold text-blue-700">{importOrders.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-emerald-500">
            <div className="text-xs text-gray-500 mb-1">Export Orders</div>
            <div className="text-3xl font-bold text-emerald-700">{exportOrders.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-yellow-500">
            <div className="text-xs text-gray-500 mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-700">
              {[...importOrders, ...exportOrders].filter((o) => o.status === 'PENDING').length}
            </div>
          </div>
        </div>

        {/* Import Orders */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-5">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="8" width="20" height="11" rx="1"/>
                <line x1="7" y1="8" x2="7" y2="19"/>
                <line x1="12" y1="8" x2="12" y2="19"/>
                <line x1="17" y1="8" x2="17" y2="19"/>
                <line x1="2" y1="14" x2="22" y2="14"/>
                <path d="M6 8V6a1 1 0 011-1h10a1 1 0 011 1v2"/>
              </svg>
              <h2 className="font-semibold text-blue-900">Import Orders</h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{importOrders.length}</span>
            </div>
            <Link href="/import-orders" className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ New Import</Link>
          </div>
          {importOrders.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">No import orders for this customer</div>
          ) : (
            <table className="w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Container</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Port → Delivery</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ship Line</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requested Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {importOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">Ref: {order.customerReference}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{order.containerNumber}</div>
                      <div className="text-xs text-gray-500">{formatSize(order.containerSize)} · {order.containerType}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <div className="text-xs text-gray-700 truncate">{order.portOfLoading}</div>
                      <div className="text-xs text-gray-500 truncate">→ {order.deliveryCity || order.deliveryAddress}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{order.shipLine?.code || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {order.requestedDeliveryDate ? new Date(order.requestedDeliveryDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Export Orders */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="8" width="20" height="11" rx="1"/>
                <line x1="7" y1="8" x2="7" y2="19"/>
                <line x1="12" y1="8" x2="12" y2="19"/>
                <line x1="17" y1="8" x2="17" y2="19"/>
                <line x1="2" y1="14" x2="22" y2="14"/>
                <path d="M6 8V6a1 1 0 011-1h10a1 1 0 011 1v2"/>
              </svg>
              <h2 className="font-semibold text-emerald-900">Export Orders</h2>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{exportOrders.length}</span>
            </div>
            <Link href="/export-orders" className="text-xs text-emerald-600 hover:text-emerald-800 font-medium">+ New Export</Link>
          </div>
          {exportOrders.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">No export orders for this customer</div>
          ) : (
            <table className="w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Container</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pickup → Port</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ship Line</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pickup Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {exportOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-emerald-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">Ref: {order.customerReference}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.bookingNumber}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-700">{formatSize(order.containerSize)} · {order.containerType}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <div className="text-xs text-gray-700 truncate">{order.pickupAddress}</div>
                      <div className="text-xs text-gray-500 truncate">→ {order.portOfDischarge}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{order.shipLine?.code || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {order.requestedPickupDate ? new Date(order.requestedPickupDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
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
