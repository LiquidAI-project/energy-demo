import Demo from "./components/Demo";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { DemoVisualizationProvider } from "./context/demoVisualizationContext/DemoVisualizationContext";
import { DemoControlProvider } from "./context/demoControlContext/DemoControlContext";

function App() {
  return (
    <DemoVisualizationProvider>
      <DemoControlProvider>
        <Router>
          <Routes>
            <Route exact path="/" element={<Demo />} />
          </Routes>
        </Router>
      </DemoControlProvider>
    </DemoVisualizationProvider>
  );
}
export default App;
