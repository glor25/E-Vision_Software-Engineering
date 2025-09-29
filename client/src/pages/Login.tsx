import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import InputField from '../components/InputField';
import Button from '../components/Button';
import axios from 'axios';
import AlertPopup from '../components/AlertPopup';
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState<{ show: boolean; type?: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });
    const [isHovered, setIsHovered] = useState(false); 
    const navigate = useNavigate();
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (alert.show && !isHovered) {
        timer = setTimeout(() => {
            setAlert({ ...alert, show: false });
        }, 3000);
        }

        return () => {
        clearTimeout(timer);
        };
    }, [alert, alert.show, isHovered]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!email){
            setAlert({ show: true, type: 'error', message: 'Email are required!' });
            return;
        }
        if (!password) {
            setAlert({ show: true, type: 'error', message: 'Password is required!' });
            return;
        }
        const host: string = import.meta.env.VITE_SERVER_URL;
        await axios.post(`${host}/login`, {
            email,
            password,
        }).then(res => {
            
            if (res.status === 200) {
                setAlert({ show: true, type: 'success', message: `${res.data.message}` });
                if (res.data.token) {
                    localStorage.setItem('jwt_auth', res.data.token);
                } else {
                    console.error('Token is undefined');
                    setAlert({ show: true, type: 'error', message: 'Failed to retrieve authentication token.' });
                }
            }
            
            if (res.data.message === 'Admin login successful') {
                navigate('/admin');
            }else{
                navigate('/');
            }
        }).catch(e => {
            console.log(e.response.data.message);
            setAlert({show: true, type:'error', message: `${e.response.data.message}`});
        });
        return;
    };
    return (
        <>
            <Navbar message="Tidak punya akun?" buttonMessage="Daftar Akun" route='/signup'></Navbar>
            <div className="h-[calc(100vh-4rem)] overflow-hidden flex">
            {/* Left image side */}
                <img
                src="src/assets/Illustrations.png"
                alt="Login Illustration"
                className="max-w-full h-full object-cover"
                />

            {/* Right form side */}
            <div className="w-1/2 flex flex-col justify-center px-20">
                <h2 className="text-3xl font-semibold mb-8">Masuk ke akun Anda</h2>

                <form className="space-y-6" onSubmit={handleLogin}>
                <InputField
                    label="Email"
                    type="email"
                    placeholder="Nama pengguna atau alamat email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <InputField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    showToggle={true}
                    onToggle={() => setShowPassword((prev) => !prev)}
                />

                    <Button type="submit" onClick={() => handleLogin} text="Login" />
                </form>
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
        </>
        
    );
};

export default Login;