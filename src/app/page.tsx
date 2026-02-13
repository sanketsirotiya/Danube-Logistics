import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Danube <span className="text-blue-400">Logistics</span>
              </h1>
            </div>

            <p className="text-lg md:text-xl text-blue-100 mb-3 font-light">
              Enterprise Freight Management Platform
            </p>
            <p className="text-blue-200/80 max-w-2xl mx-auto mb-6 text-sm leading-relaxed">
              Optimize your logistics operations with AI-powered dispatch, real-time fleet tracking,
              and automated invoicing. Built for scale, designed for efficiency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Dashboard
              </Link>
              <Link
                href="/trips"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-200 text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Trip
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-0.5">10+</div>
                <div className="text-xs text-blue-200 font-medium">Fleet Vehicles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-0.5">3</div>
                <div className="text-xs text-blue-200 font-medium">Active Drivers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-0.5">3</div>
                <div className="text-xs text-blue-200 font-medium">Customers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-0.5">4</div>
                <div className="text-xs text-blue-200 font-medium">Active Routes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Management Modules */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Operations Management
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            Access all your logistics management tools from a unified platform
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/trucks"
            className="group bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100/50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all duration-200 hover:shadow-lg"
          >
            <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-500 rounded-lg flex items-center justify-center mb-3 transition-colors">
              <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">Fleet Management</h3>
            <p className="text-xs text-gray-500">Trucks & Vehicles</p>
          </Link>

          <Link
            href="/drivers"
            className="group bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100/50 border border-gray-200 hover:border-green-300 rounded-xl p-4 transition-all duration-200 hover:shadow-lg"
          >
            <div className="w-10 h-10 bg-green-100 group-hover:bg-green-500 rounded-lg flex items-center justify-center mb-3 transition-colors">
              <svg className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">Driver Management</h3>
            <p className="text-xs text-gray-500">Personnel & Licenses</p>
          </Link>

          <Link
            href="/customers"
            className="group bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100/50 border border-gray-200 hover:border-purple-300 rounded-xl p-4 transition-all duration-200 hover:shadow-lg"
          >
            <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-500 rounded-lg flex items-center justify-center mb-3 transition-colors">
              <svg className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">Customer Portal</h3>
            <p className="text-xs text-gray-500">Accounts & Rates</p>
          </Link>

          <Link
            href="/delivery-orders"
            className="group bg-white hover:bg-gradient-to-br hover:from-cyan-50 hover:to-cyan-100/50 border border-gray-200 hover:border-cyan-300 rounded-xl p-4 transition-all duration-200 hover:shadow-lg"
          >
            <div className="w-10 h-10 bg-cyan-100 group-hover:bg-cyan-500 rounded-lg flex items-center justify-center mb-3 transition-colors">
              <svg className="w-6 h-6 text-cyan-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">Delivery Orders</h3>
            <p className="text-xs text-gray-500">Port to Customer</p>
          </Link>

          <Link
            href="/trips"
            className="group bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100/50 border border-gray-200 hover:border-orange-300 rounded-xl p-4 transition-all duration-200 hover:shadow-lg"
          >
            <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-500 rounded-lg flex items-center justify-center mb-3 transition-colors">
              <svg className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">Trip Dispatch</h3>
            <p className="text-xs text-gray-500">Routes & Deliveries</p>
          </Link>

          <Link
            href="/invoices"
            className="group bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-indigo-100/50 border border-gray-200 hover:border-indigo-300 rounded-xl p-4 transition-all duration-200 hover:shadow-lg"
          >
            <div className="w-10 h-10 bg-indigo-100 group-hover:bg-indigo-500 rounded-lg flex items-center justify-center mb-3 transition-colors">
              <svg className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">Billing & Invoices</h3>
            <p className="text-xs text-gray-500">Payments & AR</p>
          </Link>

          <Link
            href="/charge-types"
            className="group bg-white hover:bg-gradient-to-br hover:from-pink-50 hover:to-pink-100/50 border border-gray-200 hover:border-pink-300 rounded-xl p-4 transition-all duration-200 hover:shadow-lg"
          >
            <div className="w-10 h-10 bg-pink-100 group-hover:bg-pink-500 rounded-lg flex items-center justify-center mb-3 transition-colors">
              <svg className="w-6 h-6 text-pink-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">Charge Types</h3>
            <p className="text-xs text-gray-500">Pricing & Rates</p>
          </Link>

          <Link
            href="/reports"
            className="group bg-white hover:bg-gradient-to-br hover:from-teal-50 hover:to-teal-100/50 border border-gray-200 hover:border-teal-300 rounded-xl p-4 transition-all duration-200 hover:shadow-lg"
          >
            <div className="w-10 h-10 bg-teal-100 group-hover:bg-teal-500 rounded-lg flex items-center justify-center mb-3 transition-colors">
              <svg className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">Analytics & Reports</h3>
            <p className="text-xs text-gray-500">Insights & Exports</p>
          </Link>

          <Link
            href="/dashboard"
            className="group bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 border border-slate-600 rounded-xl p-4 transition-all duration-200 hover:shadow-lg"
          >
            <div className="w-10 h-10 bg-white/20 group-hover:bg-white/30 rounded-lg flex items-center justify-center mb-3 transition-colors">
              <svg className="w-6 h-6 text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-0.5 text-sm">Overview Dashboard</h3>
            <p className="text-xs text-slate-300">Metrics & KPIs</p>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Built for Modern Logistics
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive features designed to streamline every aspect of your freight operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Automated Billing
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Generate invoices automatically from completed trips with flexible pricing models, tax calculations, and payment tracking.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Flat rate & itemized pricing
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Automatic tax calculations
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Payment status tracking
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Smart Dispatch
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Optimize trip scheduling with intelligent driver assignment, container tracking, and real-time status monitoring.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Driver & vehicle assignment
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Container status tracking
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Route optimization
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Business Intelligence
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Gain actionable insights with comprehensive reporting, performance analytics, and data export capabilities.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Revenue & expense reports
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Driver performance metrics
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  CSV export functionality
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer/Status */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">System Operational</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-600">All services running</span>
            </div>
            <div className="text-sm text-gray-500">
              © 2026 Danube Logistics. Enterprise Freight Management Platform.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
