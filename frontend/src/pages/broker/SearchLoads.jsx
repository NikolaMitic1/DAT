import { useState } from "react";
import BrokerSidebar from "../../components/sidebar/BrokerSidebar";
import {
  Search,
  MapPin,
  Calendar,
  ChevronDown,
  ArrowRight,
  Weight,
  Ruler,
  SlidersHorizontal,
  RefreshCw,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";

const EQUIPMENT_TYPES = ["Van", "Reefer", "Flatbed", "Step Deck", "Lowboy", "Power Only", "Box Truck", "Tanker"];

const MOCK_LOADS = [
  { id: 1, origin: "Chicago, IL", dest: "Dallas, TX", distance: 921, pickup: "Apr 23", equipment: "Van", weight: "42,000 lbs", rate: "$2,850", rpm: "$3.09", age: "2m ago", company: "FreightCore LLC", dho: 12, dde: 8, starred: false },
  { id: 2, origin: "Atlanta, GA", dest: "Miami, FL", distance: 662, pickup: "Apr 23", equipment: "Reefer", weight: "38,500 lbs", rate: "$1,920", rpm: "$2.90", age: "5m ago", company: "SunState Shippers", dho: 4, dde: 0, starred: true },
  { id: 3, origin: "Los Angeles, CA", dest: "Phoenix, AZ", distance: 372, pickup: "Apr 24", equipment: "Flatbed", weight: "44,000 lbs", rate: "$1,150", rpm: "$3.09", age: "11m ago", company: "WestBound Freight", dho: 22, dde: 15, starred: false },
  { id: 4, origin: "Houston, TX", dest: "Kansas City, MO", distance: 746, pickup: "Apr 24", equipment: "Van", weight: "36,000 lbs", rate: "$2,100", rpm: "$2.82", age: "18m ago", company: "Gulf Cargo Inc.", dho: 7, dde: 3, starred: false },
  { id: 5, origin: "Seattle, WA", dest: "Portland, OR", distance: 174, pickup: "Apr 25", equipment: "Reefer", weight: "40,000 lbs", rate: "$620", rpm: "$3.56", age: "32m ago", company: "NW Cold Chain", dho: 1, dde: 0, starred: false },
  { id: 6, origin: "Denver, CO", dest: "Salt Lake City, UT", distance: 525, pickup: "Apr 25", equipment: "Van", weight: "29,800 lbs", rate: "$1,480", rpm: "$2.82", age: "47m ago", company: "Mountain Freight Co.", dho: 18, dde: 10, starred: true },
];

export default function SearchLoads() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [equipment, setEquipment] = useState("Van");
  const [pickupDate, setPickupDate] = useState("");
  const [results, setResults] = useState(MOCK_LOADS);
  const [searched, setSearched] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("age");

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setResults(MOCK_LOADS);
      setSearched(true);
      setLoading(false);
    }, 600);
  };

  const toggleStar = (id) => {
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, starred: !r.starred } : r))
    );
  };

  return (
    <div className="flex h-screen bg-[#f8f9fb] font-outfit">
      <BrokerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Search Panel */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex-shrink-0">
          <div className="flex items-end gap-3 flex-wrap">
            {/* Origin */}
            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                Origin
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="City, State or ZIP"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all w-full"
                />
              </div>
            </div>

            <ArrowRight size={16} className="text-gray-300 mb-2.5 flex-shrink-0" />

            {/* Destination */}
            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                Destination
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="City, State or ZIP"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all w-full"
                />
              </div>
            </div>

            {/* Pickup Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                Pickup Date
              </label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>
            </div>

            {/* Equipment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                Equipment
              </label>
              <div className="relative">
                <select
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all appearance-none cursor-pointer"
                >
                  {EQUIPMENT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-end gap-2 ml-auto">
              <button className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-all">
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-amber-400 text-[#0d1117] rounded-lg hover:bg-amber-300 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {loading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Search size={14} />
                )}
                <span>{loading ? "Searching..." : "Search"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {searched && (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800">
                    {results.length} loads found
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={11} />
                    Updated just now
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Sort by:</span>
                  {["age", "rate", "distance"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all capitalize ${
                        sortBy === s
                          ? "border-amber-400 bg-amber-400/10 text-amber-600 font-medium"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {s === "age" ? "Newest" : s === "rate" ? "Rate" : "Distance"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase w-8"></th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Origin</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Destination</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Pickup</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Equip.</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Weight</th>
                      <th className="text-right px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Rate</th>
                      <th className="text-right px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">$/mi</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Company</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Posted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((load, i) => (
                      <tr
                        key={load.id}
                        className={`group border-b border-gray-50 hover:bg-amber-400/[0.03] transition-colors cursor-pointer ${
                          i === results.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleStar(load.id); }}
                            className="text-gray-300 hover:text-amber-400 transition-colors"
                          >
                            <Star
                              size={14}
                              className={load.starred ? "fill-amber-400 text-amber-400" : ""}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-gray-800">{load.origin}</div>
                          <div className="text-[11px] text-gray-400">{load.dho} mi from origin</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-gray-800">{load.dest}</div>
                          <div className="text-[11px] text-gray-400">{load.dde} mi from dest.</div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">{load.pickup}</td>
                        <td className="px-4 py-3.5">
                          <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-gray-100 text-gray-600">
                            {load.equipment}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">{load.weight}</td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="font-semibold text-gray-900">{load.rate}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`font-medium ${parseFloat(load.rpm) >= 3.0 ? "text-emerald-600" : "text-gray-600"}`}>
                            {load.rpm}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 text-[13px]">{load.company}</td>
                        <td className="px-4 py-3.5 text-gray-400 text-[12px] whitespace-nowrap">{load.age}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Stats Bar */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                {[
                  { label: "Avg. Rate/Mile", value: "$3.05", icon: TrendingUp, color: "text-emerald-600" },
                  { label: "Loads Available", value: results.length.toString(), icon: Search, color: "text-amber-500" },
                  { label: "Best Rate/Mile", value: "$3.56", icon: Star, color: "text-blue-500" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4 shadow-sm">
                    <div className={`${color} opacity-70`}>
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">{label}</div>
                      <div className={`text-xl font-bebas tracking-widest mt-0.5 ${color}`}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!searched && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-16">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Search size={24} className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">Search for available loads</p>
                <p className="text-sm text-gray-400 mt-1">Enter origin and destination to find matching loads</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
