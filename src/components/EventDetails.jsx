import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import QRScanner from "./QRScanner";


function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [ticketType, setTicketType] = useState("regular");  // ✅ fixed
  const { authTokens } = useAuth();  // ✅ placed separately
  const [message, setMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [qrCode, setQrCode] = useState(null);  // ⬅ ADDED

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(` https://advance-django-event.onrender.com/eventApi/${id}/`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        } else {
          setMessage("Failed to load event details.");
        }
      } catch (err) {
        setMessage("Something went wrong loading the event.");
      }
    };

    fetchEvent();
  }, [id]);

  

  function formatTime(timeString) {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const handleRegister = async () => {
    if (!authTokens?.access) {
      setMessage("You must be logged in to register.");
      return;
    }

    try {
      const res = await fetch(` https://advance-django-event.onrender.com/eventApi/${id}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authTokens.access}`, // ✅ correct token source
        },
        body: JSON.stringify({ ticket_type: ticketType }),
      });
      
      const data = await res.json();

      if (res.ok) {
        setIsRegistered(true);
        setQrCode(data.qr_code_url);    // ⬅ save QR code
        setMessage("Registration successful");
      
        // Refresh event to update available seats
        const updated = await fetch(` https://advance-django-event.onrender.com/eventApi/${id}/`);
        setEvent(await updated.json());
      } else {
        
        setMessage(data.error ||data.detail || "You have been register for this event.");
      }
    } catch (err) {
      setMessage("Something went wrong with registration.");
    }
  };

  const handleCancel = async () => {
    if (!authTokens?.access) {
      setMessage("You must be logged in to cancel.");
      return;
    }
  
    try {
      const res = await fetch(` https://advance-django-event.onrender.com/eventApi/${id}/cancel/`, {
        method: "DELETE",  // ✅ must match backend
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authTokens.access}`,
        },
      });
  
      if (res.ok) {
        setIsRegistered(false);
        setQrCode(null);    
        setMessage("Registration cancelled.");

        const updated = await fetch(` https://advance-django-event.onrender.com/eventApi/${id}/`);
        setEvent(await updated.json());
      } else {
        const data = await res.json();
        setMessage(data.error || "Cancellation failed.");
      }
    } catch (err) {
      setMessage("Something went wrong with cancellation.");
    }
  };
  useEffect(() => {
    const fetchRegistration = async () => {
      if (!authTokens?.access) return;
  
      const res = await fetch(` https://advance-django-event.onrender.com/eventApi/${id}/registration/`, {
        headers: {
          Authorization: `Bearer ${authTokens.access}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.registered) {
          setIsRegistered(true);
          setQrCode(data.qr_code_url);
        }
      }
    };
  
    fetchRegistration();
  }, [id, authTokens]);
  
  
  if (!event) return <p>Loading...</p>;

  return (
    <>
          <div className="event-details-card">
        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            className="event-image"
          />
        )}

        <div className="event-content">
          <h2>{event.title}</h2>

          <p><strong>Description:</strong> {event.description}</p>
          <p><strong>Venue:</strong> {event.venue.name}, {event.venue.address}</p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(event.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <p><strong>Start:</strong> {formatTime(event.start_time)}</p>
          <p><strong>End:</strong> {formatTime(event.end_time)}</p>
          <p><strong>Organizer:</strong> {event.organizer.first_name}</p>

          <div className="ticket-select">
            <label>Choose Ticket:</label>
            <select
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
              className="ticket-dropdown"
            >
              <option value="regular">
                Regular – ${event.gate_fees}
              </option>
              <option value="vip">
                VIP – ${event.gate_fees2}
              </option>
            </select>

          </div>

          {event?.seats_available ? (
            <p><strong>Seats Available:</strong> {event.seats_available}</p>
          ) : (
            <p><strong>Seats Available:</strong> Unlimited / Not specified</p>
          )}

          <div className="event-actions">
            {!isRegistered ? (
              <button onClick={handleRegister} className="btn-primary">
                Register
              </button>
            ) : (
              <>
                <button onClick={handleCancel} className="btn-danger">
                  Cancel Registration
                </button>

                {/* ✅ FEEDBACK BUTTON */}
                <Link
                  to={`/feedback/${event.id}`}
                  className="btn-primary"
                  style={{ marginLeft: "10px" }}
                >
                  Give Feedback
                </Link>
              </>
            )}
          </div>

        </div>
      </div>


      {message && (<p style={{ marginTop: "15px", color: "green" }}>{message}</p>)}
     
      {qrCode && (
        <div style={{ marginTop: "20px",margin:"auto", textAlign: "center",width: "350px" }}>
          <h3 style={{marginTop: "20px",marginBottom: "20px",fontSize:"22px",fontWeight:"700",color:'rgba(5, 119, 249, 0.98)'}}>Your Event Ticket</h3>
          <img
            src={qrCode}
            alt="QR Code"
            style={{ width: "350px", border: "1px solid #ddd", padding: "10px" }}
          />
          <a href={qrCode} download className="btn btn-success">
            Download Ticket
          </a>
        </div>
      )}
     


  </>
  );
}

export default EventDetail;
