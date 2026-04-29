import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import BrokerSidebar from "../../components/sidebar/BrokerSidebar";
import { AuthContext } from "../../context/AuthContext";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  RefreshCw,
  Truck,
  X,
  XCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING:  { label: "Pending",  cls: "bg-amber-100 text-amber-700" },
  ACCEPTED: { label: "Accepted", cls: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Rejected", cls: "bg-red-100 text-red-600" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatPrice(p) {
  if (p == null) return "—";
  return "$" + p.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

export default function MyOffers() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmOffer, setConfirmOffer] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actioning, setActioning] = useState(false);

  const getToken = () => user?.token ?? localStorage.getItem("token");

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) { navigate("/login"); return; }

      const res = await fetch("/api/offers/for-my-loads", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) { navigate("/login"); return; }
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      // Sort: PENDING first, then by date desc
      data.sort((a, b) => {
        if (a.offerStatus === "PENDING" && b.offerStatus !== "PENDING") return -1;
        if (a.offerStatus !== "PENDING" && b.offerStatus === "PENDING") return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setOffers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  const updateStatus = async (offerId, status) => {
    setActioning(true);
    setActionError(null);
    try {
      const token = getToken();
      const res = await fetch(`/api/offers/${offerId}/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }

      setConfirmOffer(null);
      await fetchOffers();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActioning(false);
    }
  };

  const handleReject = (offer) => updateStatus(offer.id, "REJECTED");

  const pending = offers.filter((o) => o.offerStatus === "PENDING");
  const rest    = offers.filter((o) => o.offerStatus !== "PENDING");

  return (
    <div className="flex h-screen bg-[#f8f9fb] font-outfit">
      <BrokerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Offers on My Loads</h1>
            <p className="text-xs text-gray-400 mt-0.5">Review and respond to carrier offers</p>
          </div>
          <button
            onClick={fetchOffers}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-all"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-4 mb-4 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>Failed to load offers: {error}</span>
              <button onClick={fetchOffers} className="ml-auto text-red-500 hover:text-red-700 font-medium underline">
                Retry
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 px-5 py-4 border-b border-gray-50 last:border-b-0">
                  <div className="flex-1 h-4 bg-gray-100 rounded" />
                  <div className="w-32 h-4 bg-gray-100 rounded" />
                  <div className="w-20 h-4 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && (
            <>
              {offers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Truck size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">No offers yet</p>
                    <p className="text-sm text-gray-400 mt-1">Carriers will send offers on your posted loads.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Pending section */}
                  {pending.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold tracking-[1.5px] text-amber-600 uppercase">
                          Pending
                        </span>
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-[#0d1117] text-[10px] font-bold">
                          {pending.length}
                        </span>
                      </div>
                      <OffersTable
                        offers={pending}
                        onAccept={setConfirmOffer}
                        onReject={handleReject}
                        actioning={actioning}
                      />
                    </section>
                  )}

                  {/* History section */}
                  {rest.length > 0 && (
                    <section>
                      <div className="mb-3">
                        <span className="text-xs font-semibold tracking-[1.5px] text-gray-400 uppercase">
                          History
                        </span>
                      </div>
                      <OffersTable offers={rest} />
                    </section>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Accept Confirmation Modal */}
      {confirmOffer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => { setConfirmOffer(null); setActionError(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={20} className="text-emerald-500" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Accept Offer?</div>
                  <div className="text-xs text-gray-400 mt-0.5">This will book the load and reject all other offers.</div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Load</span>
                  <span className="font-medium text-gray-800">
                    {confirmOffer.load?.referenceNumber ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Route</span>
                  <span className="font-medium text-gray-800 text-right">
                    {confirmOffer.load?.pickupLocation ?? "—"} → {confirmOffer.load?.deliveryLocation ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Truck</span>
                  <span className="font-medium text-gray-800">
                    {confirmOffer.truck?.truckNumber ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2">
                  <span className="text-gray-500">Offered Price</span>
                  <span className="font-bold text-emerald-600">{formatPrice(confirmOffer.offeredPrice)}</span>
                </div>
              </div>

              {actionError && (
                <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-600">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setConfirmOffer(null); setActionError(null); }}
                  className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStatus(confirmOffer.id, "ACCEPTED")}
                  disabled={actioning}
                  className="flex-1 py-2.5 text-sm font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {actioning ? "Accepting..." : "Accept"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OffersTable({ offers, onAccept, onReject, actioning }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Load</th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Route</th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Truck</th>
            <th className="text-right px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Asking</th>
            <th className="text-right px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Offered</th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[1.5px] text-gray-400 uppercase">Received</th>
            {onAccept && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {offers.map((offer, i) => {
            const sc = STATUS_CONFIG[offer.offerStatus] ?? { label: offer.offerStatus, cls: "bg-gray-100 text-gray-600" };
            const isPending = offer.offerStatus === "PENDING";
            const diff = offer.load?.price != null && offer.offeredPrice != null
              ? offer.offeredPrice - offer.load.price
              : null;

            return (
              <tr
                key={offer.id}
                className={`border-b border-gray-50 transition-colors ${i === offers.length - 1 ? "border-b-0" : ""} ${isPending ? "hover:bg-emerald-50/30" : ""}`}
              >
                {/* Load ref */}
                <td className="px-5 py-3.5 font-mono text-[12px] text-gray-400">
                  {offer.load?.referenceNumber ?? "—"}
                </td>

                {/* Route */}
                <td className="px-4 py-3.5">
                  <div className="font-medium text-gray-800 text-[13px]">{offer.load?.pickupLocation ?? "—"}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-4 h-px bg-gray-200" />
                    <ArrowRight size={9} className="text-gray-300" />
                    <div className="text-[11px] text-gray-400">{offer.load?.deliveryLocation ?? "—"}</div>
                  </div>
                </td>

                {/* Truck */}
                <td className="px-4 py-3.5">
                  <div className="text-[13px] font-medium text-gray-700">{offer.truck?.truckNumber ?? "—"}</div>
                  <div className="text-[11px] text-gray-400">
                    {[offer.truck?.make, offer.truck?.model].filter(Boolean).join(" ") || "—"}
                  </div>
                </td>

                {/* Asking price */}
                <td className="px-4 py-3.5 text-right font-mono text-[13px] text-gray-500">
                  {formatPrice(offer.load?.price)}
                </td>

                {/* Offered price */}
                <td className="px-4 py-3.5 text-right">
                  <div className="font-semibold font-mono text-[13px] text-gray-900">
                    {formatPrice(offer.offeredPrice)}
                  </div>
                  {diff != null && (
                    <div className={`text-[10px] ${diff < 0 ? "text-emerald-600" : diff > 0 ? "text-red-500" : "text-gray-400"}`}>
                      {diff < 0 ? `${formatPrice(diff)} below` : diff > 0 ? `+${formatPrice(diff)} above` : "at asking"}
                    </div>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-full ${sc.cls}`}>
                    {sc.label}
                  </span>
                </td>

                {/* Time */}
                <td className="px-4 py-3.5 text-gray-400 text-[12px] whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {timeAgo(offer.createdAt)}
                  </span>
                </td>

                {/* Actions */}
                {onAccept && (
                  <td className="px-4 py-3.5">
                    {isPending && (
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => onReject(offer)}
                          disabled={actioning}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-40"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                        <button
                          onClick={() => onAccept(offer)}
                          disabled={actioning}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-40 whitespace-nowrap"
                        >
                          <CheckCircle size={13} />
                          Accept
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
