import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminUser from "./pages/admin/AdminUser";
import RouteGuard from "./utils/RouteGuard";
import AdminRegister from './pages/admin/AdminRegistration';
import Payment from "./pages/payment";
import Home from "./pages/HomePage";
import ContactSection from "./pages/Contact";
import CommunityPage from "./pages/Community";
import PostDetailPage from "./pages/PostDetails";
import VideoLibrary from "./pages/Skills";
import AccountSettingsPage from "./pages/Profile";
import AdminCommunity from "./pages/admin/AdminCommunity";


export default function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactSection />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/:postId" element={<PostDetailPage />} />
        <Route path="/skills" element={<VideoLibrary />} />
        <Route path="/profile" element={<AccountSettingsPage />} />
        <Route
          path="/payment"
          element={
            <RouteGuard allowedRole="user" redirectPath="/">
              <Payment/>
            </RouteGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <RouteGuard allowedRole="admin" redirectPath="/">
              <AdminDashboard />
            </RouteGuard>
          }
        />
        <Route
          path="/adminVideos"
          element={
            <RouteGuard allowedRole="admin" redirectPath="/">
              <AdminVideos />
            </RouteGuard>
          }
        />
        <Route
          path="/adminUsers"
          element={
            <RouteGuard allowedRole="admin" redirectPath="/">
              <AdminUser />
            </RouteGuard>
          }
        />
        <Route
          path="/adminRegister"
          element={
            <RouteGuard allowedRole="admin" redirectPath="/">
              <AdminRegister />
            </RouteGuard>
          }
        />
        <Route
          path="/adminCommunity"
          element={
            <RouteGuard allowedRole="admin" redirectPath="/">
              <AdminCommunity />
            </RouteGuard>
          }
        />
      </Routes>
    </Router>
  );
}