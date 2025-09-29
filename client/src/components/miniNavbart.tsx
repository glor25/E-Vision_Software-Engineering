import React from "react";
import { useNavigate } from "react-router-dom";

const MiniNavbar: React.FC = () => {
    const navigate = useNavigate();

    return (
        <nav className="bg-black text-white flex gap-6 px-8 py-2 text-sm font-light">
            <button
                className="hover:text-orange-400 transition"
                onClick={() => navigate("/")}
            >
                Home
            </button>
            <button
                className="hover:text-orange-400 transition"
                onClick={() => navigate("/contact")}
            >
                Contact
            </button>
            <button
                className="hover:text-orange-400 transition"
                onClick={() => navigate("/community")}
            >
                Community
            </button>
            <button
                className="hover:text-orange-400 transition"
                onClick={() => navigate("/skills")}
            >
                Skill
            </button>
        </nav>
    );
};

export default MiniNavbar;