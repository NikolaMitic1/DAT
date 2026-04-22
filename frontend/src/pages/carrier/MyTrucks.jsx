import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CarrierSidebar from "../../components/sidebar/CarrierSidebar";
import { AuthContext } from "../../context/AuthContext";
import {
  Truck,
  Plus,
  Search,
  MapPin,
  Calendar,
  Gauge,
  Weight,
  X,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Ruler,
  Hash,
  Wrench,
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
} from "lucide-react";

const EQUIPMENT_LABELS = {
  DRY_VAN: "Dry Van",
  REEFER: "Reefer",
  FLATBED: "Flatbed",
  STEP_DECK: "Step Deck",
  POWER_ONLY: "Power Only",
  BOX_TRUCK: "Box Truck",
  HOTSHOT: "Hotshot",
};

const STATUS_CONFIG = {
  AVAILABLE: {
    label: "Available",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  ON_LOAD: {
    label: "On Load",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  OUT_OF_SERVICE: {
    label: "Out of Service",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    ring: "ring-red-200",
  },
  MAINTENANCE: {
    label: "Maintenance",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    ring: "ring-blue-200",
  },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const EMPTY_FORM = {
  truckNumber: "",
  licensePlate: "",
  make: "",
  model: "",
  year: new Date().getFullYear(),
  mileage: "",
  equipment: "DRY_VAN",
  maxWeight: "",
  truckLength: "",
  currentLocation: "",
  availableFrom: "",
  truckStatus: "AVAILABLE",
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    ring: "ring-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className={`${color} opacity-70`}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <div>
        <div className="text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">
          {label}
        </div>
        <div className={`text-2xl font-bebas tracking-widest mt-0.5 ${color}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

function TruckCard({ truck, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete truck ${truck.truckNumber}?`)) return;
    setDeleting(true);
    try {
      await onDelete(truck.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-amber-200 transition-all duration-200 group">
      {/* Card top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bebas text-2xl tracking-[2px] text-gray-900 leading-none">
                {truck.make ?? "—"} {truck.model ?? ""}
              </span>
              <span className="text-sm text-gray-400 font-light">
                {truck.year || ""}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-gray-400">
              <Hash size={11} />
              <span className="font-mono">{truck.truckNumber ?? "—"}</span>
              <span className="text-gray-200">·</span>
              <span className="font-mono">{truck.licensePlate ?? "—"}</span>
            </div>
          </div>
          <StatusBadge status={truck.truckStatus} />
        </div>

        {/* Equipment badge */}
        {truck.equipment && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600">
              <Package size={11} />
              {EQUIPMENT_LABELS[truck.equipment] ?? truck.equipment}
            </span>
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
          {truck.maxWeight > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Weight size={12} className="text-gray-400 flex-shrink-0" />
              <span>{truck.maxWeight.toLocaleString()} lbs</span>
            </div>
          )}
          {truck.truckLength > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Ruler size={12} className="text-gray-400 flex-shrink-0" />
              <span>{truck.truckLength} ft</span>
            </div>
          )}
          {truck.mileage > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Gauge size={12} className="text-gray-400 flex-shrink-0" />
              <span>{truck.mileage.toLocaleString()} mi</span>
            </div>
          )}
          {truck.currentLocation && (
            <div className="flex items-center gap-2 text-gray-600 col-span-2">
              <MapPin size={12} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{truck.currentLocation}</span>
            </div>
          )}
          {truck.availableFrom && (
            <div className="flex items-center gap-2 text-gray-600 col-span-2">
              <Calendar size={12} className="text-gray-400 flex-shrink-0" />
              <span>Available {formatDate(truck.availableFrom)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <XCircle size={12} />
          )}
          {deleting ? "Deleting..." : "Remove"}
        </button>
      </div>
    </div>
  );
}

function AddTruckModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...form,
        year: parseInt(form.year, 10),
        mileage: parseInt(form.mileage, 10) || 0,
        maxWeight: parseFloat(form.maxWeight) || 0,
        truckLength: parseFloat(form.truckLength) || 0,
        availableFrom: form.availableFrom ? form.availableFrom + "T00:00:00" : null,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all";
  const labelCls =
    "block text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-bebas text-2xl tracking-[2px] text-gray-900">
              Add New Truck
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Fill in the details to register a new truck
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-2 gap-x-5 gap-y-4">
            <div>
              <label className={labelCls}>Truck Number *</label>
              <input
                className={inputCls}
                placeholder="e.g. TRK-001"
                value={form.truckNumber}
                onChange={set("truckNumber")}
                required
              />
            </div>
            <div>
              <label className={labelCls}>License Plate *</label>
              <input
                className={inputCls}
                placeholder="e.g. ABC-1234"
                value={form.licensePlate}
                onChange={set("licensePlate")}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Make *</label>
              <input
                className={inputCls}
                placeholder="e.g. Freightliner"
                value={form.make}
                onChange={set("make")}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Model *</label>
              <input
                className={inputCls}
                placeholder="e.g. Cascadia"
                value={form.model}
                onChange={set("model")}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Year</label>
              <input
                type="number"
                className={inputCls}
                placeholder="2024"
                min="1990"
                max="2030"
                value={form.year}
                onChange={set("year")}
              />
            </div>
            <div>
              <label className={labelCls}>Mileage (mi)</label>
              <input
                type="number"
                className={inputCls}
                placeholder="0"
                min="0"
                value={form.mileage}
                onChange={set("mileage")}
              />
            </div>
            <div>
              <label className={labelCls}>Equipment Type</label>
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                  value={form.equipment}
                  onChange={set("equipment")}
                >
                  {Object.entries(EQUIPMENT_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                  value={form.truckStatus}
                  onChange={set("truckStatus")}
                >
                  {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                    <option key={val} value={val}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Max Weight (lbs)</label>
              <input
                type="number"
                className={inputCls}
                placeholder="80000"
                min="0"
                value={form.maxWeight}
                onChange={set("maxWeight")}
              />
            </div>
            <div>
              <label className={labelCls}>Truck Length (ft)</label>
              <input
                type="number"
                className={inputCls}
                placeholder="53"
                min="0"
                value={form.truckLength}
                onChange={set("truckLength")}
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Current Location</label>
              <input
                className={inputCls}
                placeholder="e.g. Chicago, IL"
                value={form.currentLocation}
                onChange={set("currentLocation")}
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Available From</label>
              <input
                type="date"
                className={inputCls}
                value={form.availableFrom}
                onChange={set("availableFrom")}
              />
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-4 flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-600">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-amber-400 text-[#0d1117] rounded-lg hover:bg-amber-300 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {saving ? "Saving..." : "Add Truck"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyTrucks() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const token = () => user?.token ?? localStorage.getItem("token");

  const fetchTrucks = async () => {
    setLoading(true);
    setError(null);
    try {
      const t = token();
      if (!t) { navigate("/login"); return; }
      const res = await fetch("/api/trucks/my-trucks", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401 || res.status === 403) { logout(); navigate("/login"); return; }
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setTrucks(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (truckData) => {
    const t = token();
    if (!t) { navigate("/login"); return; }
    const res = await fetch("/api/trucks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify(truckData),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => `Error ${res.status}`);
      throw new Error(msg || `Error ${res.status}`);
    }
    const newTruck = await res.json();
    setTrucks((prev) => [newTruck, ...prev]);
  };

  const handleDelete = async (id) => {
    const t = token();
    if (!t) { navigate("/login"); return; }
    const res = await fetch(`/api/trucks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    setTrucks((prev) => prev.filter((tr) => tr.id !== id));
  };

  useEffect(() => { fetchTrucks(); }, []);

  const filtered = trucks.filter((tr) => {
    const matchStatus = statusFilter === "All" || tr.truckStatus === statusFilter;
    const matchSearch =
      !search.trim() ||
      [tr.truckNumber, tr.make, tr.model, tr.licensePlate, tr.currentLocation]
        .some((f) => f?.toLowerCase().includes(search.trim().toLowerCase()));
    return matchStatus && matchSearch;
  });

  const counts = {
    total: trucks.length,
    available: trucks.filter((t) => t.truckStatus === "AVAILABLE").length,
    onLoad: trucks.filter((t) => t.truckStatus === "ON_LOAD").length,
    maintenance: trucks.filter(
      (t) => t.truckStatus === "MAINTENANCE" || t.truckStatus === "OUT_OF_SERVICE"
    ).length,
  };

  return (
    <div className="flex h-screen bg-[#f8f9fb] font-outfit">
      <CarrierSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 h-[60px] bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold tracking-[2px] text-gray-400 uppercase">
              Carrier Portal
            </span>
            <span className="text-gray-300 text-base">/</span>
            <span className="font-bebas text-xl tracking-[2px] text-gray-800">
              My Trucks
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-amber-400 text-[#0d1117] rounded-lg hover:bg-amber-300 active:scale-[0.98] transition-all shadow-sm"
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Truck
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Trucks" value={counts.total} icon={Truck} color="text-gray-700" />
            <StatCard label="Available" value={counts.available} icon={CheckCircle2} color="text-emerald-600" />
            <StatCard label="On Load" value={counts.onLoad} icon={Package} color="text-amber-500" />
            <StatCard label="Off Road" value={counts.maintenance} icon={Wrench} color="text-red-500" />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search trucks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 w-full text-sm border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {["All", "AVAILABLE", "ON_LOAD", "MAINTENANCE", "OUT_OF_SERVICE"].map((s) => {
                const label =
                  s === "All" ? "All" : STATUS_CONFIG[s]?.label ?? s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      statusFilter === s
                        ? "border-amber-400 bg-amber-400/10 text-amber-600 font-semibold"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={fetchTrucks}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-all bg-white ml-auto"
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-4 mb-4 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>Failed to load trucks: {error}</span>
              <button onClick={fetchTrucks} className="ml-auto text-red-500 hover:text-red-700 font-medium underline">
                Retry
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
                  <div className="h-6 bg-gray-100 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Truck size={28} className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-700 font-semibold text-base">
                  {trucks.length === 0 ? "No trucks yet" : "No trucks match your filter"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {trucks.length === 0
                    ? "Add your first truck to get started"
                    : "Try adjusting your search or status filter"}
                </p>
              </div>
              {trucks.length === 0 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-amber-400 text-[#0d1117] rounded-lg hover:bg-amber-300 transition-all mt-2"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  Add First Truck
                </button>
              )}
            </div>
          )}

          {/* Truck grid */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <div className="text-xs text-gray-400 mb-3">
                Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
                <span className="font-semibold text-gray-600">{trucks.length}</span> trucks
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((truck) => (
                  <TruckCard key={truck.id} truck={truck} onDelete={handleDelete} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <AddTruckModal onClose={() => setShowModal(false)} onSave={handleCreate} />
      )}
    </div>
  );
}
