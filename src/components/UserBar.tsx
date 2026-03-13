'use client';

import { useSession, signOut } from 'next-auth/react';

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  DISPATCHER: 'bg-blue-100 text-blue-700',
  DRIVER: 'bg-green-100 text-green-700',
  BILLING_ADMIN: 'bg-orange-100 text-orange-700',
  CUSTOMER: 'bg-gray-100 text-gray-700',
};

export function UserBar() {
  const { data: session } = useSession();
  if (!session?.user) return null;

  const role = (session.user as any).role as string;
  const colorClass = roleColors[role] ?? 'bg-gray-100 text-gray-700';

  return (
    <div className="fixed top-3 right-4 z-50 flex items-center gap-2.5 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-1.5 shadow-md text-sm">
      <span className="text-gray-600 hidden sm:inline">{session.user.email}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
        {role}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="text-red-500 hover:text-red-700 font-medium transition-colors ml-1"
      >
        Sign out
      </button>
    </div>
  );
}
