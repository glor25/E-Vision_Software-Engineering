import React, { JSX } from "react"
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import UserList from "../subPages/UserList";


export default function adminUser(): JSX.Element {
    return (
        <div className="flex h-screen font-sans">
            <Sidebar></Sidebar>
    
            <main className="flex-1 bg-gray-50 overflow-hidden">
                <Topbar section="Daftar User"></Topbar>
                <div className="bg-white rounded-xl shadow-md m-10">
                    <UserList></UserList>
                </div>
    
            </main>
        </div>
    );
} 

