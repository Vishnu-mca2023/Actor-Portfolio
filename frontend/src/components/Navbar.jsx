import React, { useState, useEffect } from "react";

const Navbar = ({ logoUrl, logoType }) => {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const links = [
    { name: "Home", href: "#landing" },
    { name: "About Us", href: "#about" },
    { name: "Blogs", href: "#userdashboard" },
    { name: "Contact Us", href: "#contact" },
  ];

  // ✅ Hide navbar on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full"
      } bg-transparent backdrop-blur-sm`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* ✅ Logo Section */}
        <div className="flex items-center gap-3">
          {logoUrl ? (
            logoType?.startsWith("video") ? (
              <video
                src={logoUrl}
                autoPlay
                loop
                muted
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-12 h-12 rounded-full object-cover"
              />
            )
          ) : (
            <span className="text-white font-semibold text-lg">Logo</span>
          )}
        </div>

        {/* ✅ Navigation Links */}
        <div className="flex gap-8">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-white font-semibold hover:text-purple-300 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
