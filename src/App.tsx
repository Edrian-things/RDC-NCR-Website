import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import EmployesPortal from "./pages/EmployesPortal";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import Directory from "./pages/Directory";
import Updates from "./pages/Updates";
import Navbar from "./components/Navbar";

// Wrapper to use useLocation inside Router
function AppWithNavbar() {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <>
      {/* Hide Navbar on /employesPortal */}
      {location.pathname !== "/employesPortal" && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/login" element={<Login />} />

        {/* Protected route */}
        <Route
          path="/employesPortal"
          element={isLoggedIn ? <EmployesPortal /> : <Navigate to="/login" />}
        />

        {/* Extra pages */}
        <Route
          path="/reports"
          element={isLoggedIn ? <Reports /> : <Navigate to="/login" />}
        />
        <Route
          path="/directory"
          element={isLoggedIn ? <Directory /> : <Navigate to="/login" />}
        />
        <Route
          path="/updates"
          element={isLoggedIn ? <Updates /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
}

const App = () => (
  <Router>
    <AppWithNavbar />
  </Router>
);

export default App;
