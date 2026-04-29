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
  RefreshCw,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  X,
  CheckCircle,
  Truck,
  DollarSign,
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

  // Offer modal state
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [trucksLoading, setTrucksLoading] = useState(false);
  const [offerTruckId, setOfferTruckId] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [offerError, setOfferError] = useState(null);
  const [offerSuccess, setOfferSuccess] = useState(false);

  const getToken = () => user?.token ?? localStorage.getItem("token");

  const fetchLoads = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
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

  const fetchTrucks = async () => {
    setTrucksLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/trucks/my-trucks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setTrucks(await res.json());
    } catch (_) {
      // trucks will just be empty
    } finally {
      setTrucksLoading(false);
    }
  };

  useEffect(() => {
    fetchLoads();
    fetchTrucks();
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
        l.deliveryLocation?.toLowerCase().includes(destination.trim().toLowerCase()),
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

  const openOfferModal = (load) => {
    setSelectedLoad(load);
    setOfferPrice(load.price != null ? String(load.price) : "");
    setOfferTruckId("");
    setOfferError(null);
    setOfferSuccess(false);
  };

  const closeOfferModal = () => {
    setSelectedLoad(null);
    setOfferError(null);
    setOfferSuccess(false);
  };

  const submitOffer = async () => {
    if (!offerTruckId || !offerPrice) return;
    setSubmitting(true);
    setOfferError(null);
    try {
      const token = getToken();
      const res = await fetch("/api/offers/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loadId: selectedLoad.id,
          truckId: offerTruckId,
          offeredPrice: parseFloat(offerPrice),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }

      setOfferSuccess(true);
    } catch (err) {
      setOfferError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const availableTrucks = trucks.filter((t) => t.truckStatus === "AVAILABLE");

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
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">

            {/* Route group: Origin → Destination */}
            <div className="flex items-center gap-2 flex-1 min-w-0 w-full lg:w-auto">
              <div className="relative flex-1 min-w-0">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all w-full"
                />
              </div>
              <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
              <div className="relative flex-1 min-w-0">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all w-full"
                />
              </div>
            </div>

            {/* Filters + buttons group */}
            <div className="flex items-center gap-2 w-full lg:w-auto flex-shrink-0">
              <div className="hidden lg:block w-px h-8 bg-gray-100 flex-shrink-0" />

              {/* Pickup Date */}
              <div className="relative flex-1 lg:flex-none">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all w-full"
                />
              </div>

              {/* Size */}
              <div className="relative flex-1 lg:flex-none">
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all appearance-none cursor-pointer w-full"
                >
                  <option value="All">All Sizes</option>
                  <option value="FULL_LOAD">Full Load</option>
                  <option value="PARTIAL">Partial</option>
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <button
                onClick={fetchLoads}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-all flex-shrink-0"
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
                  {/* Stats Bar */}
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    {[
                      { label: "Available",  value: sorted.length.toString(),  icon: Search,     color: "text-amber-500" },
                      { label: "Avg. Rate",  value: formatPrice(avgPrice),     icon: TrendingUp,  color: "text-emerald-600" },
                      { label: "Best Rate",  value: formatPrice(bestPrice),    icon: Star,        color: "text-blue-500" },
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

                  {/* Table */}
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                          <th className="w-8 px-5 py-3" />
                          <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Ref #</th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Route</th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Pickup</th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Size</th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Weight</th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Commodity</th>
                          <th className="text-right px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Rate</th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Posted</th>
                          <th className="w-24 px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map((load, i) => (
                          <tr
                            key={load.id}
                            onClick={() => openOfferModal(load)}
                            className={`group border-b border-gray-50 hover:bg-amber-400/[0.03] transition-colors cursor-pointer ${
                              i === sorted.length - 1 ? "border-b-0" : ""
                            }`}
                          >
                            <td className="px-5 py-3.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleStar(load.id); }}
                                className="text-gray-300 hover:text-amber-400 transition-colors"
                              >
                                <Star size={14} className={starred.has(load.id) ? "fill-amber-400 text-amber-400" : ""} />
                              </button>
                            </td>
                            <td className="px-4 py-3.5 text-[12px] text-gray-400 font-mono">
                              {load.referenceNumber ?? "—"}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-medium text-gray-800 text-[13px]">{load.pickupLocation ?? "—"}</div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-6 h-px bg-gray-200" />
                                <ArrowRight size={9} className="text-gray-300" />
                                <div className="text-[11px] text-gray-400">{load.deliveryLocation ?? "—"}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-[13px]">
                              {formatDate(load.pickUpDateTime)}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-gray-100 text-gray-600 whitespace-nowrap">
                                {SIZE_LABELS[load.size] ?? load.size ?? "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-[13px]">
                              {load.weight != null ? `${load.weight.toLocaleString()} lbs` : "—"}
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 text-[13px]">
                              {load.commodity ?? "—"}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <span className="font-semibold text-gray-900 font-mono">
                                {formatPrice(load.price)}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-gray-400 text-[12px] whitespace-nowrap">
                              {timeAgo(load.createdAt)}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={(e) => { e.stopPropagation(); openOfferModal(load); }}
                                className="opacity-0 group-hover:opacity-100 text-[11px] px-3 py-1.5 rounded-lg bg-amber-400 text-[#0d1117] font-semibold transition-all hover:bg-amber-300 whitespace-nowrap"
                              >
                                Send Offer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {selectedLoad && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={closeOfferModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] text-gray-400 font-mono mb-1">{selectedLoad.referenceNumber ?? "—"}</div>
                <div className="text-base font-semibold text-gray-900 leading-snug">
                  {selectedLoad.pickupLocation ?? "—"}
                  <span className="mx-2 text-gray-300">→</span>
                  {selectedLoad.deliveryLocation ?? "—"}
                </div>
              </div>
              <button onClick={closeOfferModal} className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5 flex-shrink-0">
                <X size={20} />
              </button>
            </div>

            {/* Load Details */}
            <div className="px-6 py-4 bg-gray-50/60 grid grid-cols-3 gap-3 text-sm border-b border-gray-100">
              {[
                { label: "Pickup",    value: formatDate(selectedLoad.pickUpDateTime) },
                { label: "Delivery",  value: formatDate(selectedLoad.deliveryDateTime) },
                { label: "Size",      value: SIZE_LABELS[selectedLoad.size] ?? selectedLoad.size ?? "—" },
                { label: "Weight",    value: selectedLoad.weight != null ? `${selectedLoad.weight.toLocaleString()} lbs` : "—" },
                { label: "Commodity", value: selectedLoad.commodity ?? "—" },
                { label: "Asking Rate", value: formatPrice(selectedLoad.price), highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label}>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
                  <div className={`text-[13px] font-medium ${highlight ? "text-amber-600" : "text-gray-700"}`}>{value}</div>
                </div>
              ))}
            </div>

            {/* Form or Success */}
            {offerSuccess ? (
              <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle size={24} className="text-emerald-500" />
                </div>
                <div className="font-semibold text-gray-800">Offer Submitted!</div>
                <div className="text-sm text-gray-500">Your offer has been sent to the broker.</div>
                <button
                  onClick={closeOfferModal}
                  className="mt-2 px-8 py-2.5 bg-amber-400 text-[#0d1117] text-sm font-semibold rounded-lg hover:bg-amber-300 transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="px-6 py-5">
                <div className="text-sm font-semibold text-gray-700 mb-4">Send Offer</div>

                {/* Truck Select */}
                <div className="mb-4">
                  <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <Truck size={12} />
                    Select Truck
                  </label>
                  {trucksLoading ? (
                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                  ) : availableTrucks.length === 0 ? (
                    <div className="text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
                      No available trucks. Go to <span className="font-medium text-gray-600">My Trucks</span> and make sure at least one truck is set to Available.
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={offerTruckId}
                        onChange={(e) => setOfferTruckId(e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 appearance-none cursor-pointer"
                      >
                        <option value="">Choose a truck...</option>
                        {availableTrucks.map((truck) => (
                          <option key={truck.id} value={truck.id}>
                            {truck.truckNumber} — {truck.make} {truck.model}{truck.year ? ` (${truck.year})` : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* Price Input */}
                <div className="mb-5">
                  <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <DollarSign size={12} />
                    Your Offered Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">$</span>
                    <input
                      type="number"
                      min={0}
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder={selectedLoad.price != null ? String(selectedLoad.price) : "Enter amount"}
                      className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                    />
                  </div>
                </div>

                {/* Error */}
                {offerError && (
                  <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                    <span>{offerError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={closeOfferModal}
                    className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitOffer}
                    disabled={submitting || !offerTruckId || !offerPrice || trucksLoading || availableTrucks.length === 0}
                    className="flex-1 py-2.5 text-sm font-semibold bg-amber-400 text-[#0d1117] rounded-lg hover:bg-amber-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Sending..." : "Send Offer"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
