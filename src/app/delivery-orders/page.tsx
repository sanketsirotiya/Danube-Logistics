'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeliveryOrdersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/import-orders');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Redirecting to Import Orders…</div>
    </div>
  );
}
