import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (username === "admin" && password === "password") {
        localStorage.setItem("isLoggedIn", "true");
        navigate("/employesPortal");
      } else {
        setError("Invalid credentials. Try admin / password.");
      }
    }, 1200);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-100 via-white to-blue-200 overflow-hidden relative">
      {/* Animated background blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200 rounded-full filter blur-2xl opacity-40 animate-blob1 z-0"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-200 rounded-full filter blur-2xl opacity-30 animate-blob2 z-0"></div>
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white shadow-2xl rounded-2xl p-10 animate-fade-in border-t-8 border-blue-600">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-800 rounded-full p-3 mb-2 shadow-lg animate-pop">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-blue-800 mb-1 tracking-wide drop-shadow">
              Login
            </h1>
            <p className="text-blue-900 text-xs">
              Sign in to access your portal
            </p>
          </div>
          {error && (
            <p className="text-red-600 text-sm mb-4 text-center animate-shake">
              {error}
            </p>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-blue-900 text-sm mb-1 font-medium">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                className="w-full border border-blue-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition placeholder-blue-200"
                placeholder="Enter username"
                required
                autoFocus
                autoComplete="username"
              />
            </div>
            <div className="relative">
              <label className="block text-blue-900 text-sm mb-1 font-medium">
                Password
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full border border-blue-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition placeholder-blue-200 pr-10"
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-8 text-blue-400 hover:text-blue-700 transition"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7c1.657 0 3.216.41 4.563 1.125M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white py-2 rounded-md font-semibold shadow-md transition-all duration-200
                hover:bg-blue-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400
                relative overflow-hidden group
                ${loading ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Logging in...
                  </>
                ) : (
                  <>
                    <span className="group-hover:pr-2 transition-all duration-200">
                      Login
                    </span>
                    <svg
                      className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </>
                )}
              </span>
              {/* Button animated background */}
              <span className="absolute left-0 top-0 w-0 h-full bg-blue-700 opacity-20 group-hover:w-full transition-all duration-300 rounded-md"></span>
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-blue-900">
            <a
              href="/"
              className="hover:underline text-blue-700 transition-colors duration-150 inline-flex items-center gap-1 group"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </a>
          </div>
        </div>
      </div>
      {/* Animations */}
      <style>
        {`
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(.39,.575,.565,1) both;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(30px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-pop {
          animation: pop 0.7s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes pop {
          0% { transform: scale(0.7);}
          80% { transform: scale(1.1);}
          100% { transform: scale(1);}
        }
        .animate-shake {
          animation: shake 0.4s;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px);}
          20%, 80% { transform: translateX(4px);}
          30%, 50%, 70% { transform: translateX(-8px);}
          40%, 60% { transform: translateX(8px);}
        }
        .animate-blob1 {
          animation: blob1 12s infinite linear alternate;
        }
        @keyframes blob1 {
          0% { transform: scale(1) translateY(0) translateX(0);}
          100% { transform: scale(1.15) translateY(30px) translateX(40px);}
        }
        .animate-blob2 {
          animation: blob2 14s infinite linear alternate;
        }
        @keyframes blob2 {
          0% { transform: scale(1) translateY(0) translateX(0);}
          100% { transform: scale(1.1) translateY(-20px) translateX(-30px);}
        }
        `}
      </style>
    </div>
  );
};

export default Login;
