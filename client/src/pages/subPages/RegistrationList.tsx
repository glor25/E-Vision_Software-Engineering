import { useState, useEffect } from "react";
import axios from "axios";
import AlertPopup from "../../components/AlertPopup";
import { useNavigate } from "react-router-dom";
import { validateToken } from "../../utils/ValidateToken";
import { validateMembership } from "../../utils/ValidateMembership";

type Payment = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    telepon: string;
    paymentId: number;
    paymentStatus: boolean;
}

const paymentsData: Payment[] = [];

export default function VideoList() {
    const [payments, setPayments] = useState<Payment[]>(paymentsData);

    const [page, setPage] = useState<number>(1);
    const limit = 10;
    const [alert, setAlert] = useState<{ show: boolean; type?: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });
    const [isHovered, setIsHovered] = useState(false);
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const navigate = useNavigate();

    useEffect(() => {
        
        const checkToken = async () => {
            const isValid = await validateToken();
            if (!isValid) {
                navigate('/login');
            }
        };
        checkToken();
        const fetchPayments = async () => {
            try {
                const host: string = import.meta.env.VITE_SERVER_URL;
                const token = localStorage.getItem('jwt_auth');
                const response = await axios.post(`${host}/payments/paginate`, {
                    page,
                    limit,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response);
                const res = response.data;
                if (Array.isArray(res)) {
                    setPayments(
                        res.map((payment: Payment) => ({
                            id: payment.id,
                            firstName: payment.firstName,
                            lastName: payment.lastName,
                            email: payment.email,
                            telepon: payment.telepon,
                            paymentId: payment.paymentId ?? null,
                            paymentStatus: payment.paymentStatus ?? false,
                        }))
                    );
                } else {
                    setPayments([]);
                }
            } catch (error) {
                console.error("Error fetching videos:", error);
            }
        };

        fetchPayments();
        const fetchTotalPayments = async () => {
            try {
                const host: string = import.meta.env.VITE_SERVER_URL;
                const token = localStorage.getItem('jwt_auth');
                const response = await axios.get(`${host}/payments/count`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setTotalUsers(response.data.paymentCount);
            } catch (error) {
                console.error("Error fetching total videos:", error);
            }
        };

        fetchTotalPayments();
        
        let timer: NodeJS.Timeout;
        if (alert.show && !isHovered) {
            timer = setTimeout(() => {
                setAlert({ ...alert, show: false });
            }, 3000);
        }
        return () => {
            clearTimeout(timer);
        };
    }, [page, limit, alert, alert.show, isHovered, navigate]);
    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="flex justify-between mb-5">
                <h2 className="text-xl font-semibold">Daftar Pendaftaran</h2>
            </div>

            <div className="flex justify-end mb-2">
                <input
                    type="text"
                    placeholder="Search"
                    className="border border-gray-300 px-3 py-1 rounded"
                    onChange={async (e) => {
                        const searchQuery = e.target.value;
                        try {
                            const host: string = import.meta.env.VITE_SERVER_URL;
                            const token = localStorage.getItem('jwt_auth');
                            const response = await axios.post(`${host}/payments/paginate`, {
                                page,
                                limit,
                                search: searchQuery,
                            }, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            console.log(response.data);
                            if (Array.isArray(response.data)) {
                                setPayments(
                                    response.data.map((payment: Payment) => ({
                                        id: payment.id,
                                        firstName: payment.firstName,
                                        lastName: payment.lastName,
                                        email: payment.email,
                                        telepon: payment.telepon,
                                        paymentId: payment.paymentId ?? null,
                                        paymentStatus: payment.paymentStatus,
                                    }))
                                );
                            }
                            const fetchPaymentsTotal = async () => {
                                try {
                                    const host: string = import.meta.env.VITE_SERVER_URL;
                                    const token = localStorage.getItem('jwt_auth');
                                    const response = await axios.get(`${host}/payments/count`, {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                        params: {
                                            search: searchQuery,
                                        }
                                    });
                                    setTotalUsers(response.data.paymentCount);
                                } catch (error) {
                                    console.error("Error fetching total videos:", error);
                                    setAlert({ show: true, type: 'error', message: 'Failed to fetch total users' });
                                }
                            };
                            fetchPaymentsTotal();
                            setTotalUsers(response.data.paymentCount);
                        } catch (error) {
                            console.error("Error searching videos:", error);
                            setAlert({ show: true, type: 'error', message: 'Failed to search users' });
                        }
                    }}
                />
            </div>

            <table className="w-full text-sm border border-gray-300-collapse">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="p-2 border border-gray-300">NO</th>
                        <th className="p-2 border border-gray-300">NAMA DEPAN</th>
                        <th className="p-2 border border-gray-300">NAMA BELAKANG</th>
                        <th className="p-2 border border-gray-300">EMAIL</th>
                        <th className="p-2 border border-gray-300">TELEPON</th>
                        <th className="p-2 border border-gray-300">STATUS PEMBAYARAN</th>
                        <th className="p-2 border border-gray-300">AKSI</th>
                    </tr>
                </thead>
                <tbody>
                    {payments && payments.map((payment, index) => (
                        <tr key={payment.id} className="text-gray-700">
                            <td className="p-2 border border-gray-300 text-center">{(index + 1) + ((page-1) * 10)}</td>
                            <td className="p-2 border border-gray-300">{payment.firstName}</td>
                            <td className="p-2 border border-gray-300">{payment.lastName}</td>
                            <td className="p-2 border border-gray-300">{payment.email}</td>
                            <td className="p-2 border border-gray-300">{payment.telepon}</td>
                            <td className="p-2 border border-gray-300">
                                {payment.paymentStatus ? "Terverifikasi" : "Belum Terverifikasi"}
                            </td>
                            <td className="p-2 border border-gray-300 space-x-2">
                                <button
                                    onClick={() => {
                                        const updatePaymentStatus = async () => {
                                            try {
                                                const host: string = import.meta.env.VITE_SERVER_URL;
                                                const token = localStorage.getItem('jwt_auth');
                                                console.log(`${host}/paymentsUpdate/${payment.paymentId}`)
                                                await axios.patch(
                                                    `${host}/paymentsUpdate/${payment.paymentId}`,
                                                    {
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                        },
                                                    }
                                                );
                                                setPayments(prev =>
                                                    prev.map(p =>
                                                        p.id === payment.id
                                                            ? { ...p, paymentStatus: p.paymentStatus === true ? true : false }
                                                            : p
                                                    )
                                                );
                                                setAlert({ show: true, type: 'success', message: 'Payment status updated successfully' });
                                            } catch (error) {
                                                setAlert({ show: true, type: 'error', message: `${error.response.data.message}` });
                                            }
                                        };
                                        updatePaymentStatus();
                                    }}
                                >
                                    <img src="src/assets/icons/ConfirmRegist.png" alt="Update" className="w-10 h-10 inline" />
                                </button>
                                <button
                                    // onClick={async () => {
                                    //     try {
                                    //         const host: string = import.meta.env.VITE_SERVER_URL;
                                    //         const token = localStorage.getItem('jwt_auth');
                                    //         await axios.delete(`${host}/users/${payment.id}`, {
                                    //             headers: {
                                    //                 Authorization: `Bearer ${token}`,
                                    //             },
                                    //         });
                                    // setUsers(prev => prev.filter(u => u.id !== payment.id));
                                    //         setAlert({ show: true, type: 'success', message: 'User deleted successfully' });
                                    //     } catch (error) {
                                    //         console.error("Error deleting user:", error);
                                    //         setAlert({ show: true, type: 'error', message: 'Failed to delete user' });
                                    //     }
                                    // }}
                                >
                                    <img src="src/assets/icons/trash.png" alt="Delete" className="w-10 h-10 inline" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between mt-4 text-sm text-gray-600">
                <span>
                    Showing {payments && payments.length > 0 ? (page - 1) * limit + 1 : 0} to {(page - 1) * limit + (payments ? payments.length : 0)} of {totalUsers} entries
                </span>
                <div className="space-x-1">
                    <button
                        className="px-3 py-1 border border-gray-300 rounded text-gray-600"
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 bg-indigo-500 text-white rounded">{page}</span>
                    <button
                        className="px-3 py-1 border border-gray-300 rounded text-gray-600"
                        onClick={() => setPage((prev) => (prev * limit < totalUsers ? prev + 1 : prev))}
                        disabled={page * limit >= totalUsers}
                    >
                        Next
                    </button>
                </div>
            </div>

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
