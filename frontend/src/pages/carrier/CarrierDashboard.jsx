import CarrierSidebar from "../../components/sidebar/CarrierSidebar";

export default function CarrierDashboard() {
  return (
    <div className="flex h-screen bg-dat-dark font-outfit">
      <CarrierSidebar />
      <div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 px-8 h-[60px] bg-white border-b border-gray-200 flex-shrink-0">
          <span className="text-[11px] font-semibold tracking-[2px] text-gray-400 uppercase">
            Carrier Portal
          </span>
          <span className="text-gray-300 text-base">/</span>
          <span className="font-bebas text-xl tracking-[2px] text-gray-800">
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
