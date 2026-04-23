import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import BrokerDashboard from "./pages/broker/BrokerDashboard";
import CarrierDashboard from "./pages/carrier/CarrierDashboard";
import BrokerSearchLoads from "./pages/broker/SearchLoads";
import BrokerMyLoads from "./pages/broker/MyLoads";
import CarrierSearchLoads from "./pages/carrier/SearchLoads";
import CarrierMyTrucks from "./pages/carrier/MyTrucks";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/broker" element={<ProtectedRoute><BrokerDashboard /></ProtectedRoute>} />
        <Route path="/broker/search-loads" element={<ProtectedRoute><BrokerSearchLoads /></ProtectedRoute>} />
        <Route path="/broker/my-loads" element={<ProtectedRoute><BrokerMyLoads /></ProtectedRoute>} />

        <Route path="/carrier" element={<ProtectedRoute><CarrierDashboard /></ProtectedRoute>} />
        <Route path="/carrier/search-loads" element={<ProtectedRoute><CarrierSearchLoads /></ProtectedRoute>} />
        <Route path="/carrier/my-trucks" element={<ProtectedRoute><CarrierMyTrucks /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
