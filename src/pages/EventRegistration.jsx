import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const EventRegistrations = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    fetchRegistrations();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/eventApi/${eventId}/`);
      setEvent(response.data);
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/events/${eventId}/registrations/`);
      setRegistrations(response.data);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get(`/events/${eventId}/export/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${eventId}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert("CSV exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const handleCheckIn = async (publicId) => {
    if (window.confirm("Check in this participant?")) {
      try {
        await api.post(`/checkin/${publicId}/`);
        alert("Checked in successfully!");
        fetchRegistrations(); // Refresh
      } catch (error) {
        console.error("Check-in error:", error);
        alert(error.response?.data?.message || "Check-in failed");
      }
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      (reg.student_name || '').toLowerCase().includes(searchLower) ||
      (reg.student_email || '').toLowerCase().includes(searchLower) ||
      (reg.seat_number || '').toLowerCase().includes(searchLower);

    // Status filter
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "checked-in" && reg.is_used) ||
      (filterStatus === "pending" && !reg.is_used);

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    checkedIn: registrations.filter(r => r.is_used).length,
    pending: registrations.filter(r => !r.is_used).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
              >
                <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {event?.title || 'Event'} - Registrations
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage registrations and check-ins for this event
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg border p-6">
            <p className="text-sm text-gray-600">Total Registrations</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <p className="text-sm text-gray-600">Checked In</p>
            <p className="text-3xl font-bold text-green-600">{stats.checkedIn}</p>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or seat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="checked-in">Checked In</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          {filteredRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.registration_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reg.student_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.student_email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded">
                          {reg.seat_number || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          reg.ticket_type === 'vip' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {reg.ticket_type?.toUpperCase() || 'REGULAR'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reg.is_used ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            ✓ Checked In
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {!reg.is_used && (
                          <button
                            onClick={() => handleCheckIn(reg.public_id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Check In
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No registrations found</p>
            </div>
          )}
        </div>

        {filteredRegistrations.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing {filteredRegistrations.length} of {registrations.length} registrations
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistrations;
