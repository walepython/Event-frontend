import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

function EventList() {
  const [ongoing, setOngoing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(" https://advance-django-event.onrender.com/api/eventApi/");
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
      {/* Ongoing Events */}
      {ongoing.length > 0 && (
        <>
          <h2 className="mb-3 text-primary">Ongoing Events</h2>
          <div className="row mb-5">
            {ongoing.map((event) => (
              <div className="col-md-4" key={event.id}>
                <div className="card mb-4 shadow-sm h-100 border border-primary">
                  {event.image && (
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
                      {event.date
                        ? new Date(event.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                    <p>
                      <b>Venue: </b>
                      {event.venue?.name || "N/A"}
                    </p>
                    {/* FIXED: Display time directly as string */}
                    <p className="text-muted">
                      <strong>Time:</strong> {event.start_time} - {event.end_time}
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

      {/* Upcoming Events */}
      <h2 className="mb-3 mt-8 text-success alert">Upcoming Events</h2>
      <h3 className="mb-3 h3 text-success alert">
        Where moments turn into memories
      </h3>
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
                    {event.date
                      ? new Date(event.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                  <p>
                    <b>Venue: </b>
                    {event.venue?.name || "N/A"}
                  </p>
                  {/* FIXED: Display time as string, not Date object */}
                  <p className="text-muted">
                    <strong>Time:</strong> {event.start_time} - {event.end_time}
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
            <div className="alert alert-info">
              No upcoming events available right now.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventList;
