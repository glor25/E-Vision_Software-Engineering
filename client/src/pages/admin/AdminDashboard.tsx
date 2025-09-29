
import { JSX } from "react";
import { Card, CardContent } from "../../components/Card";
import { FaVideo, FaUsers, FaUserPlus } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AlertPopup from "../../components/AlertPopup";
import Topbar from "../../components/Topbar";

interface Metric {
    icon: JSX.Element;
    label: string;
    value: number;
}



export default function AdminDashboard(): JSX.Element {
    const [metrics, setMetrics] = useState<Metric[]>([]);
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
    
    useEffect(() => {
        async function fetchMetrics() {
            const host: string = import.meta.env.VITE_SERVER_URL;
            const token = localStorage.getItem('jwt_auth');
            await axios.post(
                `${host}/metrics` , 
                {} ,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            ).then(res => {
                console.log(res);
                if(res.status !== 200){
                    setAlert({show:true, type:"error", message: res.data.message});
                }else{
                    
                    setMetrics([
                        { icon: <img src="src/assets/icons/communityMetrics.png" alt="Community" className="w-8 h-8" />, label: "Community", value: res.data.community || 0},
                        { icon: <FaVideo className="text-orange-500 text-2xl" />, label: "Jumlah Video", value: res.data.jumlahVideo || 0},
                        { icon: <FaUsers className="text-indigo-500 text-2xl" />, label: "Jumlah User", value: res.data.jumlahUser || 0},
                        { icon: <FaUserPlus className="text-yellow-500 text-2xl" />, label: "Data Pendaftaran", value: res.data.dataPendaftaran || 0},
                    ]);
                    return;
                }
            }).catch(e => {
                if (e.response?.data?.error?.name === "TokenExpiredError" || e.response?.data?.error?.name === "JsonWebTokenError") {
                    navigate('/');
                } else {
                    console.log(e.response?.data?.error?.name);
                }
            });
        }
        fetchMetrics();
    }, [navigate]);
    return (
        <div className="flex h-screen font-sans">
            <Sidebar></Sidebar>
    
            <main className="flex-1 bg-gray-50 overflow-hidden">
                <Topbar section="Dashboard"></Topbar>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 m-10">
                {metrics.map((metric, index) => (
                    <Card key={index} className="h-35">
                    <CardContent className="flex items-center space-x-4">
                        <div className="p-4 text-4xl">
                            {metric.icon}
                        </div>
                        <div>
                        <div className="text-4xl font-bold mt-4">{metric.value}</div>
                        <div className="text-l text-gray-500">{metric.label}</div>
                        </div>
                    </CardContent>
                    </Card>
                ))}
                </div>
    
                <div className="bg-white rounded-xl shadow-md m-10">
                    <img
                        src="src/assets/LandingPhoto.png"
                        alt="Welcome"
                        className="w-full h-160 object-contain rounded-md p-4"
                    />
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
            </main>
        </div>
    );
}
