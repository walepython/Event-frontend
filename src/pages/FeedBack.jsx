import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function FeedBack() {
  const { eventId } = useParams(); // get event id from URL
  const navigate = useNavigate();
  const { authTokens, refreshToken } = useAuth();

  const [event, setEvent] = useState(null);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  console.log("EVENT ID FROM URL:", eventId);
  console.log("ACCESS TOKEN:", authTokens?.access);

  // Fetch event details
  useEffect(() => {
    if (!eventId) return;
    if (!authTokens?.access) {
      setError("You must be logged in to view this event");
      return;
    }

    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/eventApi/${eventId}/`, {
          headers: { Authorization: `Bearer ${authTokens.access}` },
        });
        setEvent(res.data);
      } catch (err) {
        console.error("EVENT FETCH ERROR:", err.response?.data || err.message);
        setError("Failed to load event. Maybe your token is expired.");
      }
    };

    fetchEvent();
  }, [eventId, authTokens]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (!authTokens?.access) {
      setError("You must be logged in to submit feedback");
      setLoading(false);
      return;
    }

    try {
      // Try to submit feedback
      const res = await axios.post(
        `${API_BASE_URL}/api/feedback/`,
        {
          event: Number(eventId),
          rating: Number(rating),
          comments: comment,
        },
        {
          headers: { Authorization: `Bearer ${authTokens.access}` },
        }
      );

      setSuccessMsg("Feedback submitted successfully 🎉");
      navigate(-1);
    } catch (err) {
      // Handle 401 (token expired)
      if (err.response?.status === 401) {
        console.log("Token expired. Trying to refresh...");
        try {
          await refreshToken(); // refresh access token
          handleSubmit(e); // retry after refresh
          return;
        } catch {
          setError("Session expired. Please log in again.");
        }
      }

      // Handle duplicate feedback
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to submit feedback");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!event) return <p>Loading event details...</p>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {event?.title || "Loading event..."}
        </h2>
        <p className="text-gray-500 mb-6">
          We’d love to hear your thoughts about this event.
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {successMsg && <p className="text-green-500 text-sm mb-4">{successMsg}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select rating</option>
              <option value="1">1 – Very Poor</option>
              <option value="2">2 – Poor</option>
              <option value="3">3 – Average</option>
              <option value="4">4 – Good</option>
              <option value="5">5 – Excellent</option>
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
