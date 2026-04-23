import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import BrokerSidebar from "../../components/sidebar/BrokerSidebar";
import { AuthContext } from "../../context/AuthContext";
import {
  Package,
  Plus,
  Search,
  MapPin,
  Calendar,
  X,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2,
  Layers,
  Weight,
  TrendingUp,
} from "lucide-react";

const SIZE_LABELS = {
  FULL_LOAD: "Full Load",
  PARTIAL: "Partial",
};

const STATUS_CONFIG = {
  POSTED: {
    label: "Posted",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  BOOKED: {
    label: "Booked",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  IN_TRANSPORT: {
    label: "In Transport",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    ring: "ring-blue-200",
  },
  DELIVERED: {
    label: "Delivered",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    ring: "ring-gray-200",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    ring: "ring-red-200",
  },
};

const EMPTY_FORM = {
  pickupLocation: "",
  deliveryLocation: "",
  pickUpDateTime: "",
  size: "FULL_LOAD",
  weight: "",
  commodity: "",
  price: "",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

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

function LoadRow({ load, onDelete, isLast }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Remove load ${load.referenceNumber ?? load.id}?`)) return;
    setDeleting(true);
    try {
      await onDelete(load.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <tr className={`group hover:bg-amber-400/[0.03] transition-colors ${isLast ? "" : "border-b border-gray-50"}`}>
      <td className="px-5 py-3.5">
        <span className="font-mono text-[11px] text-gray-400 tracking-wider">
          {load.referenceNumber ?? `LOAD-${load.id}`}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <div className="font-medium text-gray-800 text-sm">{load.pickupLocation ?? "—"}</div>
      </td>
      <td className="px-4 py-3.5">
        <div className="font-medium text-gray-800 text-sm">{load.deliveryLocation ?? "—"}</div>
      </td>
      <td className="px-4 py-3.5 text-gray-600 text-sm whitespace-nowrap">
        {formatDateTime(load.pickUpDateTime)}
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-gray-100 text-gray-600">
          {SIZE_LABELS[load.size] ?? load.size ?? "—"}
        </span>
      </td>
      <td className="px-4 py-3.5 text-gray-600 text-sm">
        {load.weight > 0 ? `${Number(load.weight).toLocaleString()} lbs` : "—"}
      </td>
      <td className="px-4 py-3.5 text-sm">
        <span className="font-semibold text-gray-900">
          {load.price > 0 ? `$${Number(load.price).toLocaleString()}` : "—"}
        </span>
      </td>
      <td className="px-4 py-3.5 text-gray-600 text-sm">{load.commodity || "—"}</td>
      <td className="px-4 py-3.5">
        <StatusBadge status={load.status} />
      </td>
      <td className="px-4 py-3.5 text-gray-400 text-[12px] whitespace-nowrap">
        {formatDate(load.createdAt)}
      </td>
      <td className="px-4 py-3.5 text-right">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 ml-auto"
        >
          {deleting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <XCircle size={12} />
          )}
          {deleting ? "..." : "Remove"}
        </button>
      </td>
    </tr>
  );
}

function PostLoadModal({ onClose, onSave }) {
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
        weight: parseFloat(form.weight) || 0,
        price: parseFloat(form.price) || 0,
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-bebas text-2xl tracking-[2px] text-gray-900">
              Post New Load
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Fill in the details to post a new load for carriers
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
            <div className="col-span-2">
              <label className={labelCls}>Pickup Location *</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  className={`${inputCls} pl-9`}
                  placeholder="e.g. Chicago, IL"
                  value={form.pickupLocation}
                  onChange={set("pickupLocation")}
                  required
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Delivery Location *</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  className={`${inputCls} pl-9`}
                  placeholder="e.g. Dallas, TX"
                  value={form.deliveryLocation}
                  onChange={set("deliveryLocation")}
                  required
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Pickup Date & Time *</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="datetime-local"
                  className={`${inputCls} pl-9`}
                  value={form.pickUpDateTime}
                  onChange={set("pickUpDateTime")}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Load Size</label>
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                  value={form.size}
                  onChange={set("size")}
                >
                  {Object.entries(SIZE_LABELS).map(([val, label]) => (
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
              <label className={labelCls}>Weight (lbs)</label>
              <input
                type="number"
                className={inputCls}
                placeholder="e.g. 42000"
                min="0"
                value={form.weight}
                onChange={set("weight")}
              />
            </div>

            <div>
              <label className={labelCls}>Price ($)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="number"
                  className={`${inputCls} pl-9`}
                  placeholder="e.g. 2500"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={set("price")}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Commodity</label>
              <input
                className={inputCls}
                placeholder="e.g. Electronics"
                value={form.commodity}
                onChange={set("commodity")}
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
              {saving ? "Posting..." : "Post Load"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BrokerMyLoads() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const token = () => user?.token ?? localStorage.getItem("token");

  const fetchLoads = async () => {
    setLoading(true);
    setError(null);
    try {
      const t = token();
      if (!t) { navigate("/login"); return; }
      const res = await fetch("/api/loads/my-loads", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401 || res.status === 403) { logout(); navigate("/login"); return; }
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setLoads(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (loadData) => {
    const t = token();
    if (!t) { navigate("/login"); return; }
    const res = await fetch("/api/loads/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify(loadData),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => `Error ${res.status}`);
      throw new Error(msg || `Error ${res.status}`);
    }
    const newLoad = await res.json();
    setLoads((prev) => [newLoad, ...prev]);
  };

  const handleDelete = async (id) => {
    const t = token();
    if (!t) { navigate("/login"); return; }
    const res = await fetch(`/api/loads/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    setLoads((prev) => prev.filter((l) => l.id !== id));
  };

  useEffect(() => { fetchLoads(); }, []);

  const filtered = loads.filter((l) => {
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      [l.pickupLocation, l.deliveryLocation, l.commodity, l.referenceNumber]
        .some((f) => f?.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const counts = {
    total: loads.length,
    posted: loads.filter((l) => l.status === "POSTED").length,
    booked: loads.filter((l) => l.status === "BOOKED").length,
    inTransit: loads.filter((l) => l.status === "IN_TRANSPORT").length,
    delivered: loads.filter((l) => l.status === "DELIVERED").length,
  };

  return (
    <div className="flex h-screen bg-[#f8f9fb] font-outfit">
      <BrokerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 h-[60px] bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold tracking-[2px] text-gray-400 uppercase">
              Broker Portal
            </span>
            <span className="text-gray-300 text-base">/</span>
            <span className="font-bebas text-xl tracking-[2px] text-gray-800">
              My Loads
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-amber-400 text-[#0d1117] rounded-lg hover:bg-amber-300 active:scale-[0.98] transition-all shadow-sm"
          >
            <Plus size={15} strokeWidth={2.5} />
            Post Load
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Loads" value={counts.total} icon={Package} color="text-gray-700" />
            <StatCard label="Posted" value={counts.posted} icon={TrendingUp} color="text-emerald-600" />
            <StatCard label="Booked" value={counts.booked} icon={CheckCircle2} color="text-amber-500" />
            <StatCard label="Delivered" value={counts.delivered} icon={Layers} color="text-blue-500" />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search loads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 w-full text-sm border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {["All", "POSTED", "BOOKED", "IN_TRANSPORT", "DELIVERED", "CANCELLED"].map((s) => {
                const label = s === "All" ? "All" : STATUS_CONFIG[s]?.label ?? s;
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
              onClick={fetchLoads}
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
              <span>Failed to load data: {error}</span>
              <button onClick={fetchLoads} className="ml-auto text-red-500 hover:text-red-700 font-medium underline">
                Retry
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
              <div className="h-10 bg-gray-50 border-b border-gray-100" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-b-0">
                  <div className="h-3 bg-gray-100 rounded w-20" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                  <div className="h-3 bg-gray-100 rounded w-16" />
                  <div className="h-3 bg-gray-100 rounded w-20 ml-auto" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Package size={28} className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-700 font-semibold text-base">
                  {loads.length === 0 ? "No loads posted yet" : "No loads match your filter"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {loads.length === 0
                    ? "Post your first load to connect with carriers"
                    : "Try adjusting your search or status filter"}
                </p>
              </div>
              {loads.length === 0 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-amber-400 text-[#0d1117] rounded-lg hover:bg-amber-300 transition-all mt-2"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  Post First Load
                </button>
              )}
            </div>
          )}

          {/* Loads table */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <div className="text-xs text-gray-400 mb-3">
                Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
                <span className="font-semibold text-gray-600">{loads.length}</span> loads
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Ref #</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Pickup</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Delivery</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Date</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Size</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Weight</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Price</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Commodity</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Posted</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((load, i) => (
                      <LoadRow
                        key={load.id}
                        load={load}
                        onDelete={handleDelete}
                        isLast={i === filtered.length - 1}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <PostLoadModal onClose={() => setShowModal(false)} onSave={handleCreate} />
      )}
    </div>
  );
}
