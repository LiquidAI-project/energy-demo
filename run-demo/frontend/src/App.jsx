import Demo from "./components/Demo";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { DemoVisualizationProvider } from "./context/demoVisualizationContext/DemoVisualizationContext";
import { DemoControlProvider } from "./context/demoControlContext/DemoControlContext";
import EnergyComponentPage from "./components/EnergyComponentPage";
import WelcomePage from "./components/WelcomePage";

function App() {
  return (
    <DemoControlProvider>
      <DemoVisualizationProvider>
        <Router>
          <Routes>
            <Route exact path="/" element={<WelcomePage />} />
            <Route exact path="/demo" element={<Demo />} />
            <Route path="/component/:id" element={<EnergyComponentPage />} />
          </Routes>
        </Router>
      </DemoVisualizationProvider>
    </DemoControlProvider>
  );
}
export default App;
