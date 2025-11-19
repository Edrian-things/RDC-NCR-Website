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
import EmployesPortal from "./pages/EmployesPortal/EmployesPortal";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import Directory from "./pages/Directory";
import Updates from "./pages/Updates";
import Navbar from "./components/Navbar";
import RegionalProfile from "./pages/RegionalProfile";
import Publication from "./pages/Publication";
import Contact from "./pages/Contact";

// Wrapper to use useLocation inside Router
function AppWithNavbar() {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const hideNavbar =
    location.pathname === "/employesPortal" || location.pathname === "/login";
  return (
    <>
      {/* Hide Navbar on /employesPortal and /Login */}
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/regional-profile" element={<RegionalProfile />} />
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
        <Route path="/documents" element={<Publication />} />
        <Route path="/about" element={<Contact />} />
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
