import { useState } from 'react';

const JoinPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('Dana');

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md mt-10 rounded">
      <h1 className="text-2xl font-bold text-center mb-2">Bergabunglah Bersama Kami</h1>
      <p className="text-center text-sm text-gray-600 mb-6">
        Bergabunglah dengan komunitas bisnis eksklusif yang menghubungkan Anda dengan para
        pebisnis profesional, investor, dan mentor bisnis berpengalaman!
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Masukkan Nama Lengkap"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              placeholder="Masukkan Email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm mb-1">No Handphone</label>
            <input
              type="tel"
              placeholder="Masukkan Nomor HP"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Paket</label>
          <select className="w-full px-3 py-2 border rounded focus:outline-none focus:ring">
            <option>1 Tahun</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-2">Pilih Metode Pembayaran</label>
          <div
            onClick={() => setPaymentMethod('Dana')}
            className={`flex justify-between items-center px-4 py-3 border rounded cursor-pointer mb-2 ${
              paymentMethod === 'Dana' ? 'border-green-500 bg-green-50' : ''
            }`}
          >
            <span>Dana</span>
            <span>0123 4567 890</span>
            <span>Ronaldo Pascol</span>
          </div>
          <div
            onClick={() => setPaymentMethod('Mandiri')}
            className={`flex justify-between items-center px-4 py-3 border rounded cursor-pointer ${
              paymentMethod === 'Mandiri' ? 'border-green-500 bg-green-50' : ''
            }`}
          >
            <span>Mandiri</span>
            <span>0123 4567 890</span>
            <span>Ronaldo Pascol</span>
          </div>
        </div>

        <button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition">
          Bayar Sekarang
        </button>
      </div>
    </div>
  );
};

export default JoinPage;
