import BrokerSidebar from "../../components/sidebar/BrokerSidebar";

export default function BrokerDashboard() {
  return (
    <div className="flex h-screen bg-dat-dark font-outfit">
      <BrokerSidebar />
      <div className="flex-1 flex flex-col bg-dat-surface min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 px-8 h-[60px] bg-dat-header border-b border-dat-border flex-shrink-0">
          <span className="text-[11px] font-semibold tracking-[2px] text-[#374151] uppercase">
            Broker Portal
          </span>
          <span className="text-[#1e2d3d] text-base">/</span>
          <span className="font-bebas text-xl tracking-[2px] text-slate-100">
            Dashboard
          </span>
        </div>
        <div className="flex-1 p-8 overflow-y-auto text-gray-500 text-sm">
          {/* Sadržaj stranice */}
        </div>
      </div>
    </div>
  );
}
