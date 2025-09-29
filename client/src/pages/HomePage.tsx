import React, { useEffect } from "react";
import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button2";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MiniNavbar from "../components/miniNavbart";
import { useNavigate } from "react-router-dom";
import { validateToken } from "../utils/ValidateToken";
const Home = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const checkToken = async () => {
        const isValid = await validateToken();
        if (!isValid) {
            localStorage.removeItem("jwt_auth");
            localStorage.removeItem("refreshToken");
            navigate('/login');
        }
    };
    checkToken();
  },[navigate]);
  return (
    <div className="bg-[#121212] text-white font-sans">

      <MiniNavbar></MiniNavbar>
      <Navbar message="Belum punya Akun?" buttonMessage="Daftar Sekarang" route={"/signup"} />

      {/* Hero Section */}
      <div className="bg-white flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="max-w-xl text-center lg:text-left pl-40">
            <h1 className="text-4xl font-bold leading-tight text-black">
            Belajar dari Para <br /> Pebisnis Profesional
            </h1>
            <p className="mt-4 text-gray-700">
            Tingkatkan keterampilan bisnis Anda dengan materi eksklusif dari pebisnis profesional & investor berpengalaman!
            </p>
            <Button className="mt-6 bg-orange-500 hover:bg-orange-600 text-white">
            Kontak Kami
            </Button>
        </div>
        <div className="w-full max-w-2xl lg:self-stretch lg:rounded-none">
            <img
              src="src/assets/heroImages.png"
              alt="Hero"
              className="w-full h-full object-cover rounded-lg lg:rounded-none"
              style={{ objectPosition: "center" }}
            />
        </div>
    </div>

      {/* Why Us Section */}
        <div className="bg-[#1A1535] text-white">
        <div className="grid grid-cols-4 gap-8 pl-40 py-20">
            <div>
                <h2 className="text-xl font-semibold mb-2">Mengapa Kami Yang Terbaik</h2>
                <p className="text-gray-300 mb-8 max-w-lg">
                    Kesempatan menghubungkan bisnis Anda dengan investor.
                </p>
            </div>
            <div>
              <img src="src/assets/icons/community-icon.png" alt="Komunitas Pebisnis" className="w-20 h-20 mb-4" />
              <h3 className="font-semibold mb-3">Komunitas Pebisnis</h3>
              <div className="break-words max-w-[350px]">
                <p className="mb-4">Berinteraksi dengan para pengusaha</p>
              </div>
            </div>
            <div>
                <img src="src/assets/icons/video-icon.png" alt="Komunitas Pebisnis" className="w-20 h-20 mb-2" />
                <h3 className="font-semibold mb-3">Video Bisnis Premium</h3>
                <div className="break-words max-w-[350px]">
                  <p className="mb-4">Belajar langsung dari pebisnis sukses melalui video</p>
                </div>
                </div>
            <div>
                <img src="src/assets/icons/mentoring-icon.png" alt="Komunitas Pebisnis" className="w-20 h-20 mb-2" />
                <h3 className="font-semibold mb-3">Mentoring Ahli</h3>
                <div className="break-words max-w-[350px]">
                  <p className="mb-4">Konsultasi langsung dengan mentor bisnis</p>

                </div>
            </div>
        </div>
        </div>


      {/* Skill Terbaru Section */}
      <div className="bg-[#F9FBFC] text-black px-40 py-20">
        <h2 className="text-2xl font-bold mb-8">Skill Terbaru</h2>
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((_, idx) => (
            <Card key={idx} className="overflow-hidden">
              <div className="relative">
                <img src="/src/assets/videoTemplate.png" alt="Skill" className="w-full" />
              </div>
              <CardContent>
                <div className="text-xs text-red-500 font-semibold mb-1">45 MENIT · 1 Minggu lalu</div>
                <p className="text-sm font-medium">
                  Strategi Meningkatkan Omzet Bisnis dengan Digital Marketing
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-[#F9FAFB] text-black flex justify-center items-center min-h-screen ">
          <section className="bg-white px-10 py-20 rounded-lg shadow-md">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left Section */}
              <div className="text-center md:text-left">
                <p className="uppercase text-sm text-gray-500 tracking-widest mb-2">Testimonial</p>
                <h2 className="text-3xl md:text-4xl font-bold text-orange-500 mb-4">Apa Kata Mereka?</h2>
                <p className="text-gray-700 mb-8">
                  Bersama kami, ribuan pebisnis telah mendapatkan ilmu, jaringan, dan peluang investasi untuk
                  mengembangkan usaha mereka.
                </p>
                <div className="flex justify-center md:justify-start">
                  <button className="flex items-center gap-3 border border-orange-400 text-orange-500 px-6 py-3 rounded-full hover:bg-orange-50 transition">
                    Tuliskan penilaian Anda
                    <span className="w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center">
                      →
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Section */}
              <div className="relative">
                <div className="rounded-2xl overflow-hidden w-full max-w-sm mx-auto">
                  <img
                    src="src/assets/testimonial.png"
                    alt="Sinta Sansitika"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="absolute left-60 right-0 -bottom-12 mx-auto w-[90%] bg-white shadow-xl p-6 rounded-2xl border-l-4 border-orange-400">
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                    Saya memulai startup saya dengan modal kecil dan kesulitan mencari investor. Setelah mengikuti video
                    kursus tentang pitching ke investor dan berpartisipasi di komunitas, saya akhirnya berhasil.
                  </p>
                  <p className="font-semibold text-sm text-gray-800">Sinta Sansitika</p>
                </div>
              </div>
            </div>
          </section>
        </div>




      {/* Footer */}
      <Footer></Footer>
    </div>
  );
};

export default Home;
