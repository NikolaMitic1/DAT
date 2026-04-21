import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import BrokerSidebar from "./sidebar/BrokerSidebar";
import CarrierSidebar from "./sidebar/CarrierSidebar";

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <>{children}</>;

  return (
    <div className="flex h-screen">
      {user.role === "Broker" && <BrokerSidebar />}
      {user.role === "Carrier" && <CarrierSidebar />}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};

export default Layout;
