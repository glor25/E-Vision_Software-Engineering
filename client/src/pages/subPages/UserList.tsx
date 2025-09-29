import { useState, useEffect } from "react";
import axios from "axios";
import AlertPopup from "../../components/AlertPopup";
import { validateToken } from "../../utils/ValidateToken";
import { useNavigate } from "react-router-dom";
import { validateMembership } from "../../utils/ValidateMembership";
type User = {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
    telepon: string;
}

const usersData: User[] = [];

export default function VideoList() {
    const [users, setUsers] = useState<User[]>(usersData);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUserId, seteditingUserId] = useState<number | null>(null);
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        password: '',
        telepon: ''
    });

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
        const fetchUser = async () => {
            try {
                const host: string = import.meta.env.VITE_SERVER_URL;
                const token = localStorage.getItem('jwt_auth');
                const response = await axios.post(`${host}/users/paginate`, {
                    page,
                    limit,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(response.data.users);
            } catch (error) {
                console.error("Error fetching videos:", error);
            }
        };

        fetchUser();
        const fetchTotalUsers = async () => {
            try {
                const host: string = import.meta.env.VITE_SERVER_URL;
                const token = localStorage.getItem('jwt_auth');
                const response = await axios.get(`${host}/users/count`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setTotalUsers(response.data.totalUsers);
            } catch (error) {
                console.error("Error fetching total videos:", error);
            }
        };

        fetchTotalUsers();
        
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

    const handleSave = async () => {
        try {
            const host = import.meta.env.VITE_SERVER_URL;
            const formData = {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                userName: newUser.userName,
                password: newUser.userName,
                email: newUser.email,
                telepon: newUser.telepon,
            };
            const token = localStorage.getItem('jwt_auth');
            console.log(token);
            if (isEditing && editingUserId !== null) {
                console.log("KONTOL1!");
                await axios.put(`${host}/users/${editingUserId}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAlert({ show: true, type: 'success', message: 'User updated successfully' });
            } else {
                console.log("KONTOL2!");
                await axios.post(`${host}/usersAdd`, formData, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAlert({ show: true, type: 'success', message: 'User uploaded successfully' });
            }

            setShowModal(false);
            setIsEditing(false);
            seteditingUserId(null);

            // Refresh videos
            const refreshed = await axios.post(
                `${host}/users/paginate`,
                { page, limit },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUsers(refreshed.data.users);

        } catch (err) {
            console.error(err);
            setAlert({ show: true, type: 'error', message: 'Operation failed' });
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="flex justify-between mb-5">
                <h2 className="text-xl font-semibold">Daftar Users</h2>
                <button
                    onClick={() => {
                        setShowModal(true);
                        setIsEditing(false);
                        seteditingUserId(null);
                        setNewUser({ firstName: '', lastName: '', userName: '', email: '', password: '', telepon: '' });
                    }}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                    Tambah User
                </button>
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
                            const response = await axios.post(`${host}/users/paginate`, {
                                page,
                                limit,
                                search: searchQuery,
                            }, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            setUsers(response.data.users);
                            const fetchTotalUsers = async () => {
                                try {
                                    const host: string = import.meta.env.VITE_SERVER_URL;
                                    const token = localStorage.getItem('jwt_auth');
                                    const response = await axios.get(`${host}/users/count`, {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                        params: {
                                            search: searchQuery,
                                        }
                                    });
                                    setTotalUsers(response.data.totalUsers);
                                } catch (error) {
                                    console.error("Error fetching total videos:", error);
                                }
                            };
                            fetchTotalUsers();
                            setTotalUsers(response.data.totalUsers);
                        } catch (error) {
                            console.error("Error searching videos:", error);
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
                        <th className="p-2 border border-gray-300">NAMA PENGGUNA</th>
                        <th className="p-2 border border-gray-300">EMAIL</th>
                        <th className="p-2 border border-gray-300">TELEPON</th>
                        <th className="p-2 border border-gray-300">AKSI</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user.id} className="text-gray-700">
                            <td className="p-2 border border-gray-300 text-center">{(index + 1) + ((page-1) * 10)}</td>
                            <td className="p-2 border border-gray-300">{user.firstName}</td>
                            <td className="p-2 border border-gray-300">{user.lastName}</td>
                            <td className="p-2 border border-gray-300">{user.userName}</td>
                            <td className="p-2 border border-gray-300">{user.email}</td>
                            <td className="p-2 border border-gray-300">{user.telepon}</td>
                            <td className="p-2 border border-gray-300 space-x-2">
                                <button
                                    onClick={() => {
                                        setShowModal(true);
                                        setIsEditing(true);
                                        seteditingUserId(user.id);
                                        setNewUser({
                                            firstName: user.firstName,
                                            lastName: user.lastName,
                                            userName: user.userName,
                                            email: user.email,
                                            password: user.password,
                                            telepon: user.telepon,
                                        });
                                    }}
                                >
                                    <img src="src/assets/icons/edit.png" alt="Edit" className="w-10 h-10 inline" />
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const host: string = import.meta.env.VITE_SERVER_URL;
                                            const token = localStorage.getItem('jwt_auth');
                                            await axios.delete(`${host}/users/${user.id}`, {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            });
                                            setUsers(prev => prev.filter(u => u.id !== user.id));
                                            setAlert({ show: true, type: 'success', message: 'User deleted successfully' });
                                        } catch (error) {
                                            console.error("Error deleting user:", error);
                                            setAlert({ show: true, type: 'error', message: 'Failed to delete user' });
                                        }
                                    }}
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

                    Showing {users.length > 0 ? (page - 1) * limit + 1 : 0} to {(page - 1) * limit + users.length} of {totalUsers} entries
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

            {showModal && (
                <>
                    <div className="fixed inset-0 bg-black z-40" style={{ opacity: 0.6 }}></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="bg-white w-full max-w-2xl rounded-xl p-6 shadow-lg relative">
                            <button
                                className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                onClick={() => setShowModal(false)}
                            >
                                ← Kembali
                            </button>

                            <h3 className="text-xl font-semibold mb-6 text-center">
                                {isEditing ? 'Edit User' : 'Tambah User'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block font-medium mb-1">Nama Depan</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={newUser.firstName}
                                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Nama Belakang</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={newUser.lastName}
                                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Nama Pengguna</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={newUser.userName}
                                        onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full border rounded px-3 py-2"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Telepon</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={newUser.telepon}
                                        onChange={(e) => setNewUser({ ...newUser, telepon: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Password</label>
                                    <input
                                        type="password"
                                        className="w-full border rounded px-3 py-2"
                                        value={newUser.password || ''}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 space-x-3">
                                <button
                                    className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
                                    onClick={handleSave}
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
