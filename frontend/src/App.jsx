import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import BrokerDashboard from "./pages/broker/BrokerDashboard";
import CarrierDashboard from "./pages/carrier/CarrierDashboard";
import BrokerSearchLoads from "./pages/broker/SearchLoads";
import CarrierSearchLoads from "./pages/carrier/SearchLoads";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/broker" element={<BrokerDashboard />} />
        <Route path="/broker/search-loads" element={<BrokerSearchLoads />} />
        <Route path="/carrier" element={<CarrierDashboard />} />
        <Route path="/carrier/search-loads" element={<CarrierSearchLoads />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
