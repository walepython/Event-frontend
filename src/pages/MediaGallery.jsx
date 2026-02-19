import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react"; // optional icon (install lucide-react)

const API_BASE_URL = " https://advance-django-event.onrender.com/api";

const categories = [
  "All Events",
  "Academic",
  "Cultural",
  "Technical",
  "Sports",
  "Workshop",
  "Social",
];

export default function MediaGallery() {
  const [mediaItems, setMediaItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All Events");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/mediaApi/`)
      .then((res) => setMediaItems(res.data))
      .catch(console.error);
  }, []);

  const filteredMedia =
    activeCategory === "All Events"
      ? mediaItems
      : mediaItems.filter(
          (item) =>
            item.category?.toLowerCase() === activeCategory.toLowerCase()
        );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">

      {/* HERO SECTION */}
      <div className="bg-blue-50 py-14 mb-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <Camera className="text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Event Gallery
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto">
            Relive the best moments from our college events. Browse through
            photos capturing the spirit, excitement, and achievements of our
            vibrant campus community.
          </p>

          {/* FILTER PILLS */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition
                  ${
                    activeCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-blue-100"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GALLERY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {mediaItems.map((item) => (
          <div
            key={item.media_id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition  overflow-hidden"
            // onClick={() => navigate(`/media/${item.media_id}`)}
          >
            {/* MEDIA PREVIEW */}
            {item.file_type === "image" && (
              <img
                src={item.file}
                alt={item.caption || "Media"}
                className="w-full h-52 object-cover"
              />
            )}

            {item.file_type === "video" && (
              <video className="w-full h-52 object-cover" muted>
                <source src={item.file} type="video/mp4" />
              </video>
            )}

            {/* CARD CONTENT */}
            <div className="p-4 text-center">
              <h3 className="font-semibold text-gray-800 mb-1">
                {item.caption || "Untitled Media"}
              </h3>

              <p className="text-sm text-gray-500 mb-3">
                {new Date(item.uploaded_on).toLocaleDateString()}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/media/${item.media_id}`);
                }}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View in full
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {mediaItems.length === 0 && (
        <p className="text-center text-gray-500 mt-16">
          No media available yet.
        </p>
      )}
    </div>
  );
}
