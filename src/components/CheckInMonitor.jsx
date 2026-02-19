// src/components/CheckInMonitor.jsx
import { useState, useEffect } from "react";
import api from "../services/api";

const CheckInMonitor = ({ eventId }) => {
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    remaining: 0
  });
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await api.get(`/events/${eventId}/registrations/`);
      const registrations = response.data;
      
      const checkedIn = registrations.filter(r => r.is_used).length;
      setStats({
        total: registrations.length,
        checkedIn,
        remaining: registrations.length - checkedIn
      });
      
      // Get recent check-ins (last 10)
      const recent = registrations
        .filter(r => r.is_used)
        .sort((a, b) => new Date(b.checked_in_at) - new Date(a.checked_in_at))
        .slice(0, 10);
      
      setRecentCheckIns(recent);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Check-in Monitor</h2>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Tickets</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
          <div className="text-sm text-gray-600">Checked In</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.remaining}</div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>Check-in Progress</span>
          <span>{Math.round((stats.checkedIn / stats.total) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-600 h-2.5 rounded-full" 
            style={{ width: `${(stats.checkedIn / stats.total) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Recent Check-ins */}
      <div>
        <h3 className="font-bold mb-2">Recent Check-ins</h3>
        {recentCheckIns.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {recentCheckIns.map((checkin, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{checkin.student_name}</div>
                  <div className="text-xs text-gray-500">
                    Seat: {checkin.seat_number} • {checkin.ticket_type}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(checkin.checked_in_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No check-ins yet</p>
        )}
      </div>
    </div>
  );
};

export default CheckInMonitor;