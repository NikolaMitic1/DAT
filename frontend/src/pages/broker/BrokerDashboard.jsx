import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Globe, TrendingUp, Activity,
  RefreshCw, X, ChevronRight, Layers,
  AlertCircle,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import BrokerSidebar from "../../components/sidebar/BrokerSidebar";
import EuropeHeatmap, { COUNTRY_NAMES } from "./EuropeHeatmap";

// ─── Country detection ────────────────────────────────────────────────────────
// Ordered by name length desc so longer names match first (e.g. "north macedonia" before "macedonia")

const COUNTRY_LOOKUP = [
  ["north macedonia", 807],
  ["united kingdom", 826],
  ["bosnia and herzegovina", 70],
  ["bosnia & herzegovina", 70],
  ["bosnia", 70],
  ["czech republic", 203],
  ["san marino", 674],
  ["liechtenstein", 438],
  ["montenegro", 499],
  ["luxembourg", 442],
  ["switzerland", 756],
  ["netherlands", 528],
  ["deutschland", 276],
  ["liechtenstein", 438],
  ["bulgaria", 100],
  ["slovakia", 703],
  ["slovenia", 705],
  ["portugal", 620],
  ["croatia", 191],
  ["hrvatska", 191],
  ["moldova", 498],
  ["ukraine", 804],
  ["belarus", 112],
  ["denmark", 208],
  ["finland", 246],
  ["ireland", 372],
  ["albania", 8],
  ["andorra", 20],
  ["austria", 40],
  ["belgium", 56],
  ["cyprus", 196],
  ["estonia", 233],
  ["georgia", 268],
  ["germany", 276],
  ["greece", 300],
  ["hungary", 348],
  ["iceland", 352],
  ["italy", 380],
  ["italia", 380],
  ["latvia", 428],
  ["lithuania", 440],
  ["malta", 470],
  ["monaco", 492],
  ["norway", 578],
  ["poland", 616],
  ["polska", 616],
  ["romania", 642],
  ["russia", 643],
  ["serbia", 688],
  ["schweiz", 756],
  ["sweden", 752],
  ["sverige", 752],
  ["turkey", 792],
  ["turkiye", 792],
  ["england", 826],
  ["britain", 826],
  ["scotland", 826],
  ["france", 250],
  ["espana", 724],
  ["spain", 724],
  ["holland", 528],
].sort((a, b) => b[0].length - a[0].length);

function detectCountryId(location) {
  if (!location) return null;
  const lower = location.toLowerCase().trim();
  const parts = lower.split(",").map(p => p.trim());

  for (let i = parts.length - 1; i >= 0; i--) {
    for (const [name, id] of COUNTRY_LOOKUP) {
      if (parts[i] === name || parts[i].includes(name)) return id;
    }
  }
  for (const [name, id] of COUNTRY_LOOKUP) {
    if (lower.includes(name)) return id;
  }
  return null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES = new Set(["POSTED", "BOOKED", "IN_TRANSPORT"]);

const SIZE_OPTIONS = [
  { value: "ALL",        label: "All" },
  { value: "FULL_LOAD",  label: "Full Load" },
  { value: "PARTIAL",    label: "Partial" },
];

const STATUS_OPTIONS = [
  { value: "ALL",          label: "All Active" },
  { value: "POSTED",       label: "Posted" },
  { value: "BOOKED",       label: "Booked" },
  { value: "IN_TRANSPORT", label: "In Transport" },
];

const DIRECTION_OPTIONS = [
  { value: "PICKUP",   label: "Origin" },
  { value: "DELIVERY", label: "Destination" },
];

const LEGEND_STOPS = [
  { color: "#1e3a8a", label: "1 – 5 loads" },
  { color: "#2563eb", label: "5 – 15 loads" },
  { color: "#06b6d4", label: "15 – 30 loads" },
  { color: "#f97316", label: "30 – 50 loads" },
  { color: "#ef4444", label: "50+ loads" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function barColor(loads) {
  if (loads < 5)  return "#1e3a8a";
  if (loads < 15) return "#2563eb";
  if (loads < 30) return "#06b6d4";
  if (loads < 50) return "#f97316";
  return "#ef4444";
}

function timeString(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, iconColor, bgColor, label, value, sub }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
        <Icon size={17} className={iconColor} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-gray-400 tracking-[2px] uppercase mb-0.5">{label}</div>
        <div className="font-bebas text-[22px] text-gray-900 leading-none tracking-wider truncate">
          {value}
        </div>
        {sub && <div className={`text-[10px] mt-0.5 ${iconColor}`}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── FilterButton ────────────────────────────────────────────────────────────

function FilterButton({ options, value, onChange }) {
  return (
    <div className="flex flex-col gap-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-left px-3 py-1.5 rounded-md text-[12px] transition-all border ${
            value === opt.value
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-transparent"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── BrokerDashboard ─────────────────────────────────────────────────────────

export default function BrokerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();

  const [allLoads, setAllLoads]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [lastUpdate, setLastUpdate]       = useState(null);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [sizeFilter, setSizeFilter]       = useState("ALL");
  const [statusFilter, setStatusFilter]   = useState("ALL");
  const [direction, setDirection]         = useState("PICKUP");

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchLoads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = user?.token ?? localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const res = await fetch("/api/loads/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) { navigate("/login"); return; }
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data = await res.json();
      setAllLoads(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => { fetchLoads(); }, [fetchLoads]);

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filteredLoads = useMemo(() => {
    return allLoads.filter(l => {
      if (!ACTIVE_STATUSES.has(l.status)) return false;
      if (statusFilter !== "ALL" && l.status !== statusFilter) return false;
      if (sizeFilter !== "ALL" && l.size !== sizeFilter) return false;
      return true;
    });
  }, [allLoads, sizeFilter, statusFilter]);

  // ── Build heatmap data from filtered loads ────────────────────────────────

  const loadData = useMemo(() => {
    const counts = {};
    for (const load of filteredLoads) {
      const loc = direction === "PICKUP" ? load.pickupLocation : load.deliveryLocation;
      const id  = detectCountryId(loc);
      if (id) counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  }, [filteredLoads, direction]);

  // ── Derived stats ─────────────────────────────────────────────────────────

  const totalLoads      = filteredLoads.length;
  const activeCountries = Object.keys(loadData).length;
  const maxLoads        = Object.values(loadData).length > 0 ? Math.max(...Object.values(loadData)) : 0;

  const topCountry = useMemo(() => {
    if (!Object.keys(loadData).length) return null;
    const [id, loads] = Object.entries(loadData).sort((a, b) => b[1] - a[1])[0];
    return { id: +id, name: COUNTRY_NAMES[+id] ?? "Unknown", loads };
  }, [loadData]);

  const sizeBreakdown = useMemo(() => {
    const full    = filteredLoads.filter(l => l.size === "FULL_LOAD").length;
    const partial = filteredLoads.filter(l => l.size === "PARTIAL").length;
    return { full, partial };
  }, [filteredLoads]);

  const topCountries = useMemo(() =>
    Object.entries(loadData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([id, loads]) => ({ id: +id, name: COUNTRY_NAMES[+id] ?? "Unknown", loads })),
    [loadData]
  );

  const selectedCountryLoads = selectedCountry ? (loadData[selectedCountry] ?? 0) : 0;
  const selectedCountryLoadsAll = useMemo(() => {
    if (!selectedCountry) return [];
    return filteredLoads.filter(l => {
      const loc = direction === "PICKUP" ? l.pickupLocation : l.deliveryLocation;
      return detectCountryId(loc) === selectedCountry;
    });
  }, [selectedCountry, filteredLoads, direction]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-gray-50 font-outfit">
      <BrokerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 h-[60px] border-b border-gray-200 flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold tracking-[2.5px] text-gray-400 uppercase">
              Broker Portal
            </span>
            <span className="text-gray-300 text-base">/</span>
            <span className="font-bebas text-xl tracking-[2px] text-gray-800">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="text-[10px] tracking-wider text-gray-400 tabular-nums">
                Updated at {timeString(lastUpdate)}
              </span>
            )}
            <button
              onClick={fetchLoads}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] tracking-wider border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-400 transition-all disabled:opacity-50"
            >
              <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Error banner ───────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-red-50 border-b border-red-200 flex-shrink-0">
            <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
            <span className="text-[12px] text-red-600">{error}</span>
          </div>
        )}

        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 px-6 py-3 border-b border-gray-200 flex-shrink-0 bg-white">
          <StatCard
            icon={Package}
            iconColor="text-amber-600"
            bgColor="bg-amber-50"
            label="Active Loads"
            value={loading ? "—" : totalLoads.toLocaleString()}
          />
          <StatCard
            icon={Globe}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
            label="Countries on Map"
            value={loading ? "—" : activeCountries}
          />
          <StatCard
            icon={TrendingUp}
            iconColor="text-red-500"
            bgColor="bg-red-50"
            label="Top Region"
            value={loading ? "—" : (topCountry?.name ?? "—")}
            sub={topCountry ? `${topCountry.loads} loads` : undefined}
          />
          <StatCard
            icon={Activity}
            iconColor="text-purple-600"
            bgColor="bg-purple-50"
            label="Full Load / Partial"
            value={loading ? "—" : `${sizeBreakdown.full} / ${sizeBreakdown.partial}`}
          />
        </div>

        {/* ── Main 3-column ──────────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left: Filters + Legend */}
          <div className="w-52 flex-shrink-0 border-r border-gray-100 flex flex-col bg-white overflow-y-auto">
            <div className="p-4 space-y-5">

              {/* Direction toggle */}
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-gray-400 uppercase mb-2">
                  Show by
                </div>
                <div className="flex rounded-md overflow-hidden border border-gray-200">
                  {DIRECTION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDirection(opt.value)}
                      className={`flex-1 py-1.5 text-[11px] tracking-wide transition-all ${
                        direction === opt.value
                          ? "bg-amber-50 text-amber-700"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size filter */}
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-gray-400 uppercase mb-2">
                  Load Size
                </div>
                <FilterButton options={SIZE_OPTIONS} value={sizeFilter} onChange={setSizeFilter} />
              </div>

              {/* Status filter */}
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-gray-400 uppercase mb-2">
                  Status
                </div>
                <FilterButton options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
              </div>

              {/* Legend */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Layers size={11} className="text-gray-400" />
                  <span className="text-[10px] font-semibold tracking-[2px] text-gray-400 uppercase">
                    Density
                  </span>
                </div>
                <div
                  className="w-full h-2.5 rounded-full mb-2"
                  style={{
                    background:
                      "linear-gradient(to right, #1e3a8a, #2563eb, #06b6d4, #f97316, #ef4444)",
                  }}
                />
                <div className="flex justify-between text-[9px] text-gray-400 tracking-[1.5px] mb-3">
                  <span>LOW</span>
                  <span>HIGH</span>
                </div>
                <div className="space-y-1.5">
                  {LEGEND_STOPS.map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[10px] text-gray-500">{label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-gray-100 border border-gray-200 flex-shrink-0" />
                    <span className="text-[10px] text-gray-500">No loads</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-1">
                <p className="text-[9px] text-gray-400 tracking-wider">Scroll to zoom · Drag to pan</p>
                <p className="text-[9px] text-gray-400 tracking-wider">Click country for details</p>
              </div>
            </div>
          </div>

          {/* Center: Map */}
          <div className="flex-1 relative overflow-hidden bg-gray-50">
            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
                <div className="w-7 h-7 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-[10px] tracking-[3px] text-gray-400 uppercase">
                  Loading loads
                </span>
              </div>
            )}

            <div className="absolute inset-0">
              <EuropeHeatmap
                loadData={loadData}
                maxLoads={maxLoads}
                onCountryClick={id => setSelectedCountry(prev => prev === id ? null : id)}
              />
            </div>
          </div>

          {/* Right: Top Countries + Detail */}
          <div className="w-60 flex-shrink-0 border-l border-gray-100 flex flex-col bg-white">
            <div className="px-4 pt-4 pb-2.5 border-b border-gray-100 flex-shrink-0">
              <div className="text-[10px] font-semibold tracking-[2px] text-gray-400 uppercase">
                Top Regions
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 py-1">
              {!loading && topCountries.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
                  <Globe size={24} className="text-gray-300" />
                  <p className="text-[11px] text-gray-400 text-center">
                    No loads match the current filters
                  </p>
                </div>
              )}
              {topCountries.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCountry(prev => prev === c.id ? null : c.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all border-l-2 ${
                    selectedCountry === c.id
                      ? "bg-amber-50 border-l-amber-500"
                      : "border-l-transparent hover:bg-gray-50"
                  }`}
                >
                  <span className="text-[11px] font-bebas text-gray-400 w-4 text-right leading-none flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[12px] truncate ${selectedCountry === c.id ? "text-amber-700" : "text-gray-700"}`}>
                      {c.name}
                    </div>
                    <div className="mt-1 h-[3px] rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${topCountries[0].loads > 0 ? (c.loads / topCountries[0].loads) * 100 : 0}%`,
                          backgroundColor: barColor(c.loads),
                        }}
                      />
                    </div>
                  </div>
                  <span className="font-bebas text-[15px] text-gray-900 leading-none flex-shrink-0">
                    {c.loads}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected country detail */}
            {selectedCountry ? (
              <div className="border-t border-gray-100 p-4 flex-shrink-0 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-[10px] text-gray-400 tracking-[2px] uppercase mb-0.5">
                      Selected Region
                    </div>
                    <div className="text-[13px] font-semibold text-amber-700 truncate max-w-[150px]">
                      {COUNTRY_NAMES[selectedCountry] ?? "Unknown"}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCountry(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-bebas text-4xl text-gray-900 leading-none">
                    {selectedCountryLoads}
                  </span>
                  <span className="text-[10px] text-gray-400 tracking-wider">
                    {direction === "PICKUP" ? "origin loads" : "delivery loads"}
                  </span>
                </div>

                {/* Breakdown by size */}
                {selectedCountryLoadsAll.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {[
                      {
                        label: "Full Load",
                        count: selectedCountryLoadsAll.filter(l => l.size === "FULL_LOAD").length,
                        color: "#d97706",
                      },
                      {
                        label: "Partial",
                        count: selectedCountryLoadsAll.filter(l => l.size === "PARTIAL").length,
                        color: "#0891b2",
                      },
                    ].map(({ label, count, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 w-16">{label}</span>
                        <div className="flex-1 h-[3px] rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: selectedCountryLoads > 0
                                ? `${(count / selectedCountryLoads) * 100}%`
                                : "0%",
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-600 tabular-nums">{count}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => navigate(`/broker/search-loads`)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-[11px] tracking-[1.5px] uppercase hover:bg-amber-100 transition-all"
                >
                  View All Loads
                  <ChevronRight size={12} />
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-100 p-4 flex-shrink-0">
                <p className="text-[10px] text-gray-400 text-center tracking-wider">
                  Click a country to inspect
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
