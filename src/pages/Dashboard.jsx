import React, { useEffect, useState } from "react";
import axiosInstance from "../context/axiosInstance";
import axios from "axios";

export default function Dashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [userRes, regRes, certRes] = await Promise.all([
          axiosInstance.get("/user/"),               // user profile
          axiosInstance.get("/my-registrations/"),   // my events
          axiosInstance.get("/my-certificates/"),    // my certificates
        ]);

        // Handle both array and paginated results
        const regData = Array.isArray(regRes.data)
          ? regRes.data
          : regRes.data.results || [];

        const certData = Array.isArray(certRes.data)
          ? certRes.data
          : certRes.data.results || [];

        setUser(userRes.data);
        setRegistrations(regData);
        setCertificates(certData);

        console.log("✅ Registrations:", regData);
        console.log("✅ Certificates:", certData);

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const formatEventDateTime = (date, time) => {
    if (!date || !time) return "Date not set";
  
    const isoString = `${date}T${time}`;
    const parsedDate = new Date(isoString);
  
    return isNaN(parsedDate.getTime())
      ? "Invalid Date"
      : parsedDate.toLocaleString();
  };
  

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }
  const handleCancel = async (id) => {
    try {
      const res = await axiosInstance.delete(`/eventApi/${id}/cancel/`);
  
      if (res.status === 200) {
        setRegistrations((prev) =>
          prev.filter((reg) => reg.event.id !== id)
        );
        setMessage("Registration cancelled.");
      } else {
        setMessage("Cancellation failed.");
      }
    } catch (err) {
      setMessage("Something went wrong with cancellation.");
    }
  };
  

  return (
    <div className="container mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-6">
        Welcome, {user?.full_name || user?.username}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My Events */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h4 className="text-lg font-semibold mb-4">My Upcoming Events</h4>
          {registrations.length > 0 ? (
            <ul className="space-y-4">
              {registrations.map((reg) => (
                <li
                  key={reg.event.id}
                  className="flex justify-between items-center border p-3 rounded-lg"
                >
                  <div>
                    <strong className="block">{reg.event.title}</strong>
                    <small className="text-gray-600">
                      {formatEventDateTime(reg.event.date, reg.event.start_time)}
                      {reg.event.end_time && (
                        <> {" – "} {formatEventDateTime(reg.event.date, reg.event.end_time)} </>
                      )}
                    </small>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/events/${reg.event.id}`}
                      className="px-3 py-1 text-sm rounded-lg border border-green-500 text-green-600 hover:bg-green-50"
                    >
                      View
                    </a>
                    <button
                    onClick={() => handleCancel(reg.event.id)}
                    className="px-3 py-1 text-sm rounded-lg border border-red-500 text-red-600 hover:bg-red-50"
                  >
                    Cancel
                  </button>

                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No upcoming events.</p>
          )}
        </div>

        {/* My Certificates */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h4 className="text-lg font-semibold mb-4">My Certificates</h4>
          {certificates.length > 0 ? (
            <ul className="space-y-4">
              {certificates.map((cert) => (
                <li
                  key={cert.id}
                  className="flex justify-between items-center border p-3 rounded-lg"
                >
                  <div>
                    <strong>{cert.event.title}</strong>
                  </div>
                  <a
                    href={cert.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No certificates yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
