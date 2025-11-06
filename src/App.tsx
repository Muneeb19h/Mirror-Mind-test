import NavBar from "./components/NavBar";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import logo from "./assets/logo.png";

const App = () => {
  let items = ["Home", "Product", "Services"];
  return (
    <div>
      <NavBar brandName={"MirrorMind"} imageSrcPath={logo} navItems={items} />
    </div>
  );
};

export default App;
