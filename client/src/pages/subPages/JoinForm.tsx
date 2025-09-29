import { useEffect, useState } from "react";
import { validateToken } from "../../utils/ValidateToken";
import { validateMembership } from "../../utils/ValidateMembership";
import { useNavigate } from "react-router-dom";
import AlertPopup from "../../components/AlertPopup";
import axios from "axios";

const paymentOptions = [
    { method: "Dana", number: "0123 4567 890", name: "Ronaldo Pascol" },
    { method: "Mandiri", number: "0123 4567 890", name: "Ronaldo Pascol" },
];

export default function JoinForm() {
    const [selectedPayment, setSelectedPayment] = useState("Dana");
    const [fullName, setFullName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [userId, setUserId] = useState<number>(0);
    const [duration, setDuration] = useState<number>(6);
    const [alert, setAlert] = useState<{ show: boolean; type?: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = async () => {
            const isValid = await validateToken();
            if (!isValid) {
                navigate('/login');
            }
        };
        checkToken();
        const token = localStorage.getItem('jwt_auth');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setFullName(payload.name || '');
            setEmail(payload.email || '');
            setPhoneNumber(payload.phoneNumber || '');
            setUserId(payload.userId || 0);
            console.log(payload)
        }
        
    },[navigate]);

    return (
        <div className="max-w-2xl mx-auto bg-white p-10 rounded shadow-md mt-10">
        <h1 className="text-2xl font-semibold text-center mb-2">
            Bergabunglah Bersama Kami
        </h1>
        <p className="text-center text-gray-600 mb-8">
            Bergabunglah dengan komunitas bisnis eksklusif yang menghubungkan Anda
            dengan para pebisnis profesional, investor, dan mentor bisnis
            berpengalaman!
        </p>

        <form className="space-y-6">
            <div>
            <label className="block mb-1 font-medium">Nama Lengkap</label>
            <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded bg-gray-100 cursor-not-allowed"
                value={fullName}
                disabled
                readOnly
            />
            </div>

            <div className="flex gap-4">
            <div className="w-1/2">
                <label className="block mb-1 font-medium">Email</label>
                <input
                type="email"
                value={email}
                className="w-full border border-gray-300 p-2 rounded bg-gray-100 cursor-not-allowed"
                disabled
                readOnly
                />
            </div>
            <div className="w-1/2">
                <label className="block mb-1 font-medium">No Handphone</label>
                <input
                type="text"
                value={phoneNumber}
                className="w-full border border-gray-300 p-2 rounded bg-gray-100 cursor-not-allowed"
                disabled
                readOnly
                />
            </div>
            </div>

            <div>
            <label className="block mb-1 font-medium">Paket</label>
            <select
                className="w-full border border-gray-300 p-2 rounded"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
            >
                <option value={12}>1 Tahun</option>
                <option value={6}>6 Bulan</option>
            </select>
            </div>

            <div>
            <label className="block mb-2 font-medium">
                Pilih Metode Pembayaran
            </label>
            <div className="space-y-2">
                {paymentOptions.map((option) => (
                <div
                    key={option.method}
                    onClick={() => setSelectedPayment(option.method)}
                    className={`flex justify-between items-center p-3 border rounded cursor-pointer ${
                    selectedPayment === option.method
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300"
                    }`}
                >
                    <span className="font-medium">{option.method}</span>
                    <span className="text-gray-700">{option.number}</span>
                    <span className="text-gray-700">{option.name}</span>
                </div>
                ))}
            </div>
            </div>

            <button
                type="button"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded mt-4 font-semibold"
                onClick={async (e) => {
                    e.preventDefault();
                    try {
                        const host = import.meta.env.VITE_SERVER_URL;
                        const res = await axios.post(
                            `${host}/submit`,
                            {
                                userId,
                                duration,
                                phoneNumber,
                                paymentMethod: selectedPayment,
                            },
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${localStorage.getItem("jwt_auth")}`,
                                },
                            }
                        );
                        if (res.status === 201) {
                            setAlert({ show: true, type: 'success', message: 'Payment Successfull, wait on to be verified!' });
                        } else {
                            setAlert({ show: true, type: 'error', message: 'Submit Payment Error, wait on for several minutes!' });
                        }
                    } catch (error: any) {
                        alert(
                            error?.response?.data?.message ||
                            "Gagal menghubungi server."
                        );
                    }
                }}
            >
                Bayar Sekarang
            </button>
        </form>
        {alert.show && (
            <AlertPopup
                type={alert.type || 'success'}
                message={alert.message}
                onClose={() => setAlert({ ...alert, show: false })}
                duration={3000}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
        )}
        </div>
    );
}
