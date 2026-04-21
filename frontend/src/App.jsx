import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import BrokerDashboard from "./pages/broker/BrokerDashboard";
import CarrierDashboard from "./pages/carrier/CarrierDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/broker" element={<BrokerDashboard />} />
        <Route path="/carrier" element={<CarrierDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
