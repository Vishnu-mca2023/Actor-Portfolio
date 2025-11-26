
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Mail, Phone, Home } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ContactUs = () => {
  const [contact, setContact] = useState({ address: "", phone: "", email: "" });
  const [scrollDirection, setScrollDirection] = useState("down");
  const lastScrollY = useRef(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Detect scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollDirection(currentScrollY > lastScrollY.current ? "down" : "up");
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch contact info
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/contact");
        setContact(res.data.contact || res.data);
      } catch (err) {
        console.error("Error fetching contact info:", err);
      }
    };
    fetchContact();

    AOS.init({ duration: 1000, once: false });
    AOS.refresh();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("All fields are required!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/contact/message", {
        name,
        email,
        message,
      });
      if (res.data.success) {
        toast.success("Message sent successfully!");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        toast.error("Failed to send message");
      }
    } catch (err) {
      console.error("Error submitting message:", err);
      toast.error("Server error, please try again later");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-gray-100 flex flex-col items-center p-6">
      <ToastContainer position="top-right" />

      {/* Heading */}
      <h1
        className="text-5xl font-extrabold text-white mb-4 text-center"
        data-aos={scrollDirection === "down" ? "flip-down" : "flip-up"}
      >
        Contact Us
      </h1>

      <p
        className="text-gray-300 text-center max-w-xl mb-12"
        data-aos={scrollDirection === "down" ? "flip-down" : "flip-up"}
        data-aos-delay="100"
      >
        We’d love to hear from you. Whether you have a question, a project idea, or just want to say hello — feel free to reach out.
      </p>

      {/* Main Container */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-stretch gap-10">
        
        {/* LEFT SIDE CONTACT INFO */}
        <div
          className="md:w-1/2 bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-xl shadow-xl min-h-[450px] flex flex-col justify-center space-y-8"
          data-aos={scrollDirection === "down" ? "flip-left" : "flip-right"}
        >
          <ContactItem
            icon={Home}
            title="Address"
            detail={contact.address}
          />

          {/* 📞 Phone Click → Dialer */}
          <ContactItem
            icon={Phone}
            title="Phone"
            detail={contact.phone}
            clickable={true}
            onClick={() => window.open(`tel:${contact.phone}`, "_self")}
          />

          {/* ✉️ Email Click → Gmail Compose */}
          <ContactItem
            icon={Mail}
            title="Email"
            detail={contact.email}
            clickable={true}
            onClick={() =>
              window.open(
                `https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}`,
                "_blank"
              )
            }
          />
        </div>

        {/* RIGHT SIDE FORM */}
        <div
          className="md:w-1/2 bg-white/20 backdrop-blur-xl border border-white/30 p-8 rounded-xl shadow-2xl min-h-[450px] flex flex-col justify-center animate-pop"
          data-aos={scrollDirection === "down" ? "flip-right" : "flip-left"}
          data-aos-delay="150"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Send Message</h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="border-b border-white/40 focus-within:border-purple-400 transition">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-transparent text-white py-2 focus:outline-none placeholder-gray-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="border-b border-white/40 focus-within:border-purple-400 transition">
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-transparent text-white py-2 focus:outline-none placeholder-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="border-b border-white/40 focus-within:border-purple-400 transition">
              <textarea
                placeholder="Type your message..."
                className="w-full bg-transparent text-white py-2 focus:outline-none resize-none placeholder-gray-300"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md transition transform hover:scale-[1.02] shadow-lg"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ⭐ CONTACT ITEM — UPDATED WITH CLICK FUNCTION */
const ContactItem = ({ icon: Icon, title, detail, clickable, onClick }) => (
  <div
    className={`flex items-start space-x-4 ${clickable ? "cursor-pointer" : ""}`}
    onClick={clickable ? onClick : undefined}
  >
    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h3 className="text-xl font-bold text-purple-300">{title}</h3>
      <p className="text-gray-200 hover:text-purple-400">
        {detail}
      </p>
    </div>
  </div>
);

export default ContactUs;
