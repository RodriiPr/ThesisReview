'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

export default function AdvancesListPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['advances-list'],
    queryFn: () => apiClient.get('/advances', { params: { pageSize: 50 } }).then((r) => r.data),
  });

  const advances = data?.advances ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Avances</h1>
          <p className="text-sm text-gray-500 mt-0.5">Listado de avances del programa</p>
        </div>
        <Link
          href="/advances/upload"
          className="h-9 px-4 rounded-lg bg-[#185FA5] text-white text-sm font-medium hover:bg-[#0C447C]"
        >
          Cargar avance
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : advances.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">No hay avances registrados</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-50">
          {advances.map((adv: { id: string; title: string; status: string; student?: { name: string } }) => (
            <button
              key={adv.id}
              type="button"
              onClick={() => router.push(`/advances/${adv.id}/review`)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 text-left"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{adv.title}</p>
                <p className="text-xs text-gray-500">{adv.student?.name ?? '—'}</p>
              </div>
              <span className="text-xs text-gray-500">{adv.status}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
