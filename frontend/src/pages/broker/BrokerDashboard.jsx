import { useState, useEffect, useMemo } from "react";
import {
  Package, Globe, TrendingUp, Activity,
  RefreshCw, X, ChevronRight, Layers,
} from "lucide-react";
import BrokerSidebar from "../../components/sidebar/BrokerSidebar";
import EuropeHeatmap, { COUNTRY_NAMES } from "./EuropeHeatmap";

// ─── Mock data ────────────────────────────────────────────────────────────────

const BASE_LOADS = {
  276: 342, 250: 198, 724: 156, 380: 287, 616: 223, 528: 189,
  56: 134,  756: 98,  40: 87,   203: 76,  752: 112, 578: 67,
  208: 89,  246: 45,  620: 78,  348: 56,  642: 134, 703: 43,
  100: 67,  191: 34,  705: 28,  688: 89,  70: 23,   8: 19,
  807: 15,  499: 12,  804: 145, 112: 67,  428: 34,  440: 45,
  233: 23,  372: 56,  826: 234, 300: 98,  442: 67,  498: 45,
  352: 23,  470: 12,  792: 89,
};

function fluctuate(base) {
  return Object.fromEntries(
    Object.entries(base).map(([id, v]) => [
      id,
      Math.max(3, v + Math.floor(Math.random() * 18 - 9)),
    ])
  );
}

const LOAD_TYPES = ["All", "FTL", "LTL", "Partial"];

const LEGEND_STOPS = [
  { color: "#1e3a8a", label: "< 20 loads" },
  { color: "#2563eb", label: "20 – 60 loads" },
  { color: "#06b6d4", label: "60 – 140 loads" },
  { color: "#f97316", label: "140 – 240 loads" },
  { color: "#ef4444", label: "240+ loads" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function barColor(loads, max) {
  const r = loads / max;
  if (r < 0.12) return "#1e3a8a";
  if (r < 0.3)  return "#2563eb";
  if (r < 0.5)  return "#06b6d4";
  if (r < 0.72) return "#f97316";
  return "#ef4444";
}

function timeString(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, iconColor, bgColor, label, value, sub }) {
  return (
    <div className="bg-[#0f1623] border border-[#1c2538] rounded-xl px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
        <Icon size={17} className={iconColor} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-gray-600 tracking-[2px] uppercase mb-0.5">{label}</div>
        <div className="font-bebas text-[22px] text-white leading-none tracking-wider truncate">
          {value}
        </div>
        {sub && (
          <div className={`text-[10px] mt-0.5 ${iconColor}`}>{sub}</div>
        )}
      </div>
    </div>
  );
}

// ─── BrokerDashboard ─────────────────────────────────────────────────────────

export default function BrokerDashboard() {
  const [loadData, setLoadData]           = useState(() => fluctuate(BASE_LOADS));
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loadType, setLoadType]           = useState("All");
  const [isLive, setIsLive]               = useState(true);
  const [lastUpdate, setLastUpdate]       = useState(new Date());

  // Simulated live updates every 5 s
  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => {
      setLoadData(fluctuate(BASE_LOADS));
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(id);
  }, [isLive]);

  const totalLoads     = useMemo(() => Object.values(loadData).reduce((a, b) => a + b, 0), [loadData]);
  const activeCountries = useMemo(() => Object.values(loadData).filter(v => v > 0).length, [loadData]);
  const maxLoads       = useMemo(() => Math.max(...Object.values(loadData)), [loadData]);
  const avgLoads       = useMemo(() => (totalLoads / activeCountries).toFixed(1), [totalLoads, activeCountries]);

  const topCountry = useMemo(() => {
    const [id, loads] = Object.entries(loadData).sort((a, b) => b[1] - a[1])[0] ?? ["276", 0];
    return { id: +id, name: COUNTRY_NAMES[+id] ?? "—", loads };
  }, [loadData]);

  const topCountries = useMemo(
    () =>
      Object.entries(loadData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([id, loads]) => ({ id: +id, name: COUNTRY_NAMES[+id] ?? "Unknown", loads })),
    [loadData]
  );

  const selectedData = selectedCountry ? loadData[selectedCountry] ?? 0 : 0;

  return (
    <div className="flex h-screen bg-[#080c12] font-outfit">
      <BrokerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 h-[60px] border-b border-[#1c2538] flex-shrink-0 bg-[#0a0e17]">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold tracking-[2.5px] text-gray-700 uppercase">
              Broker Portal
            </span>
            <span className="text-gray-700">/</span>
            <span className="font-bebas text-xl tracking-[2px] text-white">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLive ? "bg-emerald-400 animate-pulse" : "bg-gray-600"
                }`}
              />
              <span className="text-[10px] tracking-wider text-gray-600 tabular-nums">
                {isLive ? `LIVE · ${timeString(lastUpdate)}` : "PAUSED"}
              </span>
            </div>
            <button
              onClick={() => setIsLive(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] tracking-wider border transition-all ${
                isLive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  : "border-gray-700/40 bg-gray-800/20 text-gray-500 hover:bg-gray-700/30"
              }`}
            >
              <RefreshCw
                size={11}
                className={isLive ? "animate-spin" : ""}
                style={isLive ? { animationDuration: "3s" } : {}}
              />
              {isLive ? "Live" : "Paused"}
            </button>
          </div>
        </div>

        {/* ── Stat Cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 px-6 py-3 border-b border-[#1c2538] flex-shrink-0 bg-[#0a0e17]">
          <StatCard
            icon={Package}
            iconColor="text-amber-400"
            bgColor="bg-amber-400/10"
            label="Total Active Loads"
            value={totalLoads.toLocaleString()}
          />
          <StatCard
            icon={Globe}
            iconColor="text-blue-400"
            bgColor="bg-blue-500/10"
            label="Active Countries"
            value={activeCountries}
          />
          <StatCard
            icon={TrendingUp}
            iconColor="text-red-400"
            bgColor="bg-red-500/10"
            label="Top Region"
            value={topCountry.name}
            sub={`${topCountry.loads} loads`}
          />
          <StatCard
            icon={Activity}
            iconColor="text-purple-400"
            bgColor="bg-purple-500/10"
            label="Avg / Country"
            value={avgLoads}
          />
        </div>

        {/* ── Main 3-column Area ───────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left: Filters + Legend */}
          <div className="w-52 flex-shrink-0 border-r border-[#1c2538] flex flex-col bg-[#090d14] overflow-y-auto">
            <div className="p-4 space-y-5">

              {/* Load Type */}
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-gray-700 uppercase mb-2">
                  Load Type
                </div>
                <div className="flex flex-col gap-0.5">
                  {LOAD_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setLoadType(t)}
                      className={`text-left px-3 py-1.5 rounded-md text-[12px] transition-all border ${
                        loadType === t
                          ? "bg-amber-400/12 text-amber-400 border-amber-400/30"
                          : "text-gray-600 hover:text-gray-300 hover:bg-white/[0.04] border-transparent"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-gray-700 uppercase mb-2">
                  Status
                </div>
                <div className="flex flex-col gap-0.5">
                  {["Active", "Pending", "Completed"].map(s => (
                    <button
                      key={s}
                      className="text-left px-3 py-1.5 rounded-md text-[12px] text-gray-600 hover:text-gray-300 hover:bg-white/[0.04] border border-transparent transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="border-t border-[#1c2538] pt-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Layers size={11} className="text-gray-600" />
                  <span className="text-[10px] font-semibold tracking-[2px] text-gray-700 uppercase">
                    Load Density
                  </span>
                </div>

                <div
                  className="w-full h-2.5 rounded-full mb-2"
                  style={{
                    background:
                      "linear-gradient(to right, #1e3a8a, #2563eb, #06b6d4, #f97316, #ef4444)",
                  }}
                />
                <div className="flex justify-between text-[9px] text-gray-700 tracking-[1.5px] mb-3">
                  <span>LOW</span>
                  <span>HIGH</span>
                </div>

                <div className="space-y-1.5">
                  {LEGEND_STOPS.map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[10px] text-gray-600">{label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#0c1822] border border-[#1c2538] flex-shrink-0" />
                    <span className="text-[10px] text-gray-600">No data</span>
                  </div>
                </div>
              </div>

              {/* Interaction hints */}
              <div className="border-t border-[#1c2538] pt-3 space-y-1">
                <p className="text-[9px] text-gray-700 tracking-wider">Scroll to zoom · Drag to pan</p>
                <p className="text-[9px] text-gray-700 tracking-wider">Click country for details</p>
              </div>
            </div>
          </div>

          {/* Center: Map */}
          <div className="flex-1 relative overflow-hidden bg-[#070b11]">
            {/* Dot grid texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #1c2538 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                opacity: 0.5,
              }}
            />
            {/* Subtle center glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(37,99,235,0.05) 0%, transparent 70%)",
              }}
            />
            <div className="absolute inset-0">
              <EuropeHeatmap
                loadData={loadData}
                maxLoads={maxLoads}
                onCountryClick={id =>
                  setSelectedCountry(prev => (prev === id ? null : id))
                }
              />
            </div>
          </div>

          {/* Right: Top Countries + Detail */}
          <div className="w-60 flex-shrink-0 border-l border-[#1c2538] flex flex-col bg-[#090d14]">
            <div className="px-4 pt-4 pb-2.5 border-b border-[#1c2538] flex-shrink-0">
              <div className="text-[10px] font-semibold tracking-[2px] text-gray-700 uppercase">
                Top Regions
              </div>
            </div>

            {/* Country list */}
            <div className="flex-1 overflow-y-auto min-h-0 py-1">
              {topCountries.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCountry(prev => (prev === c.id ? null : c.id))}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all border-l-2 ${
                    selectedCountry === c.id
                      ? "bg-amber-400/10 border-l-amber-400"
                      : "border-l-transparent hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="text-[11px] font-bebas text-gray-700 w-4 text-right leading-none flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-[12px] truncate ${
                        selectedCountry === c.id ? "text-amber-400" : "text-gray-400"
                      }`}
                    >
                      {c.name}
                    </div>
                    <div className="mt-1 h-[3px] rounded-full bg-[#1c2538]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(c.loads / topCountries[0].loads) * 100}%`,
                          backgroundColor: barColor(c.loads, maxLoads),
                        }}
                      />
                    </div>
                  </div>
                  <span className="font-bebas text-[15px] text-white leading-none flex-shrink-0">
                    {c.loads}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected country detail panel */}
            {selectedCountry ? (
              <div className="border-t border-[#1c2538] p-4 flex-shrink-0 bg-[#0a0f18]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-[10px] text-gray-600 tracking-[2px] uppercase mb-0.5">
                      Selected Region
                    </div>
                    <div className="text-[13px] font-semibold text-amber-400 truncate max-w-[150px]">
                      {COUNTRY_NAMES[selectedCountry] ?? "Unknown"}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCountry(null)}
                    className="text-gray-700 hover:text-gray-400 transition-colors mt-0.5"
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-bebas text-4xl text-white leading-none">
                    {selectedData.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-600 tracking-wider">loads</span>
                </div>

                {/* Load type breakdown */}
                <div className="space-y-2 mb-4">
                  {[
                    { label: "FTL", frac: 0.45, color: "#fbbf24" },
                    { label: "LTL", frac: 0.37, color: "#06b6d4" },
                    { label: "Partial", frac: 0.18, color: "#a78bfa" },
                  ].map(({ label, frac, color }) => {
                    const count = Math.floor(selectedData * frac);
                    return (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-600 w-11">{label}</span>
                        <div className="flex-1 h-[3px] rounded-full bg-[#1c2538]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${frac * 100}%`, backgroundColor: color }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-400 tabular-nums">{count}</span>
                      </div>
                    );
                  })}
                </div>

                <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-400/10 border border-amber-400/30 rounded-lg text-amber-400 text-[11px] tracking-[1.5px] uppercase hover:bg-amber-400/18 transition-all">
                  View All Loads
                  <ChevronRight size={12} />
                </button>
              </div>
            ) : (
              <div className="border-t border-[#1c2538] p-4 flex-shrink-0">
                <p className="text-[10px] text-gray-700 text-center tracking-wider">
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
