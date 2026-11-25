import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import CodeWorkspace from "./pages/CodeWorkspace";
import AptitudeQuiz from "./pages/AptitudeQuiz";
import PlacementDrives from "./pages/PlacementDrives";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-6 flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/practice" element={<CodeWorkspace />} />
              <Route path="/aptitude" element={<AptitudeQuiz />} />
              <Route path="/drives" element={<PlacementDrives />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}