import { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
    role: "participant", // default
    mobile: "",
    department: "",
    matric_no: "",
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    setMessage("");

    if (formData.password !== formData.password2) {
        setMessage("❌ Passwords do not match.");
        
        return; 
      }
    try {
    //   const { password2, ...dataToSend } = formData;
      const res = await axios.post("https://advance-django-event.onrender.com/api/register/", formData);
      setMessage("✅ Registration successful!");
      setFormData({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password2: "",
        role: "participant", // default
        mobile: "",
        department: "",
        matric_no: "",
      });
    } catch (err) {
      console.error(err.response?.data);
      setMessage("❌ Registration failed. Please check inputs.");
      if (err.response?.data) {
        setErrors(err.response.data);
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>


        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />
        {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}

        <input
          type="text"
          name="first_name"
          placeholder="FirstName"
          value={formData.first_name}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />
        {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name}</p>}

        <input
          type="text"
          name="last_name"
          placeholder="LastName"
          value={formData.last_name}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />
        {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />
        {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}


        <input
          type="password"
          name="password2"
          placeholder="Confirm Password"
          value={formData.password2}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />
        {errors.password2 && <p className="text-red-500 text-xs">{errors.password2}</p>}

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded"
        >
          <option value="participant">Participant</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="text"
          name="mobile"
          placeholder="Mobile Number"
          value={formData.mobile}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded"
        />

        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded"
        />

        <input
          type="text"
          name="matric_no"
          placeholder="Matric Number"
          value={formData.matric_no}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register
        </button>

        {message && <p className="mt-3 text-center">{message}</p>}
      </form>
    </div>
  );
};

export default Register;
