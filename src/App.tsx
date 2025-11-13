import NavBar from "./components/NavBar/NavBar";
import Home from "./components/Home/Home";
import Auth from "./components/Auth/Auth";
import Footer from "./components/Footer/Footer";
import TwinDashboard from "./components/TwinDashboard/TwinDashboard";
import CreateTwin from "./components/CreateTwin/CreateTwin";
import MyInsights from "./components/MyInsights/MyInsights";
import AIReflections from "./components/AIReflections/AIReflections";
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
  const isAuthPage = location.pathname.startsWith("/auth");
  return (
    <>
      {/* Render NavBar, only if not on /auth (For login/sign pages) */}
      {!isAuthPage && (
        <NavBar brandName="MirrorMind" imageSrcPath={logo} navItems={items} />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/twin-dashboard" element={<TwinDashboard />} />
        <Route path="/create-twin" element={<CreateTwin />} />
        <Route path="/my-insights" element={<MyInsights />} />
        <Route path="/ai-reflections" element={<AIReflections />} />
      </Routes>

      {/* Render Footer, only if not on /auth (footer should not be displayed on login creen) */}
      {!isAuthPage && <Footer />}
    </>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppWrapper />
  </BrowserRouter>
);

export default App;
