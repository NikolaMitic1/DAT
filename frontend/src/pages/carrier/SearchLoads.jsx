import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CarrierSidebar from "../../components/sidebar/CarrierSidebar";
import { AuthContext } from "../../context/AuthContext";
import {
  Search,
  MapPin,
  Calendar,
  ChevronDown,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
} from "lucide-react";

const SIZE_LABELS = {
  FULL_LOAD: "Full Load",
  PARTIAL: "Partial",
};

const STATUS_COLORS = {
  POSTED: "bg-emerald-100 text-emerald-700",
  BOOKED: "bg-blue-100 text-blue-700",
  IN_TRANSPORT: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
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
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatPrice(price) {
  if (price == null) return "—";
  return "$" + price.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

export default function SearchLoads() {
  const { user, logout } = useContext(AuthContext);
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
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("/api/loads/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setLoads(data);
      setFiltered(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoads();
  }, []);

  const handleSearch = () => {
    let result = [...loads];

    if (origin.trim()) {
      result = result.filter((l) =>
        l.pickupLocation?.toLowerCase().includes(origin.trim().toLowerCase()),
      );
    }
    if (destination.trim()) {
      result = result.filter((l) =>
        l.deliveryLocation
          ?.toLowerCase()
          .includes(destination.trim().toLowerCase()),
      );
    }
    if (pickupDate) {
      result = result.filter((l) => {
        if (!l.pickUpDateTime) return false;
        return l.pickUpDateTime.startsWith(pickupDate);
      });
    }
    if (sizeFilter !== "All") {
      result = result.filter((l) => l.size === sizeFilter);
    }

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

  const avgPrice =
    filtered.length > 0
      ? filtered.reduce((s, l) => s + (l.price ?? 0), 0) / filtered.length
      : 0;
  const bestPrice =
    filtered.length > 0 ? Math.max(...filtered.map((l) => l.price ?? 0)) : 0;

  return (
    <div className="flex h-screen bg-[#f8f9fb] font-outfit">
      <CarrierSidebar />

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
                <MapPin
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="City, State or ZIP"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all w-full"
                />
              </div>
            </div>

            <ArrowRight
              size={16}
              className="text-gray-300 mb-2.5 flex-shrink-0"
            />

            {/* Destination */}
            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                Destination
              </label>
              <div className="relative">
                <MapPin
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="City, State or ZIP"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>
            </div>

            {/* Size */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                Size
              </label>
              <div className="relative">
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="All">All Sizes</option>
                  <option value="FULL_LOAD">Full Load</option>
                  <option value="PARTIAL">Partial</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-end gap-2 ml-auto">
              <button
                onClick={fetchLoads}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-all"
                title="Refresh"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-amber-400 text-[#0d1117] rounded-lg hover:bg-amber-300 active:scale-[0.98] transition-all disabled:opacity-60"
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
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-4 mb-4 text-sm text-red-600">
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

          {/* Loading skeleton */}
          {loading && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 px-5 py-4 border-b border-gray-50 last:border-b-0"
                >
                  <div className="w-4 h-4 bg-gray-100 rounded" />
                  <div className="flex-1 h-4 bg-gray-100 rounded" />
                  <div className="w-32 h-4 bg-gray-100 rounded" />
                  <div className="w-20 h-4 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800">
                    {sorted.length} {sorted.length === 1 ? "load" : "loads"}{" "}
                    found
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
                    <Search size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">No loads found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try adjusting your search filters
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="w-8 px-5 py-3" />
                          <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                            Ref #
                          </th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                            Origin
                          </th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                            Destination
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
                        {sorted.map((load, i) => (
                          <tr
                            key={load.id}
                            className={`group border-b border-gray-50 hover:bg-amber-400/[0.03] transition-colors cursor-pointer ${
                              i === sorted.length - 1 ? "border-b-0" : ""
                            }`}
                          >
                            <td className="px-5 py-3.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStar(load.id);
                                }}
                                className="text-gray-300 hover:text-amber-400 transition-colors"
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
                              <div className="font-medium text-gray-800">
                                {load.pickupLocation ?? "—"}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-medium text-gray-800">
                                {load.deliveryLocation ?? "—"}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                              {formatDate(load.pickUpDateTime)}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-gray-100 text-gray-600">
                                {SIZE_LABELS[load.size] ?? load.size ?? "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                              {load.weight != null
                                ? `${load.weight.toLocaleString()} lbs`
                                : "—"}
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 text-[13px]">
                              {load.commodity ?? "—"}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <span className="font-semibold text-gray-900">
                                {formatPrice(load.price)}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded ${STATUS_COLORS[load.status] ?? "bg-gray-100 text-gray-600"}`}
                              >
                                {load.status ?? "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-gray-400 text-[12px] whitespace-nowrap">
                              {timeAgo(load.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Stats Bar */}
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Avg. Rate",
                        value: formatPrice(avgPrice),
                        icon: TrendingUp,
                        color: "text-emerald-600",
                      },
                      {
                        label: "Loads Available",
                        value: sorted.length.toString(),
                        icon: Search,
                        color: "text-amber-500",
                      },
                      {
                        label: "Best Rate",
                        value: formatPrice(bestPrice),
                        icon: Star,
                        color: "text-blue-500",
                      },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div
                        key={label}
                        className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4 shadow-sm"
                      >
                        <div className={`${color} opacity-70`}>
                          <Icon size={20} strokeWidth={1.8} />
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
                            {label}
                          </div>
                          <div
                            className={`text-xl font-bebas tracking-widest mt-0.5 ${color}`}
                          >
                            {value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
