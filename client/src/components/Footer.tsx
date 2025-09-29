import React from 'react';
import { useNavigate } from 'react-router-dom';


const Footer: React.FC = () => {
    const navigate = useNavigate();
    return (
        <footer className="bg-black text-white px-60 py-12 text-sm">
            <div className="flex justify-between mb-8">
            <div>
                <img src="src/assets/LOGO.png" alt="E-tutor" className="w-24 mb-4" />
                <p>Platform edukatif untuk pebisnis, startup founder, dan investor.</p>
                <div className="flex gap-2 mt-4">
                    <a href="#" className="bg-gray-800 p-3 rounded hover:bg-orange-500 transition-colors">
                        <img src="src/assets/icons/Facebook.png" alt="Facebook" className="w-6 h-6" />
                    </a>
                    <a href="#" className="bg-gray-800 p-3 rounded hover:bg-orange-500 transition-colors">
                        <img src="src/assets/icons/Instagarm.png" alt="Instagram" className="w-6 h-6" />
                    </a>
                    <a href="#" className="bg-gray-800 p-3 rounded hover:bg-orange-500 transition-colors">
                        <img src="src/assets/icons/Linkedin.png" alt="LinkedIn" className="w-6 h-6" />
                    </a>
                    <a href="#" className="bg-gray-800 p-3 rounded hover:bg-orange-500 transition-colors">
                        <img src="src/assets/icons/Twitter.png" alt="Twitter" className="w-6 h-6" />
                    </a>
                    <a href="#" className="bg-gray-800 p-3 rounded hover:bg-orange-500 transition-colors">
                        <img src="src/assets/icons/Youtube.png" alt="Youtube" className="w-6 h-6" />
                    </a>
                </div>
            </div>
            <div>
                <h4 className="font-semibold mb-2">HUBUNGI KAMI</h4>
                <p>Jl. Bonie Sukasari No. 98, Jakarta</p>
                <p>support@tananetworks1.com</p>
                <p>62 813-5266-7989</p>
            </div>
            <div>
                <h4 className="font-semibold mb-2">NAVIGASI CEPAT</h4>
                <span onClick={() => navigate('/')} className="block hover:underline cursor-pointer">Home</span>
                <span onClick={() => navigate('/community')} className="block hover:underline cursor-pointer">Community</span>
                <span onClick={() => navigate('/contact')} className="block hover:underline cursor-pointer">Kontak</span>
            </div>
            </div>
            <div className="border-t border-gray-700 pt-4 text-center">
            © 2021 - Eduflex. Designed by Templatecookie. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;