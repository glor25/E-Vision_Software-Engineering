import React from 'react';
import { ChevronDown, CreditCard, DollarSign, Package } from 'lucide-react';

interface paymanetDTO {
  id: number;
  date: string; // e.g., "15 Mar 2025 Pukul 11:30 Wib"
  packageName: string;
  amount: string; // e.g., "Rp500.000"
  method: string; // e.g., "Transfer"
}





interface Props {
  transactions: paymanetDTO[];
}

export default function TransactionHistoryList({ transactions }: Props) {
  return (
    <div className="bg-gray-50 px-6 py-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Riwayat Transaksi</h2>
      <div className="space-y-4">
        {transactions.map((trx) => (
          <div key={trx.id} className="bg-white p-4 rounded shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">{trx.date}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-indigo-500" />
                  {trx.packageName}
                </span>
                <span className="flex items-center gap-1 text-orange-600">
                  <DollarSign className="w-4 h-4" />
                  {trx.amount}
                </span>
                <span className="flex items-center gap-1 text-green-600">
                  <CreditCard className="w-4 h-4" />
                  {trx.method}
                </span>
              </div>
            </div>
            <button className="p-2 rounded bg-gray-100 hover:bg-gray-200">
              <ChevronDown className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
