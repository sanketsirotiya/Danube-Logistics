'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type ReportType = 'trips' | 'revenue' | 'expenses' | 'drivers';

type Customer = {
  id: string;
  name: string;
};

type Driver = {
  id: string;
  name: string;
};

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('trips');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paidOnly, setPaidOnly] = useState(false);

  // Dropdown data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    generateReport();
  }, [activeReport]);

  const fetchDropdownData = async () => {
    try {
      const [customersRes, driversRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/drivers'),
      ]);

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData);
      }

      if (driversRes.ok) {
        const driversData = await driversRes.json();
        setDrivers(driversData);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      let url = `/api/reports/${activeReport}?`;
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      if (activeReport === 'trips') {
        if (selectedCustomer) params.append('customerId', selectedCustomer);
        if (selectedDriver) params.append('driverId', selectedDriver);
        if (selectedStatus) params.append('status', selectedStatus);
      } else if (activeReport === 'revenue') {
        if (selectedCustomer) params.append('customerId', selectedCustomer);
        if (paidOnly) params.append('paidOnly', 'true');
      } else if (activeReport === 'expenses') {
        if (selectedCategory) params.append('category', selectedCategory);
      } else if (activeReport === 'drivers') {
        if (selectedDriver) params.append('driverId', selectedDriver);
      }

      url += params.toString();

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = '';
    let filename = '';

    if (activeReport === 'trips' && reportData.trips) {
      filename = 'trip-report.csv';
      csvContent = 'Customer,Truck,Driver,Container,Pickup,Dropoff,Status,Distance (mi),Expenses,Revenue,Invoice #,Paid\n';
      reportData.trips.forEach((trip: any) => {
        csvContent += `"${trip.customer}","${trip.truck}","${trip.driver}","${trip.container}","${trip.pickupLocation}","${trip.dropoffLocation}","${trip.status}",${trip.distanceMiles},${trip.expenses},${trip.revenue},"${trip.invoiceNumber || ''}",${trip.invoicePaid}\n`;
      });
    } else if (activeReport === 'revenue' && reportData.invoices) {
      filename = 'revenue-report.csv';
      csvContent = 'Invoice #,Customer,Route,Subtotal,Tax,Total,Paid,Paid At,Due Date,Overdue\n';
      reportData.invoices.forEach((inv: any) => {
        csvContent += `"${inv.invoiceNumber}","${inv.customer}","${inv.route}",${inv.subtotal},${inv.taxAmount},${inv.totalAmount},${inv.paid},"${inv.paidAt || ''}","${inv.dueDate}",${inv.isOverdue}\n`;
      });
    } else if (activeReport === 'expenses' && reportData.expenses) {
      filename = 'expense-report.csv';
      csvContent = 'Category,Description,Amount,Paid By,Paid At,Route,Customer,Driver,Truck,Notes\n';
      reportData.expenses.forEach((exp: any) => {
        csvContent += `"${exp.category}","${exp.description}",${exp.amount},"${exp.paidBy || ''}","${exp.paidAt}","${exp.tripRoute}","${exp.customer}","${exp.driver}","${exp.truck}","${exp.notes || ''}"\n`;
      });
    } else if (activeReport === 'drivers' && reportData.drivers) {
      filename = 'driver-performance-report.csv';
      csvContent = 'Driver,License,Status,Total Trips,Completed,In Progress,Cancelled,Completion %,Distance (mi),Revenue,Revenue/Trip,Revenue/Mile,Expenses,Net Profit\n';
      reportData.drivers.forEach((driver: any) => {
        csvContent += `"${driver.driverName}","${driver.license}","${driver.status}",${driver.totalTrips},${driver.completedTrips},${driver.inProgressTrips},${driver.cancelledTrips},${driver.completionRate},${driver.totalDistance},${driver.totalRevenue},${driver.revenuePerTrip},${driver.revenuePerMile},${driver.totalExpenses},${driver.netProfit}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCustomer('');
    setSelectedDriver('');
    setSelectedStatus('');
    setSelectedCategory('');
    setPaidOnly(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-50">
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Reports & Analytics</h1>
                <p className="text-teal-100">Generate comprehensive reports and export data</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
              >
                ← Home
              </Link>
            </div>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveReport('trips')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  activeReport === 'trips'
                    ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Trip Report
              </button>
              <button
                onClick={() => setActiveReport('revenue')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  activeReport === 'revenue'
                    ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Revenue Report
              </button>
              <button
                onClick={() => setActiveReport('expenses')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  activeReport === 'expenses'
                    ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Expense Report
              </button>
              <button
                onClick={() => setActiveReport('drivers')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                  activeReport === 'drivers'
                    ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Driver Performance
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {activeReport === 'trips' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">All Customers</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                    <select
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">All Drivers</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">All Statuses</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </>
              )}

              {activeReport === 'revenue' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">All Customers</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paidOnly}
                        onChange={(e) => setPaidOnly(e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Paid Only</span>
                    </label>
                  </div>
                </>
              )}

              {activeReport === 'expenses' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
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
              )}

              {activeReport === 'drivers' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">All Drivers</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={generateReport}
                disabled={loading}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
              <button
                onClick={resetFilters}
                className="px-6 py-2 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-300"
              >
                Reset Filters
              </button>
              {reportData && (
                <button
                  onClick={exportToCSV}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {/* Report Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-xl flex items-center justify-center animate-pulse">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="font-semibold text-lg text-gray-600">Generating report...</div>
              </div>
            ) : !reportData ? (
              <div className="text-center py-12 text-gray-400">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="font-semibold text-lg">No report generated</div>
                <div className="text-sm">Click "Generate Report" to create your report</div>
              </div>
            ) : (
              <>
                {/* Summary Section */}
                {reportData.summary && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {activeReport === 'trips' && (
                        <>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Total Trips</div>
                            <div className="text-2xl font-bold text-blue-700">{reportData.summary.totalTrips}</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Completed</div>
                            <div className="text-2xl font-bold text-green-700">{reportData.summary.byStatus.completed}</div>
                          </div>
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Total Distance</div>
                            <div className="text-2xl font-bold text-orange-700">{Math.round(reportData.summary.totalDistance)} mi</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Total Revenue</div>
                            <div className="text-2xl font-bold text-purple-700">{formatCurrency(reportData.summary.totalRevenue)}</div>
                          </div>
                        </>
                      )}

                      {activeReport === 'revenue' && (
                        <>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Total Revenue</div>
                            <div className="text-2xl font-bold text-blue-700">{formatCurrency(reportData.summary.totalRevenue)}</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Paid</div>
                            <div className="text-2xl font-bold text-green-700">{formatCurrency(reportData.summary.paidRevenue)}</div>
                          </div>
                          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Pending</div>
                            <div className="text-2xl font-bold text-yellow-700">{formatCurrency(reportData.summary.pendingRevenue)}</div>
                          </div>
                          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Overdue</div>
                            <div className="text-2xl font-bold text-red-700">{formatCurrency(reportData.summary.overdueRevenue)}</div>
                          </div>
                        </>
                      )}

                      {activeReport === 'expenses' && (
                        <>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Total Expenses</div>
                            <div className="text-2xl font-bold text-blue-700">{reportData.summary.totalExpenses}</div>
                          </div>
                          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Total Amount</div>
                            <div className="text-2xl font-bold text-red-700">{formatCurrency(reportData.summary.totalAmount)}</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Average</div>
                            <div className="text-2xl font-bold text-purple-700">{formatCurrency(reportData.summary.averageAmount)}</div>
                          </div>
                        </>
                      )}

                      {activeReport === 'drivers' && (
                        <>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Total Trips</div>
                            <div className="text-2xl font-bold text-blue-700">{reportData.summary.totalTrips}</div>
                          </div>
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Total Distance</div>
                            <div className="text-2xl font-bold text-orange-700">{Math.round(reportData.summary.totalDistance)} mi</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Total Revenue</div>
                            <div className="text-2xl font-bold text-green-700">{formatCurrency(reportData.summary.totalRevenue)}</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                            <div className="text-sm font-medium text-gray-600 mb-1">Avg Completion</div>
                            <div className="text-2xl font-bold text-purple-700">{Math.round(reportData.summary.averageCompletionRate)}%</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Detailed Data Tables */}
                <div className="overflow-x-auto">
                  {activeReport === 'trips' && reportData.trips && reportData.trips.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Details ({reportData.trips.length} trips)</h3>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Customer</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Route</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Driver/Truck</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Status</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-700">Distance</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-700">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {reportData.trips.map((trip: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{trip.customer}</td>
                              <td className="px-4 py-3">
                                <div className="text-xs">{trip.pickupLocation}</div>
                                <div className="text-xs text-gray-500">→ {trip.dropoffLocation}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-xs">{trip.driver}</div>
                                <div className="text-xs text-gray-500">{trip.truck}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                  trip.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                  trip.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                  trip.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {trip.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">{trip.distanceMiles} mi</td>
                              <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(trip.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeReport === 'revenue' && reportData.invoices && reportData.invoices.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice Details ({reportData.invoices.length} invoices)</h3>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Invoice #</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Customer</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Route</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-700">Amount</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {reportData.invoices.map((inv: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-mono text-xs">{inv.invoiceNumber}</td>
                              <td className="px-4 py-3 font-medium">{inv.customer}</td>
                              <td className="px-4 py-3 text-xs">{inv.route}</td>
                              <td className="px-4 py-3 text-right font-bold">{formatCurrency(inv.totalAmount)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                  inv.paid ? 'bg-green-100 text-green-800' :
                                  inv.isOverdue ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {inv.paid ? 'Paid' : inv.isOverdue ? 'Overdue' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeReport === 'expenses' && reportData.expenses && reportData.expenses.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Expense Details ({reportData.expenses.length} expenses)</h3>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Category</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Description</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Trip</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Driver</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-700">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {reportData.expenses.map((exp: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-800">
                                  {exp.category}
                                </span>
                              </td>
                              <td className="px-4 py-3">{exp.description}</td>
                              <td className="px-4 py-3 text-xs">{exp.tripRoute}</td>
                              <td className="px-4 py-3">{exp.driver}</td>
                              <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(exp.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeReport === 'drivers' && reportData.drivers && reportData.drivers.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Driver Performance ({reportData.drivers.length} drivers)</h3>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Driver</th>
                            <th className="px-4 py-3 text-center font-bold text-gray-700">Trips</th>
                            <th className="px-4 py-3 text-center font-bold text-gray-700">Completed</th>
                            <th className="px-4 py-3 text-center font-bold text-gray-700">Rate</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-700">Distance</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-700">Revenue</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-700">Profit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {reportData.drivers.map((driver: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{driver.driverName}</td>
                              <td className="px-4 py-3 text-center">{driver.totalTrips}</td>
                              <td className="px-4 py-3 text-center">{driver.completedTrips}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                  driver.completionRate >= 90 ? 'bg-green-100 text-green-800' :
                                  driver.completionRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {driver.completionRate}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">{driver.totalDistance} mi</td>
                              <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(driver.totalRevenue)}</td>
                              <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(driver.netProfit)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
