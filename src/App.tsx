import NavBar from "./components/NavBar/NavBar";
import Home from "./components/Home/Home";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import logo from "./assets/logo.png";
import { Route, BrowserRouter, Routes } from "react-router-dom";

const App = () => {
  let items = [
    "Home",
    "Twin Dashboard",
    "Create Twin",
    "My Insights",
    "AI Reflections",
  ];
  return (
    <BrowserRouter>
      <NavBar brandName="MirrorMind" imageSrcPath={logo} navItems={items} />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
