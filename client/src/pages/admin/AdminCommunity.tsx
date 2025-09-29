import { JSX } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import CommunityPage from "../Community";



export default function AdminCommunity(): JSX.Element{
    return (
        <>
            <div style={{ display: "flex", height: "100vh" }}>
                <Sidebar />
                <div style={{ flex: 1, overflow: "auto" }}>
                    <CommunityPage isAdmin={true} />
                </div>
            </div>
        </>
            
    );
}