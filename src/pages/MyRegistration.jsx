import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
  const [qrCode, setQrCode] = useState(null);

  const registerUser = async () => {
    const response = await axios.post(" https://advance-django-event.onrender.com/register_event/", {
      event_id: 10,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`
      }
    });

    setQrCode(response.data.qr_code_url);
  };

  return (
    <div>
      <button onClick={registerUser} className="btn btn-primary">
        Register for Event
      </button>

      {qrCode && (
        <div>
          <h3>Your QR Code</h3>
          <img src={qrCode} alt="QR Code" style={{ width: 200 }} />
        </div>
      )}
    </div>
  );
}
