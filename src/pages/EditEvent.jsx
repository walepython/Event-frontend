import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const EditEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams(); // Get event ID from URL
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const [venues, setVenues] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    start_time: "",
    end_time: "",
    venue: "",
    max_participants: "",
    gate_fees: "",
    gate_fees2: "",
    image: null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchVenues();
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    setFetchingEvent(true);
    try {
      const response = await api.get(`/eventApi/${eventId}/`);
      const event = response.data;
      
      // Populate form with existing event data
      setFormData({
        title: event.title || "",
        description: event.description || "",
        category: event.category || "",
        date: event.date || "",
        start_time: event.start_time || "",
        end_time: event.end_time || "",
        venue: event.venue?.id || "",
        max_participants: event.max_participants || "",
        gate_fees: event.gate_fees || "",
        gate_fees2: event.gate_fees2 || "",
        image: null, // Don't set existing image as file
      });
      
      // Set image preview if event has an image
      if (event.image) {
        setImagePreview(event.image);
      }
      
    } catch (error) {
      console.error("Error fetching event:", error);
      alert("Failed to load event data");
      navigate("/organizer-board");
    } finally {
      setFetchingEvent(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await api.get("/venues/");
      setVenues(response.data);
    } catch (error) {
      console.error("Error fetching venues:", error);
      setVenues([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Event description is required";
    }

    if (!formData.date) {
      newErrors.date = "Event date is required";
    }

    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
    }

    if (!formData.end_time) {
      newErrors.end_time = "End time is required";
    }

    if (formData.start_time && formData.end_time) {
      if (formData.end_time <= formData.start_time) {
        newErrors.end_time = "End time must be after start time";
      }
    }

    if (formData.max_participants && formData.max_participants < 0) {
      newErrors.max_participants = "Max participants cannot be negative";
    }

    if (formData.gate_fees && formData.gate_fees < 0) {
      newErrors.gate_fees = "Regular ticket price cannot be negative";
    }

    if (formData.gate_fees2 && formData.gate_fees2 < 0) {
      newErrors.gate_fees2 = "VIP ticket price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted for UPDATE!');

    if (!validateForm()) {
      console.log('Validation failed:', errors);
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add all form fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('date', formData.date);
      submitData.append('start_time', formData.start_time);
      submitData.append('end_time', formData.end_time);
      
      if (formData.category) {
        submitData.append('category', formData.category);
      }
      
      if (formData.venue) {
        submitData.append('venue', formData.venue);
      }
      
      if (formData.max_participants) {
        submitData.append('max_participants', formData.max_participants);
      }
      
      if (formData.gate_fees) {
        submitData.append('gate_fees', formData.gate_fees);
      }
      
      if (formData.gate_fees2) {
        submitData.append('gate_fees2', formData.gate_fees2);
      }
      
      // Only append image if a new one was selected
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      console.log('Updating event with ID:', eventId);
      
      // Use PUT or PATCH to update
      const response = await api.patch(`/eventApi/${eventId}/`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Success! Response:', response.data);
      alert('Event updated successfully!');
      navigate('/organizer-board');
      
    } catch (error) {
      console.error('===== ERROR DETAILS =====');
      console.error('Full error:', error);
      console.error('Response:', error.response);
      console.error('Response data:', error.response?.data);
      console.error('========================');
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          let errorMsg = 'Validation Errors:\n\n';
          if (typeof data === 'object') {
            Object.entries(data).forEach(([key, value]) => {
              const msg = Array.isArray(value) ? value.join(', ') : value;
              errorMsg += `${key}: ${msg}\n`;
            });
          } else {
            errorMsg += data;
          }
          alert(errorMsg);
          setErrors(data);
        } else if (status === 403) {
          alert('Permission denied. You can only edit your own events.');
        } else {
          alert(`Error ${status}: ${JSON.stringify(data)}`);
        }
      } else {
        alert('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/organizer-board');
    }
  };

  if (fetchingEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/organizer-board')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update your event details below.
          </p>
        </div>

        {/* Form - Same as CreateEvent */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-green-500 focus:border-green-500`}
                  placeholder="e.g., Annual Tech Conference 2025"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select a category</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="webinar">Webinar</option>
                  <option value="meetup">Meetup</option>
                  <option value="training">Training</option>
                  <option value="social">Social Event</option>
                  <option value="competition">Competition</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`block w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-green-500 focus:border-green-500`}
                  placeholder="Describe your event in detail..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Image
                </label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="h-48 w-auto rounded-lg border-2 border-gray-300" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="mt-1">
                    <label 
                      htmlFor="image-upload"
                      className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-green-400 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <span className="font-medium text-green-600 hover:text-green-500">
                            Click to upload new image
                          </span>
                          <span className="pl-1">or drag and drop</span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </label>
                    <input
                      id="image-upload"
                      name="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Date & Time</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-green-500 focus:border-green-500`}
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${errors.start_time ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-green-500 focus:border-green-500`}
                />
                {errors.start_time && <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>}
              </div>

              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${errors.end_time ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-green-500 focus:border-green-500`}
                />
                {errors.end_time && <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>}
              </div>
            </div>
          </div>

          {/* Venue & Capacity Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Venue & Capacity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
                  Venue
                </label>
                <select
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select a venue</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} {venue.capacity && `(Capacity: ${venue.capacity})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Participants
                </label>
                <input
                  type="number"
                  id="max_participants"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleChange}
                  min="0"
                  className={`block w-full px-3 py-2 border ${errors.max_participants ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-green-500 focus:border-green-500`}
                  placeholder="Leave empty for unlimited"
                />
                {errors.max_participants && <p className="mt-1 text-sm text-red-600">{errors.max_participants}</p>}
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="gate_fees" className="block text-sm font-medium text-gray-700 mb-1">
                  Regular Ticket Price (₦)
                </label>
                <input
                  type="number"
                  id="gate_fees"
                  name="gate_fees"
                  value={formData.gate_fees}
                  onChange={handleChange}
                  min="0"
                  className={`block w-full px-3 py-2 border ${errors.gate_fees ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-green-500 focus:border-green-500`}
                  placeholder="0 for free event"
                />
                {errors.gate_fees && <p className="mt-1 text-sm text-red-600">{errors.gate_fees}</p>}
              </div>

              <div>
                <label htmlFor="gate_fees2" className="block text-sm font-medium text-gray-700 mb-1">
                  VIP Ticket Price (₦)
                </label>
                <input
                  type="number"
                  id="gate_fees2"
                  name="gate_fees2"
                  value={formData.gate_fees2}
                  onChange={handleChange}
                  min="0"
                  className={`block w-full px-3 py-2 border ${errors.gate_fees2 ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-green-500 focus:border-green-500`}
                  placeholder="Leave empty if no VIP tickets"
                />
                {errors.gate_fees2 && <p className="mt-1 text-sm text-red-600">{errors.gate_fees2}</p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;
