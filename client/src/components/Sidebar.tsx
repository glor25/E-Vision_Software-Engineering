import React, { JSX } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "../index.css";

interface NavItem {
    label: string;
    icon: string;
    path: string;
}

const navItems: NavItem[] = [
    { label: "Dashboard", icon: "src/assets/icons/dashboard.png", path: "/admin" },
    { label: "Community", icon: "src/assets/icons/community.png", path: "/adminCommunity" },
    { label: "Daftar Video", icon: "src/assets/icons/video.png", path: "/adminVideos" },
    { label: "Kelola User", icon: "src/assets/icons/user.png", path: "/adminUsers" },
    { label: "Data Pendaftaran", icon: "src/assets/icons/register.png", path: "/adminRegister" },
    { label: "Keluar", icon: "src/assets/icons/logout.png", path: "/" },
];


export default function Sidebar(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("jwt_auth");
        localStorage.removeItem("refreshToken");
        navigate('/');
    };
    return (
        <aside className="w-64 bg-gray-900 text-white p-6 space-y-6 min-h-screen">
        <div className="text-2xl font-bold flex items-center space-x-2">
            <img src="src/assets/icons/logo.png" alt="E-Vision Logo" className="w-8 h-8" />
            <span 
                style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "29.35px",
                    lineHeight: "124%",
                    letterSpacing: "-3%",
                }}
            >
                E-Vision
            </span>
        </div>
        <nav className="space-y-2 text-sm pt-10">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                if(item.label === 'Keluar'){
                    return (
                        <Link
                            key={item.label}
                            onClick={handleLogout}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-2 rounded hover:bg-gray-800 ${
                                isActive ? "bg-gray-800" : ""
                            }`}
                            style={{ fontSize: "1.125rem" }}
                        >
                        <img src={item.icon} alt={item.label} className="w-6 h-6" />
                        <span>{item.label}</span>
                        </Link>
                    );
                }else{
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-2 rounded hover:bg-gray-800 ${
                                isActive ? "bg-gray-800" : ""
                            }`}
                            style={{ fontSize: "1.125rem" }}
                        >
                        <img src={item.icon} alt={item.label} className="w-6 h-6" />
                        <span>{item.label}</span>
                        </Link>
                    );
                }
            })}
        </nav>
        </aside>
    );
}
