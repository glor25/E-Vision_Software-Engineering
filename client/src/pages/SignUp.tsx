import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import InputField from '../components/InputField';
import axios from 'axios';
import AlertPopup from '../components/AlertPopup';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';



const SignUp: React.FC = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setlastName] = useState("");
    const [userName, setUserName] = useState("");
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!firstName || !lastName) {
            
            setAlert({ show: true, type: 'error', message: 'First name and last name are required!' });
            return;
        }
        if (!userName) {   
            setAlert({ show: true, type: 'error', message: 'Username is required!' });
            return;
        }
        if (!email) {
            setAlert({ show: true, type: 'error', message: 'Email is required!' });
            return;
        }

        if (!password) {
            setAlert({ show: true, type: 'error', message: 'Password is required!' });
            return;
        }
        const host: string = import.meta.env.VITE_SERVER_URL
        axios.post(`${host}/register`, {
            firstName,
            lastName,
            userName,
            password,
            email,
        }).then(res => {
            
            if (res.status === 201) {
                setAlert({ show: true, type: 'success', message: `${res.data.message}` });
            }
            navigate('/login');
        }).catch(e => {
            console.log(e.response.data.message);
            setAlert({show: true, type:'error', message: `${e.response.data.message}`});
        });
        return;
    };

    return (
        <>
            <Navbar message="Sudah punya akun?" buttonMessage="Login Sekarang" route='/login'></Navbar>
            <div className="h-[calc(100vh-4rem)] overflow-hidden flex">
                <img
                src="src/assets/Illustrations.png"
                alt="Signup Illustration"
                className="max-w-full h-auto"
                />

                <div className="w-1/2 flex flex-col justify-center px-20">
                <h2 className="text-3xl font-semibold mb-8">Buat akun Anda</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="flex gap-5">
                    <div className="flex flex-col w-full">
                        <InputField
                        label="Nama Lengkap"
                        placeholder="First name..."
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col w-full">
                        <InputField
                        label="&nbsp;" // Adds spacing to align with the first input
                        placeholder="Last name..."
                        value={lastName}
                        onChange={(e) => setlastName(e.target.value)}
                        />
                    </div>
                    </div>

                    <InputField
                    label="Username"
                    placeholder="Username..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    />

                    <InputField
                    label="Email"
                    placeholder="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />

                    <InputField
                    label="Password"
                    placeholder="Create password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    showToggle={true}
                    onToggle={() => setShowPassword((prev) => !prev)}
                    />
                    <Button type="submit" onClick={() => handleSubmit} text="Buat Akun" />
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

export default SignUp;
