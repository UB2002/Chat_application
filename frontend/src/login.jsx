import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const api = import.meta.env.API

const login = async (data) => {
  const res = await axios.post( `${api}/api/users/login`, {
    username: data.username,
    password: data.password,
  });
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data;
};

const register = async (data) => {
  const res = await axios.post(`${api}/api/users/register`, {
    username: data.username,
    password: data.password,
  });
  return res.data;
};

function Login_Page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (isRegister) {
        // Register new user
        await register({ username, password });
        alert("Registration successful");
        setIsRegister(false); // Switch back to login form
      } else {
        // Login existing user
        await login({ username, password });
        alert("Login successful");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert(isRegister ? "Registration failed " : "Login failed ");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
          {isRegister ? "Register" : "Login"}
        </h1>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-indigo-600 hover:underline font-semibold"
          >
            {isRegister ? "Login here" : "Register here"}
          </button>
        </p>

        {message && (
          <p
            className={`mt-6 text-center text-sm font-semibold ${
              message.includes("successful")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login_Page;
