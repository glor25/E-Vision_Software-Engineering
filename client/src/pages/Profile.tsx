import { useEffect, useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import MiniNavbar from '../components/miniNavbart';
import Navbar from '../components/Navbar';
import ProfileAvatar from '../components/ProfileAvatar';
import axios from 'axios';
import AlertPopup from '../components/AlertPopup';
import { useNavigate } from 'react-router-dom';
import { validateToken } from '../utils/ValidateToken';
import { validateMembership } from '../utils/ValidateMembership';
import VideoFavoritLibrary from './subPages/VideoListForProfile';
import TransactionHistoryList from './subPages/TransactionList';

interface VideoList {
  id: number;
  category?: string;
  description: string;
  duration: number;
  name: string;
  thumbnail: string;
  title: string;
  timeAgo: string;
  videoUrl: string;
  isFavorite: boolean;
}


interface paymanetDTO{
  id: number;
  date: string;
  packageName: string;
  amount: string;
  method: string;
}


const mockData = [
  {
    id: 1,
    date: '15 Mar 2025 Pukul 11:30 Wib',
    packageName: 'Paket 1 Tahun',
    amount: 'Rp500.000',
    method: 'Transfer',
  },
  {
    id: 2,
    date: '15 Mar 2024 Pukul 11:30 Wib',
    packageName: 'Paket 1 Tahun',
    amount: 'Rp500.000',
    method: 'Transfer',
  },
];

type Tab = 'account' | 'favorites' | 'transactions';

export default function AccountSettingsPage() {
  const [paymentData, setPaymentData] = useState<paymanetDTO[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ show: boolean; type?: 'success' | 'error'; message: string }>({ show: false, message: '' });
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [favorites, setFavorites] = useState<VideoList[]>([]);
  const navigate = useNavigate();

  const checkMembership = () => {
    const isMember = validateMembership();
    if(!isMember) navigate('/payment');
  }

  useEffect(() => {
    const checkToken = () => {
        const isValid = validateToken();
        if (!isValid) {
            navigate('/login');
        }
    };
    checkToken();

    const token = localStorage.getItem('jwt_auth');
    if (!token) return;

    let user: any = null;
    try {
      user = JSON.parse(atob(token.split('.')[1]));
    } catch {
      return;
    }
    if (user.userId) {
      setUserId(user.userId);
      const host = import.meta.env.VITE_SERVER_URL;
      axios.get(`${host}/users/${user.userId}`)
        .then(res => {
          const u = res.data.user;
          if (u.telepon) setUserPhone(u.telepon);
          if (u.profile) setUserProfilePic(u.profile);
          if (u.password) setUserPassword(u.password);
        })
        .catch(() => {});
      axios.get(`${host}/users/${user.userId}/profile-pic`)
        .then(res => {
          if (res.data?.url) setUserProfilePic(res.data.url);
        })
        .catch(() => {});
    }
    if (user.name) setUserName(user.name);
    if (user.email) setUserEmail(user.email);
  }, [navigate]);

  const fetchFavorites = async () => {
    if (!userId) return;
    const host = import.meta.env.VITE_SERVER_URL;
    try {
      const res = await axios.post(`${host}/myFavorites/${userId}`);
      setFavorites(res.data.favorites || []);
    } catch (err: any) {
      setAlert({ show: true, type: 'error', message: err.response?.data?.message || 'Gagal mengambil data favorit.' });
    }
  };

  const fetchTransactionHistory = async () => {
    if (!userId) return;
    const host = import.meta.env.VITE_SERVER_URL;
    try {
      const res = await axios.get(`${host}/history/${userId}`);
      setPaymentData(res.data.paymentHistory || []);
    } catch (err: any) {
      setAlert({ show: true, type: 'error', message: err.response?.data?.message || 'Gagal mengambil riwayat transaksi.' });
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, [userId]);

  return (
    <>
      <MiniNavbar />
      <Navbar message="Belum punya Akun?" buttonMessage="Daftar Sekarang" route="/signup" />

      {/* Tab Navigation */}
      <div className="bg-white shadow p-6 mt-4 mx-auto max-w-4xl">
        <div className="flex items-center space-x-4">
          <ProfileAvatar
            firstName={userName.split(' ')[0] || ''}
            lastName={userName.split(' ')[1] || ''}
            imageUrl={userProfilePic || undefined}
          />
          <div>
            <div className="font-semibold text-lg">{userName}</div>
            <div className="text-gray-500">{userEmail}</div>
          </div>
        </div>
        <div className="flex space-x-8 mt-4 border-b">
          <button
            className={`pb-2 ${activeTab === 'account' ? 'border-b-2 border-orange-500' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Akun
          </button>
          <button
            className={`pb-2 ${activeTab === 'favorites' ? 'border-b-2 border-orange-500' : ''}`}
            onClick={() => {
              checkMembership();
              setActiveTab('favorites');
              fetchFavorites();
            }}
          >
            Favorit
          </button>
          <button
            className={`pb-2 ${activeTab === 'transactions' ? 'border-b-2 border-orange-500' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Riwayat Transaksi
          </button>
          <button
            className="pb-2"
            onClick={() => {
              localStorage.removeItem('jwt_auth');
              localStorage.removeItem('refreshToken');
              window.location.href = '/';
            }}
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'account' && (
        <div className="mt-6 mx-auto max-w-4xl bg-white p-6 shadow" style={{ height: '655px', overflowY: 'auto' }}>
          <h2 className="text-xl font-semibold mb-4">Pengaturan Akun</h2>
          <div className="flex gap-6">
            <img
              src={userProfilePic || undefined}
              alt="profile"
              className="w-40 h-40 object-cover rounded"
            />
            <form className="flex-1 space-y-4" onSubmit={e => {
              e.preventDefault();
              const [firstName, lastName] = userName.split(' ');
              const host = import.meta.env.VITE_SERVER_URL;
              const formData = new FormData();

              formData.append('firstName', firstName);
              formData.append('lastName', lastName || '');
              formData.append('userEmail', userEmail);
              formData.append('userPhone', userPhone);
              formData.append('userPassword', userPassword);

              if (userProfilePic && userProfilePic.startsWith('data:')) {
                const arr = userProfilePic.split(',');
                const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
                const bstr = atob(arr[1]);
                const u8arr = new Uint8Array(bstr.length);
                for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
                const file = new Blob([u8arr], { type: mime });
                formData.append('file', file, 'profile-pic.png');
              }

              axios.patch(`${host}/users/${userId}/profile`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              })
                .then(() => setAlert({ show: true, type: 'success', message: 'Profil berhasil diperbarui!' }))
                .catch(err => setAlert({ show: true, type: 'error', message: err.response?.data?.message || 'Terjadi kesalahan saat memperbarui profil.' }));
            }}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nama Depan"
                  value={userName.split(' ')[0] || ''}
                  onChange={e => {
                    const last = userName.split(' ')[1] || '';
                    setUserName(`${e.target.value} ${last}`.trim());
                  }}
                />
                <Input
                  placeholder="Nama Belakang"
                  value={userName.split(' ')[1] || ''}
                  onChange={e => {
                    const first = userName.split(' ')[0] || '';
                    setUserName(`${first} ${e.target.value}`.trim());
                  }}
                />
              </div>
              <Input placeholder="Username" value={userName} onChange={e => setUserName(e.target.value)} />
              <Input type="email" placeholder="Email" value={userEmail} onChange={e => setUserEmail(e.target.value)} />
              <Input type="number" placeholder="No Handphone" value={userPhone} onChange={e => setUserPhone(e.target.value)} />
              <Input type="password" placeholder="Password" value={userPassword} onChange={e => setUserPassword(e.target.value)} />
              <div>
                <label className="block mb-1 font-medium">Update Foto Profil (PNG/JPG)</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => setUserProfilePic(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                  className="block w-full border border-gray-300 rounded px-3 py-2"
                />
                {userProfilePic?.startsWith('data:') && (
                  <img src={userProfilePic} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded" />
                )}
              </div>
              <Button type="submit" text="Simpan Perubahan" onClick={() => undefined} />
            </form>
          </div>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="mt-6 mx-auto max-w-4xl bg-white p-6 shadow" style={{ maxHeight: '655px', overflowY: 'auto' }}>
          <VideoFavoritLibrary></VideoFavoritLibrary>
        </div>
        
      )}

      {activeTab === 'transactions' && (

        <div className="mt-6 mx-auto max-w-4xl bg-white p-6 shadow" style={{ height: '655px', overflowY: 'auto' }}>
          <TransactionHistoryList transactions={paymentData}></TransactionHistoryList>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12 p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-8">
          <div>
            <div className="text-orange-500 font-bold text-xl mb-2">E‑tutor</div>
            <p>Platform edukasi untuk pelajar, startup founder, dan investor.</p>
            <div className="flex space-x-2 mt-2">
              <span>📘</span><span>📷</span><span>💼</span><span>📺</span>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Hubungi Kami</div>
            <p>Jl. Bima Sakes No. 99, Jakarta</p>
            <p>support@namatutorid.com</p>
            <p>62 812‑3456‑7890</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Navigasi Cepat</div>
            <p>Home</p><p>Skill (Video)</p><p>Community</p><p>Kontak</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Support</div>
            <p>Help Center</p><p>FAQs</p><p>Terms & Condition</p><p>Privacy Policy</p>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm mt-6">
          © 2021 - E‑tutor. Designed by TemplatemoSite. All rights reserved.
        </div>
      </footer>

      {alert.show && (
        <AlertPopup
          type={alert.type ?? 'success'}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
          duration={3000}
        />
      )}
    </>
  );
}
