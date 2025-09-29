import React, { useState } from 'react';
import MiniNavbar from '../components/miniNavbart';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import AlertPopup from '../components/AlertPopup';

const ContactSection = () => {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        message: '',
    });
    const [isHovered, setIsHovered] = useState(false); 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const [alert, setAlert] = useState<{ show: boolean; type?: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const host: string = import.meta.env.VITE_SERVER_URL;

            const res = await axios.post(`${host}/submitContact`, form);
            
            setAlert({ show: true, type: 'success', message: 'Message sent successfully.' });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan.';
            setAlert({ show: true, type: 'error', message: errorMessage });
        }
    };

    return (
        <>
            <MiniNavbar />
            <Navbar message="Belum punya Akun?" buttonMessage="Daftar Sekarang" route={"/signup"} />
            <div className="bg-white">
                <div className="bg-[#1B1545] text-white text-center py-16">
                    <h1 className="text-3xl font-bold">Kontak</h1>
                </div>
                <div className="max-w-7xl h-full mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                    <div className="shadow-lg p-10 bg-white rounded-md">
                        <p className="uppercase text-center text-sm text-gray-500 mb-2">Tetap Berhubungan</p>
                        <h2 className="text-2xl font-bold text-center mb-6">Hubungi Kami</h2>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nama"
                                    className="w-1/2 border border-gray-300 p-3 rounded"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Nomor Handphone"
                                    className="w-1/2 border border-gray-300 p-3 rounded"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                className="w-full border border-gray-300 p-3 rounded"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                            <textarea
                                name="message"
                                rows={4}
                                placeholder="Pesan"
                                className="w-full border border-gray-300 p-3 rounded"
                                value={form.message}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="submit"
                                className="bg-orange-500 text-white w-full py-3 rounded hover:bg-orange-600 transition"
                                onClick={handleSubmit}
                            >
                                Kirim Sekarang
                            </button>
                        </form>
                    </div>
                    <div className="w-full h-[500px] rounded-md overflow-hidden shadow-lg">
                        <iframe 
                            title="Google Maps"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4300.531589346267!2d106.78390395383077!3d-6.204066993291914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f6dcc7d2c4ad%3A0x209cb1eef39be168!2sUniversitas%20Bina%20Nusantara%20Kampus%20Anggrek!5e0!3m2!1sid!2sid!4v1748371254872!5m2!1sid!2sid" 
                            width="100%"
                            height="100%" 
                            allowFullScreen
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade">    
                        </iframe>
                    </div>
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
            <Footer />
        </>
    );
};

export default ContactSection;
