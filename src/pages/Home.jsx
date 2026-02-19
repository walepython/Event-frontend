import React, { useEffect, useState } from "react";
import { Link,NavLink } from "react-router-dom";


export default function Home() {
  const [ongoing, setOngoing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/eventApi/");
        const data = await res.json();

        setOngoing(data.ongoing || []);
        setUpcoming(data.upcoming || []);
        setPast(data.past || []);
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="text-center py-5">Loading Events...</div>;

  return (
    <div className="container2 my-5">

      {/* Header */}
     
      <div className="text-center mb-5 hero-section">
        <h1 className="display-4">Welcome to EventSphere</h1>
        <p className="lead">
          Stay updated with ongoing, upcoming, and past events <br/>“Never miss the moments that matter.”
        </p>
        <NavLink to="/events" className="button">explore our event</NavLink>
      </div>
      

      {/* Ongoing Events */}
      {ongoing.length > 0 && (
        <>
          <h2 className="mb-3 text-primary">Ongoing Events</h2>
          <div className="row mb-5">
            {ongoing.map((event) => (
              <div className="col-md-4" key={event.id}>
                <div className="card mb-4 shadow-sm h-100 border border-primary">
                  {event.banner && (
                    <img
                      src={event.image}
                      className="card-img-top"
                      alt={event.title}
                    />
                  )}
                  <div className="card-body d-flex flex-column">
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
          <p><b>venue: </b>{event.venue.name}</p>
                    <p className="text-muted">
                      <strong>Ends:</strong>{" "}
                      {new Date(event.end_datetime).toLocaleString()}
                    </p>
                    <div className="mt-auto">
                      <Link
                        to={`/events/${event.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Join Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upcoming Events */}
      <h2 className="mb-3 text-success alert">Upcoming Events</h2>
      <h3 className="mb-3 h3 text-success alert">Where moments turn into memories</h3>
      <div className="row mb-5 alert card2 g-4">
        {upcoming.length > 0 ? (
          upcoming.map((event) => (
            <div className="col-md-4" key={event.id}>
              <div className="card mb-4 shadow-sm h-100">
                {event.image && (
                  <img
                    src={event.image}
                    className="card-img-top event-img"
                    alt={event.title}
                  />
                )}
                <div className="card-body d-flex flex-column">
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
          <p><b>venue: </b>{event.venue.name}</p>
                  <p className="text-muted">
                    <strong>Starts:</strong>{" "}
                    {new Date(`${event.date}T${event.start_time}`).toLocaleString()}
                  </p>
                  <div className="mt-auto">
                    <Link
                      to={`/events/${event.id}`}
                      className="btn btn-success btn-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info ">
              No upcoming events available right now.
            </div>
          </div>
        )}
      </div>

       {/* Past Events */}
       <h2 className="mb-3 text-secondary alert">Past Events</h2>
      <div className="row card2  ">
        {past.length > 0 ? (
          past.map((event) => (
            <div className="event-col " key={event.id}>
              <div className="card shadow-sm h-100">
                {event.image && (
                  <img
                    src={event.image}
                    className="card-img-top event-img"
                    alt={event.title}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title">{event.title}</h6>
                  {/* FIXED: Proper date formatting */}
                  <p className="text-muted">
                    <strong>Date:</strong>{" "}
                    {event.date
                      ? new Date(event.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                  <p className="text-muted">
                    <strong>Venue:</strong> {event.venue?.name || "N/A"}
                  </p>
                  <div className="mt-auto">
                    <Link
                      to={`/events/${event.id}`}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      View Recap
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-12 alert">No past events to show yet.</p>
        )}
      </div>
    </div>
  );
}
