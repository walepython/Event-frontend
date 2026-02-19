import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import { useAuth } from "@/context/AuthContext"; 

// Components
import Navbar from "./components/Navbar";
import MediaDetail from "./components/MediaDetail";
import EventDetail from "./components/EventDetails";
import Registrations from "./pages/Registrations.jsx";
import RequireRole from "./components/RequireRole";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Scanpage from "./pages/Scanpage";
import Contact from "./pages/Contact";
import Footer from "./pages/Footer";
import MediaGallery from "./pages/MediaGallery";
import Feedback from "@/pages/FeedBack";
import Login from "./pages/Login";
import Register from "@/pages/Register";

// Protected Pages
import Dashboard from "@/pages/Dashboard";
import AdminBoard from "@/pages/AdminBoard";
import MyRegistrations from "@/pages/MyRegistration";
import OrganizerBoard from "@/pages/OrganizerBoard";
import EventRegistrations from '@/pages/EventRegistration';
import CreateEvent from '@/pages/CreateEvent';
import EditEvent from '@/pages/EditEvent';

// Route Protection
import { RoleRoute } from "@/context/ProtectRoutes"; 

function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main className="App">
        <Routes>
          
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<MediaGallery />} />
          <Route path="/media/:eventId" element={<MediaDetail />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/scanpage" element={<Scanpage />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* --- AUTHENTICATION --- */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
         
          {/* --- GENERIC PROTECTED ROUTES (for any logged-in user) --- */}
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/feedback/:eventId" 
            element={user ? <Feedback /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/feedback" 
            element={user ? <Feedback /> : <Navigate to="/login" replace />} 
          />

          <Route
            path="/edit-event/:eventId"
            element={
              <RoleRoute roles={['organizer', 'admin']}>
                <EditEvent />
              </RoleRoute>
            }
          />
          
          {/* --- ADMIN ROUTES --- */}
          <Route
            path="/admin-board"
            element={
              <RoleRoute roles={['admin']}>
                <AdminBoard />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/registrations"
            element={
              <RequireRole user={user} roles={["admin", "organizer"]}>
                <Registrations />
              </RequireRole>
            }
          />

          {/* --- ORGANIZER ROUTES --- */}
          <Route
            path="/organizer-board"
            element={
              <RoleRoute roles={['organizer', 'admin']}>
                <OrganizerBoard />
              </RoleRoute>
            }
          />
          
          <Route
            path="/create-event"
            element={
              <RoleRoute roles={['organizer', 'admin']}>
                <CreateEvent />
              </RoleRoute>
            }
          />
          
          <Route
            path="/event/:eventId/registrations"
            element={
              <RoleRoute roles={['organizer', 'admin']}>
                <EventRegistrations />
              </RoleRoute>
            }
          />
          
         
       
        </Routes>
      </main>
      <Footer/>
    </>
  );
}

export default App;
