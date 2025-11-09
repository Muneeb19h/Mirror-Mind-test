import NavBar from "./components/NavBar/NavBar";
import Home from "./components/Home/Home";
import Auth from "./components/Auth/Auth";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import logo from "./assets/logo.png";
import { Route, BrowserRouter, Routes, useLocation } from "react-router-dom";

const AppWrapper = () => {
  const location = useLocation();
  const items = [
    "Home",
    "Twin Dashboard",
    "Create Twin",
    "My Insights",
    "AI Reflections",
  ];

  return (
    <>
      {/* Render Navbar only if not on /auth */}
      {location.pathname !== "/auth" && (
        <NavBar brandName="MirrorMind" imageSrcPath={logo} navItems={items} />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppWrapper />
  </BrowserRouter>
);

export default App;
