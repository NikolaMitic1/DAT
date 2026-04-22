import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Truck,
  Package,
  Lock,
  Wrench,
  Bell,
  HelpCircle,
  User,
  LogOut,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/broker" },
  { icon: Search, label: "Search Loads", path: "/broker/search-loads" },
  { icon: Truck, label: "Search Trucks", path: "/broker/search-trucks" },
  { icon: Truck, label: "My Trucks", path: "/broker/my-trucks" },
  { icon: Package, label: "My Loads", path: "/broker/my-loads" },
  { icon: Lock, label: "Private Network", path: "/broker/network" },
  { icon: Wrench, label: "Tools", path: "/broker/tools" },
];

const bottomItems = [
  { icon: Bell, label: "Notifications" },
  { icon: HelpCircle, label: "Support" },
  { icon: User, label: "My Account" },
];

export default function BrokerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="w-[260px] min-w-[260px] h-screen bg-dat-dark flex flex-col justify-between border-r border-dat-border font-outfit">
      <div className="pt-7">
        <div className="px-6 pb-8 flex items-center gap-3">
          <div className="w-1 h-10 bg-amber-400 rounded-sm flex-shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bebas text-[28px] tracking-[3px] text-white leading-none">
              DAT One
            </span>
            <span className="font-outfit text-[10px] font-medium tracking-[2.5px] text-amber-400 uppercase leading-none">
              Broker Portal
            </span>
          </div>
        </div>

        <div className="px-6 mb-1.5 text-[10px] font-semibold tracking-[2px] text-[#2d3748] uppercase">
          Main Menu
        </div>

        <ul className="list-none p-0 m-0 mb-6">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <li key={label}>
                <Link
                  to={path}
                  className={`flex items-center gap-3.5 px-6 py-3 cursor-pointer transition-all duration-150 border-l-[3px] text-sm font-normal tracking-[0.3px] no-underline
                    ${
                      active
                        ? "bg-amber-400/10 text-amber-400 border-l-amber-400"
                        : "text-[#4b5563] border-l-transparent hover:bg-white/[0.04] hover:text-[#d1d5db] hover:border-l-amber-400/30"
                    }`}
                >
                  <Icon size={18} strokeWidth={1.8} className="flex-shrink-0" />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="py-4 border-t border-dat-border">
        {bottomItems.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3.5 px-6 py-2.5 cursor-pointer transition-all duration-150 text-[#374151] border-l-[3px] border-l-transparent hover:bg-white/[0.04] hover:text-[#9ca3af] text-[13px]"
          >
            <Icon size={17} strokeWidth={1.8} className="flex-shrink-0" />
            <span>{label}</span>
          </div>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-6 py-2.5 cursor-pointer transition-all duration-150 text-[#374151] border-l-[3px] border-l-transparent hover:bg-red-500/10 hover:text-red-400 hover:border-l-red-500/50 text-[13px] mt-1"
        >
          <LogOut size={17} strokeWidth={1.8} className="flex-shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
