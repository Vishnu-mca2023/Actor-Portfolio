import React, { useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus,
  Image,
  Video,
  Phone,
  Home,
  LogOut,
  Menu,
  X,
  UserPlus,
} from "lucide-react";

import DashboardHome from "./DashboardHome";
import AddPost from "./AddPost";
import MediaGallery from "./MediaGallery";
import LandingVideo from "./LandingVideo";
import ContactInfo from "./ContactInfo";
import LandingLogo from "./LandingLogo";
import AddUser from "./AddUser";
import Themes from "./Themes"; // New Themes Component

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [draftCallback, setDraftCallback] = useState(null);
  const [role, setRole] = useState("");
  const [tabs, setTabs] = useState([]);
  const navigate = useNavigate();

  // Verify JWT and extract role
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/admin-login");

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const username = payload.username || "";
      setRole(username === "admin" ? "main" : "admin");
    } catch {
      navigate("/admin-login");
    }
  }, [navigate]);

  // Tabs based on role
  useEffect(() => {
    const baseTabs = [
      { id: "home", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
      { id: "landingVideo", label: "Page Settings", icon: <Video size={20} /> },
      { id: "addpost", label: "Add Post", icon: <FilePlus size={20} /> },
      { id: "media", label: "Media Gallery", icon: <Image size={20} /> },
      { id: "contact", label: "Contacts", icon: <Phone size={20} /> },
      { id: "landingLogo", label: "Site Logo", icon: <Image size={20} /> },
      { id: "themes", label: "Themes", icon: <Image size={20} /> }, // New Themes Tab
    ];
    if (role === "main")
      baseTabs.push({ id: "adduser", label: "Add User", icon: <UserPlus size={20} /> });
    setTabs(baseTabs);
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  const handleTabClick = (tabId) => {
    if (blocking && draftCallback) draftCallback();
    else setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const goToHomeScreen = () => navigate("/");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Mobile Top Navbar */}
      <header className="flex items-center justify-between bg-gray-900 text-white p-4 md:hidden shadow-md fixed w-full z-50">
        <h1 className="text-lg font-bold">Admin Panel</h1>
        <button
          className="p-2 rounded-md hover:bg-gray-800 transition"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto bg-gray-900 text-white shadow-xl transform transition-transform duration-300 z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-64 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="hidden md:block text-2xl font-bold p-6 border-b border-gray-700">
          Admin Panel
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-y-auto mt-2 md:mt-4 pb-4 flex flex-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-3 w-full px-6 py-3 text-left text-sm sm:text-base transition rounded-lg mb-1
                ${activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg text-white"
                  : "text-gray-300 hover:bg-gray-800"
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}

          {/* Divider after Add User */}
          {role === "main" && <hr className="border-gray-600 my-2 mx-6" />}

          {/* Bottom Buttons */}
          <div className="flex flex-col gap-3 px-6 mt-2">
            <button
              onClick={() => { goToHomeScreen(); setSidebarOpen(false); }}
              className="flex items-center gap-2 px-4 py-2 w-full bg-gray-800 hover:bg-gray-700 rounded-lg transition text-sm sm:text-base"
            >
              <Home size={18} /> Go to Home
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 w-full bg-red-600 hover:bg-red-500 rounded-lg transition text-sm sm:text-base"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 h-full overflow-auto pt-16 md:pt-0 relative z-10">
        <div className="w-full h-full">
          {activeTab === "home" && <DashboardHome />}
          {activeTab === "addpost" && <AddPost setBlocking={setBlocking} setDraftCallback={setDraftCallback} />}
          {activeTab === "media" && <MediaGallery />}
          {activeTab === "landingVideo" && <LandingVideo />}
          {activeTab === "contact" && <ContactInfo />}
          {activeTab === "landingLogo" && <LandingLogo />}
          {activeTab === "adduser" && <AddUser />}
          {activeTab === "themes" && <Themes />} {/* Themes Tab Content */}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
