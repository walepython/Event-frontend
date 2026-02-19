import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "https://advance-django-event.onrender.com/api";

export default function MediaDetail() {
  const { eventId } = useParams();
  const [media, setMedia] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/mediaApi/${eventId}/`)
      .then((res) => setMedia(res.data))
      .catch(() =>
        setError("Could not load media. Please try again later.")
      );
  }, [eventId]);

  if (error) {
    return (
      <p className="text-center text-red-600 font-semibold mt-10">
        {error}
      </p>
    );
  }

  if (!media) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Loading media...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* HEADER */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">
            {media.caption || "Event Media"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Uploaded on{" "}
            {new Date(media.uploaded_on).toLocaleDateString()}
          </p>
        </div>

        {/* MEDIA DISPLAY */}
        <div className="p-6 flex justify-center bg-black ">

          {/* IMAGE ONLY */}
          {media.file_type === "image" && (
            <img
              src={media.file}
              alt={media.caption || "Event Photo"}
              className="max-h-[60vh] w-[350px] rounded-lg"
            />
          )}

          {/* VIDEO ONLY */}
          {media.file_type === "video" && (
            <video
              controls
              autoPlay
              className="max-h-[70vh] w-[350px] rounded-lg"
            >
              <source src={media.file} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* FOOTER / CAPTION */}
        {media.caption && (
          <div className="p-6 border-t text-center text-gray-700">
            {media.caption}
          </div>
        )}
      </div>
    </div>
  );
}
