import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function EventList() {
  const [events, setEvents] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
  fetch(" https://advance-django-event.onrender.com/api/eventApi2/")
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("API Response Type:", typeof data);
      console.log("Is Array?", Array.isArray(data));
      console.log("Full Response:", data);
      
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        // Try to extract array from response
        const eventsArray = data.results || data.events || data.items || [];
        if (Array.isArray(eventsArray)) {
          setEvents(eventsArray);
        } else {
          console.error("Could not extract events array from:", data);
          setEvents([]);
        }
      }
    })
    .catch(error => {
      console.error("Error fetching events:", error);
      setEvents([]);
    });
}, []);
  console.log("EVENTS STATE:", events);

  return (
    <div className="event-list" style={{ display: "flex", gap: "50px", flexWrap:"wrap" }}>
      {events.map((event) => (
        <div
          key={event.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            width: "300px",
            padding: "10px",
          }}
        >
          {event.image && (
            <img
              // src={`http://127.0.0.1:8000${event.image}`}
              src={event.image}
              alt={event.title}
              style={{ width: "100%", borderRadius: "10px" }}
            />
          )}
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <p>
            <b>Date:</b>{" "}
             {event.date ?  new Date(event.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",  
        day: "numeric",
      }) : "N/A"}
          </p>
          <button onClick={() => navigate(`/events/${event.id}`)} 
           style={{ background: "green", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px" }}>
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}

export default EventList;
