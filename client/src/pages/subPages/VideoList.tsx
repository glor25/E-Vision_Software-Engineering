import { useState, useEffect } from "react";
import axios from "axios";
import AlertPopup from "../../components/AlertPopup";
import { validateToken } from "../../utils/ValidateToken";
import { useNavigate } from "react-router-dom";
import { validateMembership } from "../../utils/ValidateMembership";

type Video = {
    id: number;
    title: string;
    category: string;
    description: string;
    uploadTime: string;
};

const dummyData: Video[] = [];

export default function VideoList() {
    const [videos, setVideos] = useState<Video[]>(dummyData);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingVideoId, setEditingVideoId] = useState<number | null>(null);
    const [newVideo, setNewVideo] = useState({
        title: '',
        category: 'Investasi',
        description: '',
        file: null as File | null
    });
    const [page, setPage] = useState<number>(1);
    const limit = 10;
    const [alert, setAlert] = useState<{ show: boolean; type?: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });
    const [isHovered, setIsHovered] = useState(false);

    const [totalVideos, setTotalVideos] = useState<number>(0);
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = async () => {
            const isValid = await validateToken();
            if (!isValid) {
                navigate('/login');
            }
        };
        checkToken();
        const fetchVideos = async () => {
            try {
                const host: string = import.meta.env.VITE_SERVER_URL;
                const token = localStorage.getItem('jwt_auth');
                const response = await axios.post(`${host}/videos/paginate`, {
                    page,
                    limit,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setVideos(response.data.videos);
            } catch (error) {
                console.error("Error fetching videos:", error);
            }
        };

        fetchVideos();
        const fetchTotalVideos = async () => {
            try {
                const host: string = import.meta.env.VITE_SERVER_URL;
                const token = localStorage.getItem('jwt_auth');
                const response = await axios.get(`${host}/countVideos`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setTotalVideos(response.data.totalVideos);
            } catch (error) {
                console.error("Error fetching total videos:", error);
            }
        };

        fetchTotalVideos();
        
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
            const formData = new FormData();
            formData.append('title', newVideo.title);
            formData.append('category', newVideo.category);
            formData.append('description', newVideo.description);
            if (newVideo.file) formData.append('file', newVideo.file);
            const token = localStorage.getItem('jwt_auth');
            if (isEditing && editingVideoId !== null) {
                setAlert({ show: true, type: 'success', message: 'Updating video...', });
                await axios.put(`${host}/updateVideo/${editingVideoId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAlert({ show: true, type: 'success', message: 'Video updated successfully' });
            } else {
                formData.append('uploadTime', new Date().toISOString());
                setAlert({ show: true, type: 'success', message: 'Uploading video...', });
                await axios.post(`${host}/upload`, formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAlert({ show: true, type: 'success', message: 'Video uploaded successfully' });
            }

            setShowModal(false);
            setIsEditing(false);
            setEditingVideoId(null);
            const refreshed = await axios.post(
                `${host}/videos/paginate`,
                { page, limit },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setVideos(refreshed.data.videos);
            return;
        } catch (err) {
            console.error(err);
            setAlert({ show: true, type: 'error', message: 'Operation failed' });
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="flex justify-between mb-5">
                <h2 className="text-xl font-semibold">Daftar Video</h2>
                <button
                    onClick={() => {
                        setShowModal(true);
                        setIsEditing(false);
                        setEditingVideoId(null);
                        setNewVideo({ title: '', category: 'Investasi', description: '', file: null });
                    }}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                    Tambah Video
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
                            const response = await axios.post(`${host}/videos/paginate`, {
                                page,
                                limit,
                                search: searchQuery,
                            }, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            setVideos(response.data.videos);
                            const fetchTotalVideos = async () => {
                                try {
                                    const host: string = import.meta.env.VITE_SERVER_URL;
                                    const token = localStorage.getItem('jwt_auth');
                                    const response = await axios.get(`${host}/countVideos`, {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                        params: {
                                            search: searchQuery,
                                        }
                                    });
                                    
                                    setTotalVideos(response.data.totalVideos);
                                } catch (error) {
                                    console.error("Error fetching total videos:", error);
                                }
                            };
                            fetchTotalVideos();
                            setTotalVideos(response.data.totalVideos);
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
                        <th className="p-2 border border-gray-300">TANGGAL UNGGAH</th>
                        <th className="p-2 border border-gray-300">JUDUL VIDEO</th>
                        <th className="p-2 border border-gray-300">KATEGORI</th>
                        <th className="p-2 border border-gray-300">DESKRIPSI</th>
                        <th className="p-2 border border-gray-300">AKSI</th>
                    </tr>
                </thead>
                <tbody>
                    {videos.map((video, index) => (
                        <tr key={video.id} className="text-gray-700">
                            <td className="p-2 border border-gray-300 text-center">{(index + 1) + ((page-1) * 10)}</td>
                            <td className="p-2 border border-gray-300">
                                {new Date(video.uploadTime).toLocaleString()}
                            </td>
                            <td className="p-2 border border-gray-300">{video.title}</td>
                            <td className="p-2 border border-gray-300">{video.category}</td>
                            <td className="p-2 border border-gray-300">{video.description}</td>
                            <td className="p-2 border border-gray-300 space-x-2">
                                <button
                                    onClick={() => {
                                        setShowModal(true);
                                        setIsEditing(true);
                                        setEditingVideoId(video.id);
                                        setNewVideo({
                                            title: video.title,
                                            category: video.category,
                                            description: video.description,
                                            file: null,
                                        });
                                    }}
                                >
                                    <img src="src/assets/icons/edit.png" alt="Delete" className="w-10 h-10 inline" />
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const host: string = import.meta.env.VITE_SERVER_URL;
                                            const token = localStorage.getItem('jwt_auth');
                                            await axios.delete(`${host}/deleteVideo/${video.id}`, {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            });
                                            setVideos(prev => prev.filter(v => v.id !== video.id));
                                            setAlert({ show: true, type: 'success', message: 'Video deleted successfully' });
                                        } catch (error) {
                                            console.error("Error deleting video:", error);
                                            setAlert({ show: true, type: 'error', message: 'Failed to delete video' });
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

                    Showing {videos.length > 0 ? (page - 1) * limit + 1 : 0} to {(page - 1) * limit + videos.length} of {totalVideos} entries
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
                        onClick={() => setPage((prev) => (prev * limit < totalVideos ? prev + 1 : prev))}
                        disabled={page * limit >= totalVideos}
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
                                {isEditing ? 'Edit Video' : 'Tambah Video'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block font-medium mb-1">Judul Video</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={newVideo.title}
                                        onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Kategori</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={newVideo.category}
                                        onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                                    >
                                        <option value="Investasi">Investasi</option>
                                        <option value="Teknologi">Teknologi</option>
                                        <option value="Pendidikan">Pendidikan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Deskripsi</label>
                                    <textarea
                                        className="w-full border rounded px-3 py-2"
                                        rows={3}
                                        value={newVideo.description}
                                        onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Unggah Video</label>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) =>
                                            setNewVideo({ ...newVideo, file: e.target.files ? e.target.files[0] : null })
                                        }
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-white file:text-gray-700 hover:file:bg-gray-100"
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
