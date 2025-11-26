import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";

import LandingPage from "./pages/LandingPage";
import AboutMe from "./pages/AboutMe";
import Contact from "./pages/Contact";
import Footer from "./pages/Footer";
import Header from "./components/Header";
import ScrollToTop from "./ScrollToTop";

import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AddPost from "./admin/AddPost";

import Blogs from "./pages/Blogs";
import AllBlogsPage from "./pages/AllBlogsPage";
import BlogDetails from "./pages/BlogDetail";

// ⭐ Import global Theme Provider
import { ThemeProvider } from "./pages/ThemeContext";

// ========================
// Layout Wrapper
// ========================
function LayoutWrapper({ children }) {
  const location = useLocation();
  const hideOnRoutes = ["/admin-login", "/admin-dashboard", "/add-post"];
  const shouldHide = hideOnRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {!shouldHide && <Header />}
      <main className="m-0 p-0 overflow-x-hidden">{children}</main>
      {!shouldHide && <Footer />}
    </>
  );
}

function App() {
  const [adminToken, setAdminToken] = useState(
    localStorage.getItem("adminToken") || ""
  );
  const [adminUsername, setAdminUsername] = useState("");

  // 🔐 Decode JWT
  useEffect(() => {
    if (adminToken) {
      localStorage.setItem("adminToken", adminToken);
      try {
        const payload = JSON.parse(atob(adminToken.split(".")[1]));
        setAdminUsername(payload.username || "");
      } catch (err) {
        console.error("Invalid token");
        setAdminUsername("");
      }
    } else {
      localStorage.removeItem("adminToken");
      setAdminUsername("");
    }
  }, [adminToken]);

  // 🔐 Protect Admin Routes
  const AdminProtected = ({ children }) =>
    !adminToken ? <Navigate to="/admin-login" replace /> : children;

  return (
    // ⭐ Wrap entire website in ThemeProvider
    <ThemeProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <ScrollToTop />

        <LayoutWrapper>
          <Routes>
            {/* Home sections */}
            <Route
              path="/"
              element={
                <div className="w-full overflow-x-hidden relative bg-gray-50">
                  <section id="landing" className="w-full min-h-screen">
                    <LandingPage />
                  </section>
                  <section id="about" className="w-full min-h-screen">
                    <AboutMe />
                  </section>
                  <section id="blogs" className="w-full min-h-screen">
                    <Blogs />
                  </section>
                  <section id="contact" className="w-full min-h-screen">
                    <Contact />
                  </section>
                </div>
              }
            />

            {/* Blogs */}
            <Route path="/all-blogs" element={<AllBlogsPage />} />
            <Route path="/blog/:id" element={<BlogDetails />} />

            {/* Admin */}
            <Route
              path="/admin-login"
              element={<AdminLogin setToken={setAdminToken} />}
            />

            <Route
              path="/admin-dashboard/*"
              element={
                <AdminProtected>
                  <AdminDashboard
                    setToken={setAdminToken}
                    adminUsername={adminUsername}
                  />
                </AdminProtected>
              }
            />

            <Route
              path="/add-post"
              element={
                <AdminProtected>
                  <AddPost />
                </AdminProtected>
              }
            />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="text-center mt-20 text-xl text-red-500">
                  404 | Page Not Found
                </div>
              }
            />
          </Routes>
        </LayoutWrapper>
      </Router>
    </ThemeProvider>
  );
}

export default App;
