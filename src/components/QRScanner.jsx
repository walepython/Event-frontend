import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../services/api";

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ticketInfo, setTicketInfo] = useState(null);
  const [permissionError, setPermissionError] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const manualInputRef = useRef(null);
  const scannerContainerRef = useRef(null); // New ref for scanner container

  // Get available cameras
  const getCameras = async () => {
    try {
      const Html5Qrcode = window.Html5Qrcode;
      if (Html5Qrcode) {
        const devices = await Html5Qrcode.getCameras();
        setAvailableCameras(devices);
        if (devices.length > 0) {
          setSelectedCamera(devices[0].id);
        }
      }
    } catch (err) {
      console.error("Error getting cameras:", err);
    }
  };

  // Initialize scanner with selected camera
  const startScanner = async () => {
    if (!scannerContainerRef.current) return;

    try {
      // Clear any existing scanner first
      await stopScanner();

      // Create a clean container for the scanner
      scannerContainerRef.current.innerHTML = '';
      
      // Create a unique ID for this scanner instance
      const scannerId = `scanner-${Date.now()}`;
      const scannerElement = document.createElement('div');
      scannerElement.id = scannerId;
      scannerContainerRef.current.appendChild(scannerElement);

      // Initialize scanner
      scannerRef.current = new Html5QrcodeScanner(
        scannerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: selectedCamera ? { deviceId: selectedCamera } : undefined
        },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
      setIsScanning(true);
      setPermissionError(false);
    } catch (err) {
      console.error("Failed to start scanner:", err);
      if (err.name === 'NotAllowedError') {
        setPermissionError(true);
        setError("Camera permission denied. Please allow camera access.");
      } else if (err.name === 'NotFoundError') {
        setError("No camera found on your device.");
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        // Stop the camera stream first
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    
    // Clean up the container
    if (scannerContainerRef.current) {
      scannerContainerRef.current.innerHTML = '';
    }
    
    setIsScanning(false);
  };

  const playBeep = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = type === 'success' ? 800 : 300;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    } catch (err) {
      console.log("Audio not supported");
    }
  };

  const checkInTicket = async (ticketId) => {
    const cleanTicketId = ticketId.trim();
    
    if (!cleanTicketId) {
      setError("Please enter a ticket ID");
      return;
    }
  
    setLoading(true);
    setError("");
    setSuccess("");
    setTicketInfo(null);
  
    try {
      console.log("Sending request to:", `/checkin/${cleanTicketId}/`);
      const response = await api.post(`/checkin/${cleanTicketId}/`);
      
      // Debug: Log the entire response
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      
      // Try to handle different response structures
      if (response.data.status === "success" || response.data.success) {
        setSuccess(response.data.message || "Ticket checked in successfully!");
        
        // Try different possible field names for ticket info
        const ticketData = response.data.ticket_info || 
                           response.data.ticket || 
                           response.data.data;
        
        if (ticketData) {
          setTicketInfo(ticketData);
        }
        
        playBeep('success');
        
        setTimeout(() => {
          setSuccess("");
          setTicketInfo(null);
          setScanResult(null);
        }, 9000);
      } else {
        // If no success status but we got a 200 response
        setSuccess("Ticket processed successfully");
        if (response.data) setTicketInfo(response.data);
      }
    } catch (err) {
      console.log("Error details:", err);
      console.log("Error response:", err.response);
      
      // Debug error response
      if (err.response) {
        console.log("Error response data:", err.response.data);
        console.log("Error response status:", err.response.status);
      }
      
      let errorMsg = "Error checking in ticket";
      let ticketData = null;
      
      if (err.response?.data) {
        errorMsg = err.response.data.message || 
                   err.response.data.error || 
                   err.response.data.detail || 
                   errorMsg;
        
        // Try to extract ticket info from different possible locations
        ticketData = err.response.data.ticket_info ||
                     err.response.data.ticket ||
                     err.response.data;
      }
      
      setError(errorMsg);
      
      if (ticketData) {
        setTicketInfo(ticketData);
      }
      
      playBeep('error');
    } finally {
      setLoading(false);
    }
  };


  const onScanSuccess = (decodedText) => {
    if (scanResult === decodedText) return;
    
    setScanResult(decodedText);
    checkInTicket(decodedText);
  };

  const onScanFailure = (error) => {
    // Ignore common non-error messages
    if (!error || error.includes("NotFoundException") || error.includes("No QR code found")) {
      return;
    }
    console.warn("QR scan error:", error);
  };

  const requestCameraPermission = () => {
    startScanner();
  };

  const handleManualCheckIn = () => {
    if (manualInputRef.current && manualInputRef.current.value.trim()) {
      checkInTicket(manualInputRef.current.value.trim());
      manualInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      checkInTicket(e.target.value.trim());
      e.target.value = '';
    }
  };

  // Initialize on component mount
  useEffect(() => {
    getCameras();
    
    return () => {
      stopScanner();
    };
  }, []);

  // Start scanner when camera is selected
  useEffect(() => {
    if (selectedCamera && !isScanning) {
      // Delay to ensure DOM is ready
      setTimeout(() => startScanner(), 100);
    }
  }, [selectedCamera]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold">QR Code Ticket Scanner</h1>
          <p className="opacity-90">Scan event tickets to check in attendees</p>
        </div>

        <div className="p-6">
          {/* Camera Permission Error */}
          {permissionError && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-yellow-800">Camera Permission Required</h3>
              </div>
              <p className="text-yellow-700 mb-4">
                We need camera access to scan QR codes. Please allow camera permissions in your browser.
              </p>
              <button
                onClick={requestCameraPermission}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Request Camera Permission
              </button>
            </div>
          )}

          {/* Camera Selection */}
          {availableCameras.length > 0 && !permissionError && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Camera
              </label>
              <select
                value={selectedCamera || ""}
                onChange={(e) => {
                  setSelectedCamera(e.target.value);
                  stopScanner();
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableCameras.map(camera => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Camera ${camera.id.substring(0, 10)}...`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Scanner Section */}
          <div className="mb-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Scanner</h2>
              <p className="text-gray-600 text-sm mb-4">
                Point camera at QR code. Scanning will happen automatically.
              </p>
            </div>
            
            {/* Scanner Container with ref */}
            <div 
              ref={scannerContainerRef}
              className="border-2 border-dashed border-gray-300 rounded-lg p-2 min-h-[300px] flex items-center justify-center"
            >
              {!isScanning && !permissionError && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Camera preview will appear here</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-center space-x-4">
              {isScanning ? (
                <button
                  onClick={stopScanner}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Stop Scanner
                </button>
              ) : (
                <button
                  onClick={startScanner}
                  disabled={!selectedCamera && availableCameras.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Start Scanner
                </button>
              )}
              
              <button
                onClick={() => {
                  stopScanner();
                  setTimeout(() => startScanner(), 100);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Restart Scanner
              </button>
            </div>
          </div>

          {/* Manual Entry */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Manual Ticket Entry</h3>
            <div className="flex gap-2">
              <input
                ref={manualInputRef}
                type="text"
                placeholder="Enter Ticket ID (public_id)"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleManualCheckIn}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Check In
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {/* Loading */}
            {loading && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  <div>
                    <p className="font-medium">Processing ticket...</p>
                    <p className="text-sm text-gray-600">Ticket ID: {scanResult}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-green-800">{success}</h3>
                </div>
                
                {ticketInfo && (
                  <div className="mt-3 bg-white p-3 rounded border">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Attendee</p>
                        <p className="font-medium">{ticketInfo.student_name || ticketInfo.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Event</p>
                        <p className="font-medium">{ticketInfo.event_title || ticketInfo.event || 'N/A'}</p>
                      </div>
                      {ticketInfo.seat_number && (
                        <div>
                          <p className="text-sm text-gray-500">Seat</p>
                          <p className="font-medium">{ticketInfo.seat_number}</p>
                        </div>
                      )}
                      {ticketInfo.ticket_type && (
                        <div>
                          <p className="text-sm text-gray-500">Ticket Type</p>
                          <p className={`font-medium ${ticketInfo.ticket_type === 'vip' ? 'text-purple-600' : 'text-blue-600'}`}>
                            {ticketInfo.ticket_type.toUpperCase()}
                          </p>
                        </div>
                      )}
                      {ticketInfo.checked_in_at && (
                        <div>
                          <p className="text-sm text-gray-500">Checked In At</p>
                          <p className="font-medium">{ticketInfo.checked_in_at}</p>
                        </div>
                      )}
                      {ticketInfo.checked_in_by && (
                        <div>
                          <p className="text-sm text-gray-500">Checked In By</p>
                          <p className="font-medium">{ticketInfo.checked_in_by}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="w-6 h-6 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-800">Error</h3>
                </div>
                <p className="text-red-700 mb-3">{error}</p>
                
                {ticketInfo && (
                  <div className="mt-3 bg-white p-3 rounded border">
                    <p className="font-medium mb-2">Ticket Information:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Attendee</p>
                        <p className="font-medium">{ticketInfo.student_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Event</p>
                        <p className="font-medium">{ticketInfo.event_title}</p>
                      </div>
                      {ticketInfo.checked_in_at && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Previously Checked In At</p>
                          <p className="font-medium">{ticketInfo.checked_in_at}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Scan History */}
            {scanResult && !loading && !success && !error && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Last Scanned:</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{scanResult}</code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;