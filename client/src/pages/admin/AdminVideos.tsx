import React, { JSX } from "react"
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import VideoList from "../subPages/VideoList";


export default function adminVideos(): JSX.Element {
    return (
        <div className="flex h-screen font-sans">
            <Sidebar></Sidebar>
    
            <main className="flex-1 bg-gray-50 overflow-hidden">
                <Topbar section="Videos"></Topbar>
                <div className="bg-white rounded-xl shadow-md m-10">
                    <VideoList></VideoList>
                </div>
    
            </main>
        </div>
    );
} 

