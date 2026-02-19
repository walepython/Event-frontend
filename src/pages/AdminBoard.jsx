import { useEffect, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import api from "../services/api";
import StatCard from "../components/StatCard";
import RegistrationsTable from "../components/RegistrationsTable";





const AdminDashboard = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pendingEvents, setPendingEvents] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [userRoleStats, setUserRoleStats] = useState({
    participants: 0,
    organizers: 0,
    admins: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, registrations
  
  useEffect(() => {
    // Ensure compatibility between AuthContext and API interceptor
    const authTokens = localStorage.getItem("authTokens");
    if (authTokens) {
      try {
        const parsed = JSON.parse(authTokens);
        if (parsed.access && !localStorage.getItem("access_token")) {
          localStorage.setItem("access_token", parsed.access);
          localStorage.setItem("refresh_token", parsed.refresh);
        }
      } catch (error) {
        console.error("Error syncing tokens:", error);
      }
    }
  }, []);

  

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch registrations
      const regResponse = await api.get("/admin/registrations/");
      const regData = regResponse.data;
      setRegistrations(regData);
      setFilteredRegistrations(regData);
      setStats({
        total: regData.length,
        checkedIn: regData.filter(r => r.is_used).length,
        pending: regData.filter(r => !r.is_used).length,
      });
  
      // Fetch events (now includes pending in response)
      const eventsResponse = await api.get("/eventApi/");
      const events = eventsResponse.data;
      
      console.log("=== DEBUG: Events Response ===");
      console.log("Events data:", events);
      console.log("Pending events:", events.pending);
      console.log("Pending count:", events.pending?.length || 0);
      console.log("============================");
      
      // Now pending comes directly from API response!
      const pending = events.pending || [];
      setPendingEvents(pending);
      
      // Get all events for department stats (combine all categories)
      let allEvents = [];
      if (events.ongoing) allEvents = [...allEvents, ...events.ongoing];
      if (events.upcoming) allEvents = [...allEvents, ...events.upcoming];
      if (events.past) allEvents = [...allEvents, ...events.past];
      if (events.pending) allEvents = [...allEvents, ...events.pending];
  
      // Fetch users for role stats
      const usersResponse = await api.get("/userApi/");
      const users = usersResponse.data;
      
      setUserRoleStats({
        participants: users.filter(u => u.role === 'participant').length,
        organizers: users.filter(u => u.role === 'organizer').length,
        admins: users.filter(u => u.role === 'admin').length,
      });
  
      // Calculate department stats from all events
      const deptMap = {};
      allEvents.forEach(event => {
        const dept = event.organizer?.department || 'N/A';
        deptMap[dept] = (deptMap[dept] || 0) + 1;
      });
      
      const deptArray = Object.entries(deptMap)
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setDepartmentStats(deptArray);
  
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load dashboard data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId) => {
    if (window.confirm("Approve this event?")) {
      try {
        await api.patch(`/eventApi/${eventId}/`, { status: 'published' });
        alert("Event approved successfully!");
        fetchAllData(); // Refresh data
      } catch (error) {
        console.error("Approval error:", error);
        alert("Failed to approve event");
      }
    }
  };

  const handleRejectEvent = async (eventId) => {
    if (window.confirm("Reject this event? This action cannot be undone.")) {
      try {
        await api.patch(`/eventApi/${eventId}/`, { status: 'cancelled' });
        alert("Event rejected");
        fetchAllData(); // Refresh data
      } catch (error) {
        console.error("Rejection error:", error);
        alert("Failed to reject event");
      }
    }
  };

  // Filter registrations based on search and status
  useEffect(() => {
    let filtered = registrations;

    if (searchTerm) {
      filtered = filtered.filter(reg => {
        const studentName = (reg.student_name || '').toLowerCase();
        const studentEmail = (reg.student_email || '').toLowerCase();
        const eventTitle = (reg.event_title || '').toLowerCase();
        const venue = (reg.venue || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        return (
          studentName.includes(search) ||
          studentEmail.includes(search) ||
          eventTitle.includes(search) ||
          venue.includes(search)
        );
      });
    }

    if (filterStatus === "checked-in") {
      filtered = filtered.filter(r => r.is_used);
    } else if (filterStatus === "pending") {
      filtered = filtered.filter(r => !r.is_used);
    }

    setFilteredRegistrations(filtered);
  }, [searchTerm, filterStatus, registrations]);

  const handleExportCSV = () => {
    try {
      const headers = [
        'Registration ID',
        'Public ID',
        'Student Name',
        'Student Email',
        'Event Title',
        'Venue',
        'Seat Number',
        'Ticket Type',
        'Status',
        'Checked In',
        'Registration Date'
      ];

      const csvRows = [
        headers.join(','),
        ...filteredRegistrations.map(reg => {
          const checkedIn = reg.is_used ? 'Yes' : 'No';
          const registrationDate = reg.created_at ? new Date(reg.created_at).toLocaleString() : 'N/A';
          
          return [
            reg.registration_id || '',
            reg.public_id || '',
            `"${reg.student_name || 'N/A'}"`,
            reg.student_email || 'N/A',
            `"${reg.event_title || 'N/A'}"`,
            `"${reg.venue || 'N/A'}"`,
            reg.seat_number || 'N/A',
            reg.ticket_type?.toUpperCase() || 'REGULAR',
            reg.status?.toUpperCase() || 'N/A',
            checkedIn,
            `"${registrationDate}"`
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `registrations_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Successfully exported ${filteredRegistrations.length} registrations to CSV`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage events, registrations, and approvals
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('registrations')}
                className={`${
                  activeTab === 'registrations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Registrations
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {stats.total}
                </span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Pending Event Approvals - ALWAYS SHOW */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  Pending Event Approvals
                  {pendingEvents.length > 0 && (
                    <span className="ml-3 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {pendingEvents.length}
                    </span>
                  )}
                </h2>
              </div>
              <div className="overflow-x-auto">
                {pendingEvents.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Organizer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500">{event.category || 'General'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {event.organizer?.username || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {event.date ? new Date(event.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              }) : 'N/A'} {event.start_time || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Link
                            to={`/events/${event.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View 
                          </Link>
                            <button
                              onClick={() => handleApproveEvent(event.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectEvent(event.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
                    <p className="mt-1 text-sm text-gray-500">All events have been reviewed</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Total Registrations" 
                value={stats.total} 
                color="green"
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
              <StatCard 
                title="Checked In" 
                value={stats.checkedIn} 
                color="blue"
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatCard 
                title="Not Checked In" 
                value={stats.pending} 
                color="yellow"
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search by student name, event, or venue..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Search in student names, event titles, or venue names
                    </p>
                  </div>

                  {/* Status Filter */}
                  <div className="sm:w-48 flex items-start gap-3">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">All Status</option>
                      <option value="checked-in">Checked In</option>
                      <option value="pending">Pending</option>
                    </select>
                    <button
                      onClick={handleExportCSV}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 whitespace-nowrap"
                    >
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(searchTerm || filterStatus !== "all") && (
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    {searchTerm && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Search: {searchTerm}
                        <button
                          onClick={() => setSearchTerm("")}
                          className="ml-2 inline-flex items-center"
                        >
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {filterStatus !== "all" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Status: {filterStatus === "checked-in" ? "Checked In" : "Pending"}
                        <button
                          onClick={() => setFilterStatus("all")}
                          className="ml-2 inline-flex items-center"
                        >
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Registrations Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <RegistrationsTable 
                registrations={filteredRegistrations}
                onRefresh={fetchAllData}
              />
            </div>

            {/* Results Summary */}
            {filteredRegistrations.length > 0 && (
              <div className="text-center text-sm text-gray-500">
                Showing {filteredRegistrations.length} of {registrations.length} total registrations
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Departments */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Top Performing Departments
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Events Organized
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {departmentStats.length > 0 ? (
                        departmentStats.map((dept, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold text-sm">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {dept.department}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {dept.count}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                            No department data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Users by Role */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Users by Role
                  </h2>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    <li className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="ml-4 text-sm font-medium text-gray-900">
                          Participants
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        {userRoleStats.participants}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="ml-4 text-sm font-medium text-gray-900">
                          Organizers
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        {userRoleStats.organizers}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <span className="ml-4 text-sm font-medium text-gray-900">
                          Admins
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        {userRoleStats.admins}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search by student name, email, event, or venue..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="sm:w-48">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">All Status</option>
                      <option value="checked-in">Checked In</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(searchTerm || filterStatus !== "all") && (
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    {searchTerm && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Search: {searchTerm}
                        <button
                          onClick={() => setSearchTerm("")}
                          className="ml-2 inline-flex items-center"
                        >
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {filterStatus !== "all" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Status: {filterStatus === "checked-in" ? "Checked In" : "Pending"}
                        <button
                          onClick={() => setFilterStatus("all")}
                          className="ml-2 inline-flex items-center"
                        >
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Registrations Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <RegistrationsTable 
                registrations={filteredRegistrations}
                onRefresh={fetchAllData}
              />
            </div>

            {/* Results Summary */}
            {filteredRegistrations.length > 0 && (
              <div className="text-center text-sm text-gray-500">
                Showing {filteredRegistrations.length} of {registrations.length} total registrations
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
