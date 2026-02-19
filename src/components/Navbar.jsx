import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const Logo = () => (
  <NavLink to="/" className="flex items-center space-x-2">
    <span className="text-2xl font-bold tracking-wider text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-md px-1">
      Event
    </span>
    <span className="text-white text-xl font-bold">Sphere</span>
  </NavLink>
);

export default function Navbar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  console.log("Decoded user:", user);

  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      navigate(`/search?query=${searchTerm}`);
      setSearchTerm("");
    }
  };

  // normalize role so "Admin", "admin" etc. all work
  const role = user?.role?.toLowerCase();

  return (
    <nav className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6 text-white font-medium">

            <NavLink to="/" className="hover:text-blue-400">Home</NavLink>
            <NavLink to="/events" className="hover:text-blue-400">Events</NavLink>
            <NavLink to="/gallery" className="hover:text-blue-400">Gallery</NavLink>
            <NavLink to="/about" className="hover:text-blue-400">About</NavLink>
            <NavLink to="/contact" className="hover:text-blue-400">Contact Us</NavLink>

            {/* Admin */}
            {role === "admin" && (
              <>
                <NavLink to="/admin-board" className="hover:text-blue-400">Admin</NavLink>
                {/* <NavLink to="/my-registrations" className="hover:text-blue-400">My Registrations</NavLink> */}
                <NavLink to="/dashboard" className="hover:text-blue-400">Dashboard</NavLink>
                <NavLink to="/scanpage" className="hover:text-blue-400">Scanpage</NavLink>
                {/* <NavLink to="/feedback" className="hover:text-blue-400">Feedback</NavLink> */}
              </>
            )}

            {/* Organizer */}
            {role === "organizer" && (
              <>
                <NavLink to="/organizer-board" className="hover:text-blue-400">Organizer</NavLink>
                {/* <NavLink to="/my-registrations" className="hover:text-blue-400">My Registrations</NavLink> */}
                <NavLink to="/dashboard" className="hover:text-blue-400">Dashboard</NavLink>
                <NavLink to="/scanpage" className="hover:text-blue-400">Scanpage</NavLink>
                {/* <NavLink to="/feedback" className="hover:text-blue-400">Feedback</NavLink> */}
              </>
            )}

            {/* Participant */}
            {role === "participant" && (
              <>
                <NavLink to="/my-registrations" className="hover:text-blue-400">My Registrations</NavLink>
                <NavLink to="/dashboard" className="hover:text-blue-400">Dashboard</NavLink>
                {/* <NavLink to="/feedback" className="hover:text-blue-400">Feedback</NavLink> */}
              </>
            )}
          </div>

          {/* Right Section: Search + Auth */}
          <div className="flex items-center space-x-4">
            {/* <div className="flex items-center bg-slate-800 rounded-md px-2">
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-white px-2 py-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <FiSearch onClick={handleSearch} className="text-gray-400 cursor-pointer" />
            </div> */}

            {user ? (
              <>
                <span className="text-white">Hi {user.username}</span>
                <button
                  onClick={logout}
                  className="text-red-400 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="hover:text-blue-400">Login</NavLink>
                <NavLink to="/register" className="hover:text-blue-400">Signup</NavLink>
              </>
            )}

            {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-white fs-1 focus:outline-none"
                >
                  {isOpen ? "✖" : "☰"}
                </button>
              </div>

          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 px-4 py-4 space-y-3 text-white">
          <NavLink to="/" className="block">Home</NavLink>
          <NavLink to="/events" className="block">Events</NavLink>
          <NavLink to="/gallery" className="block">Gallery</NavLink>
          <NavLink to="/about" className="block">About</NavLink>
          <NavLink to="/contact" className="block">Contact Us</NavLink>

          {user ? (
            <>
              <span className="block">Hi {user.username}</span>
              <button onClick={logout} className="block text-red-400">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="block">Login</NavLink>
              <NavLink to="/register" className="block">Signup</NavLink>
            </>
          )}
        </div>
      )}


    </nav>
     );
}
