import Demo from "./components/Demo";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { DemoVisualizationProvider } from "./context/demoVisualizationContext/DemoVisualizationContext";
import { DemoControlProvider } from "./context/demoControlContext/DemoControlContext";

function App() {
  return (
    <DemoControlProvider>
      <DemoVisualizationProvider>
        <Router>
          <Routes>
            <Route exact path="/" element={<Demo />} />
          </Routes>
        </Router>
      </DemoVisualizationProvider>
    </DemoControlProvider>
  );
}
export default App;
