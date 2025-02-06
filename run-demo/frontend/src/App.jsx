import Demo from "./components/Demo";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { DemoVisualizationProvider } from "./context/DemoVisualizationContext/DemoVisualizationContext";

function App() {
  return (
    <DemoVisualizationProvider>
      <Router>
        <Routes>
          <Route exact path="/" element={<Demo />} />
        </Routes>
      </Router>
    </DemoVisualizationProvider>
  );
}
export default App;
