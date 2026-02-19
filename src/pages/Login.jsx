import { useState } from "react";
import { useAuth } from "@/context/AuthContext"; // 
import { useNavigate } from "react-router-dom";

const Login = () => {
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
     
      const success = await login(formData.username, formData.password);
      
      if (success) {
        // --- 4. Redirect on success ---
        // The onLogin prop is no longer needed.
        setMessage("✅ Login successful! Redirecting...");
        navigate("/dashboard"); // Or wherever you want to go
      } else {
        // The login function in the context will throw an error on failure
        setMessage("❌ Invalid username or password.");
      }
    } catch (error) {
      // Catch any errors thrown by the login function
      setMessage("❌ Invalid username or password.");
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Login
        </button>

        {message && <p className="mt-3 text-sm text-center">{message}</p>}
      </form>
    </div>
  );
};

export default Login;
