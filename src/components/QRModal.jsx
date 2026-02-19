


const QRModal = ({ qr, onClose }) => {

    const handleCheckIn = async (id) => {
        await axios.post("/check-in/", { registration_id: id });
        alert("Checked in!");
      };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <img src={qr} alt="QR Code" className="w-64 h-64 mx-auto" />
          <button
            onClick={onClose}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  
  export default QRModal;
  