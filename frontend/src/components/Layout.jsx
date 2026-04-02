// src/components/Layout.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import BrokerSidebar from "./sidebar/BrokerSidebar";
import CarrierSidebar from "./sidebar/CarrierSidebar";
import "./Layout.css";

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <>{children}</>; // ako nije ulogovan, samo renderuj sadržaj

  return (
    <div className="layout">
      {user.role === "Broker" && <BrokerSidebar />}
      {user.role === "Carrier" && <CarrierSidebar />}
      <div className="main-content">{children}</div>
    </div>
  );
};

export default Layout;
