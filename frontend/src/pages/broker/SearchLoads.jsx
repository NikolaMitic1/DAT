import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import BrokerSidebar from "../../components/sidebar/BrokerSidebar";
import { AuthContext } from "../../context/AuthContext";
import {
  Search,
  MapPin,
  Calendar,
  ChevronDown,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  Package,
} from "lucide-react";

const SIZE_LABELS = { FULL_LOAD: "Full Load", PARTIAL: "Partial" };

const STATUS_CONFIG = {
  POSTED:       { label: "Posted",     dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50",  border: "border-l-emerald-400" },
  BOOKED:       { label: "Booked",     dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50",     border: "border-l-blue-400"    },
  IN_TRANSPORT: { label: "In Transit", dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50",    border: "border-l-amber-400"   },
  DELIVERED:    { label: "Delivered",  dot: "bg-gray-300",    text: "text-gray-500",    bg: "bg-gray-100",    border: "border-l-gray-300"    },
  CANCELLED:    { label: "Cancelled",  dot: "bg-red-400",     text: "text-red-600",     bg: "bg-red-50",      border: "border-l-red-400"     },
};

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPrice(price) {
  if (price == null) return "—";
  return "$" + price.toLocaleString("en-US");
}

export default function SearchLoads() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loads, setLoads] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [sizeFilter, setSizeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("age");
  const [starred, setStarred] = useState(new Set());

  const fetchLoads = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = user?.token ?? localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const res = await fetch("/api/loads/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) { navigate("/login"); return; }
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      const posted = data.filter((l) => l.status === "POSTED");
      setLoads(posted);
      setFiltered(posted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoads(); }, []);

  const handleSearch = () => {
    let result = [...loads];
    if (origin.trim())
      result = result.filter((l) =>
        l.pickupLocation?.toLowerCase().includes(origin.trim().toLowerCase())
      );
    if (destination.trim())
      result = result.filter((l) =>
        l.deliveryLocation?.toLowerCase().includes(destination.trim().toLowerCase())
      );
    if (pickupDate)
      result = result.filter((l) => l.pickUpDateTime?.startsWith(pickupDate));
    if (sizeFilter !== "All")
      result = result.filter((l) => l.size === sizeFilter);
    setFiltered(result);
  };

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "age") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "rate") return (b.price ?? 0) - (a.price ?? 0);
    return 0;
  });

  const toggleStar = (id) => {
    setStarred((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const availableCount = filtered.filter((l) => l.status === "POSTED").length;
  const avgPrice =
    filtered.length > 0
      ? Math.round(filtered.reduce((s, l) => s + (l.price ?? 0), 0) / filtered.length)
      : 0;
  const bestPrice =
    filtered.length > 0 ? Math.max(...filtered.map((l) => l.price ?? 0)) : 0;

  return (
    <div className="flex h-screen bg-[#f6f7f9] font-outfit">
      <BrokerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dark Search Panel — flows from sidebar */}
        <div className="bg-[#0d1117] border-b border-white/5 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">

            {/* Route group: Origin → Destination */}
            <div className="flex items-center gap-2 flex-1 min-w-0 w-full lg:w-auto">
              <div className="relative flex-1 min-w-0">
                <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-8 pr-3 py-2.5 text-sm border border-white/10 rounded-lg bg-white/5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-400/60 transition-all w-full"
                />
              </div>
              <ArrowRight size={13} className="text-gray-600 flex-shrink-0" />
              <div className="relative flex-1 min-w-0">
                <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-8 pr-3 py-2.5 text-sm border border-white/10 rounded-lg bg-white/5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-400/60 transition-all w-full"
                />
              </div>
            </div>

            {/* Filters + buttons group */}
            <div className="flex items-center gap-2 w-full lg:w-auto flex-shrink-0">
              <div className="hidden lg:block w-px h-8 bg-white/5 flex-shrink-0" />

              {/* Pickup Date */}
              <div className="relative flex-1 lg:flex-none">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="pl-8 pr-3 py-2.5 text-sm border border-white/10 rounded-lg bg-white/5 text-gray-300 focus:outline-none focus:border-amber-400/60 transition-all [color-scheme:dark] w-full"
                />
              </div>

              {/* Size */}
              <div className="relative flex-1 lg:flex-none">
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="pl-3 pr-8 py-2.5 text-sm border border-white/10 rounded-lg bg-white/5 text-gray-300 focus:outline-none focus:border-amber-400/60 transition-all appearance-none cursor-pointer [color-scheme:dark] w-full"
                >
                  <option value="All">All Sizes</option>
                  <option value="FULL_LOAD">Full Load</option>
                  <option value="PARTIAL">Partial</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
              </div>

              <button
                onClick={fetchLoads}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500 border border-white/10 rounded-lg hover:bg-white/5 hover:text-gray-300 transition-all flex-shrink-0"
                title="Refresh"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-amber-400 text-[#0d1117] rounded-lg hover:bg-amber-300 active:scale-[0.98] transition-all disabled:opacity-60 flex-shrink-0"
              >
                <Search size={14} />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-4 mb-5 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>Failed to load data: {error}</span>
              <button
                onClick={fetchLoads}
                className="ml-auto text-red-500 hover:text-red-700 font-medium underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Stats Bar */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                {
                  label: "Available Now",
                  value: availableCount.toString(),
                  sub: "POSTED status",
                  color: "text-emerald-500",
                  bar: "bg-emerald-400",
                },
                {
                  label: "Avg. Rate",
                  value: formatPrice(avgPrice),
                  sub: "across results",
                  color: "text-amber-500",
                  bar: "bg-amber-400",
                },
                {
                  label: "Best Rate",
                  value: formatPrice(bestPrice),
                  sub: "highest in results",
                  color: "text-sky-500",
                  bar: "bg-sky-400",
                },
              ].map(({ label, value, sub, color, bar }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm flex items-center gap-4"
                >
                  <div className={`w-2 h-10 rounded-full ${bar} opacity-80`} />
                  <div>
                    <div className="text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                      {label}
                    </div>
                    <div className={`text-2xl font-bebas tracking-wider mt-0.5 ${color}`}>
                      {value}
                    </div>
                    <div className="text-[11px] text-gray-400">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 h-16 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800">
                    {sorted.length} {sorted.length === 1 ? "load" : "loads"} found
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={11} />
                    Live
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Sort by:</span>
                  {[
                    { key: "age", label: "Newest" },
                    { key: "rate", label: "Rate" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setSortBy(key)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        sortBy === key
                          ? "border-amber-400 bg-amber-400/10 text-amber-600 font-medium"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Package size={22} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">No loads found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try adjusting your search filters
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        <th className="w-10 px-5 py-3" />
                        <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                          Ref #
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                          Route
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                          Pickup
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                          Size
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                          Weight
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                          Commodity
                        </th>
                        <th className="text-right px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                          Rate
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                          Posted
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((load, i) => {
                        const status =
                          STATUS_CONFIG[load.status] ?? {
                            label: load.status ?? "—",
                            dot: "bg-gray-300",
                            text: "text-gray-500",
                            bg: "bg-gray-100",
                            border: "border-l-gray-200",
                          };
                        return (
                          <tr
                            key={load.id}
                            className={`group border-b border-gray-50 hover:bg-amber-400/[0.025] transition-colors cursor-pointer ${
                              i === sorted.length - 1 ? "border-b-0" : ""
                            }`}
                          >
                            <td className="px-5 py-3.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStar(load.id);
                                }}
                                className="text-gray-200 hover:text-amber-400 transition-colors"
                              >
                                <Star
                                  size={14}
                                  className={
                                    starred.has(load.id)
                                      ? "fill-amber-400 text-amber-400"
                                      : ""
                                  }
                                />
                              </button>
                            </td>
                            <td className="px-4 py-3.5 text-[12px] text-gray-400 font-mono">
                              {load.referenceNumber ?? "—"}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-medium text-gray-800 text-[13px]">
                                {load.pickupLocation ?? "—"}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-6 h-px bg-gray-200" />
                                <ArrowRight size={9} className="text-gray-300" />
                                <div className="text-[11px] text-gray-400">
                                  {load.deliveryLocation ?? "—"}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-[13px]">
                              {formatDate(load.pickUpDateTime)}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-md bg-gray-100 text-gray-600 whitespace-nowrap">
                                {SIZE_LABELS[load.size] ?? load.size ?? "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-[13px]">
                              {load.weight != null
                                ? `${load.weight.toLocaleString()} lbs`
                                : "—"}
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 text-[13px]">
                              {load.commodity ?? "—"}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <span className="font-semibold text-gray-900 font-mono">
                                {formatPrice(load.price)}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-md ${status.bg} ${status.text}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                                />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-gray-400 text-[12px] whitespace-nowrap">
                              {timeAgo(load.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
