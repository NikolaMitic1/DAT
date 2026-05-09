import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const KOSOVO_ID = 383;

const EUROPE_IDS = new Set([
  8, 20, 40, 112, 56, 70, 100, 191, 196, 203, 208, 233, 246, 250, 276, 300,
  348, 352, 372, 380, 428, 438, 440, 442, 470, 498, 492, 499, 528, 807, 578,
  616, 620, 642, 643, 674, 688, 703, 705, 724, 752, 756, 792, 804, 826,
]);


export const COUNTRY_NAMES = {
  8: "Albania", 20: "Andorra", 40: "Austria", 112: "Belarus",
  56: "Belgium", 70: "Bosnia & Herzegovina", 100: "Bulgaria", 191: "Croatia",
  196: "Cyprus", 203: "Czech Republic", 208: "Denmark", 233: "Estonia",
  246: "Finland", 250: "France", 276: "Germany", 300: "Greece",
  348: "Hungary", 352: "Iceland", 372: "Ireland", 380: "Italy",
  428: "Latvia", 438: "Liechtenstein", 440: "Lithuania", 442: "Luxembourg",
  470: "Malta", 498: "Moldova", 492: "Monaco", 499: "Montenegro",
  528: "Netherlands", 807: "North Macedonia", 578: "Norway", 616: "Poland",
  620: "Portugal", 642: "Romania", 643: "Russia", 674: "San Marino",
  688: "Serbia", 703: "Slovakia", 705: "Slovenia", 724: "Spain",
  752: "Sweden", 756: "Switzerland", 792: "Turkey", 804: "Ukraine",
  826: "United Kingdom",
};

const ATLAS_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
let worldCache = null;

// Absolute thresholds matching the legend: 1-5 blue, 5-15 blue2, 15-30 cyan, 30-50 orange, 50+ red
function buildColorScale() {
  return d3.scaleLinear()
    .domain([0, 5, 15, 30, 50])
    .range(["#1e3a8a", "#2563eb", "#06b6d4", "#f97316", "#ef4444"])
    .clamp(true);
}

export default function EuropeHeatmap({ loadData, maxLoads, onCountryClick }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const pathsRef = useRef(null);
  const colorScaleRef = useRef(null);
  const loadDataRef = useRef(loadData);
  const [tooltip, setTooltip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep loadData ref current
  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  // Update country colors when data changes (no map rebuild needed)
  useEffect(() => {
    if (!pathsRef.current || !colorScaleRef.current) return;
    colorScaleRef.current = buildColorScale();
    pathsRef.current.attr("fill", d => {
      const v = loadData[+d.id];
      return v > 0 ? colorScaleRef.current(v) : "#e5e7eb";
    });
  }, [loadData, maxLoads]);

  // One-time map setup
  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl) return;

    let cancelled = false;
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const { width: W, height: H } = container.getBoundingClientRect();
    if (!W || !H) return;

    svg.attr("width", W).attr("height", H);

    // Use hardcoded initial domain; color-update effect corrects it immediately
    const cs = buildColorScale();
    colorScaleRef.current = cs;

    const g = svg.append("g");

    svg.call(
      d3.zoom()
        .scaleExtent([0.6, 16])
        .on("zoom", ev => {
          g.attr("transform", ev.transform);
          setTooltip(null);
        })
    );

    (async () => {
      try {
        if (!worldCache) {
          const res = await fetch(ATLAS_URL);
          worldCache = await res.json();
        }
        if (cancelled) return;

        const allFeatures = topojson
          .feature(worldCache, worldCache.objects.countries)
          .features;

        const countriesGeoms = worldCache.objects.countries.geometries;
        const serbiaGeom = countriesGeoms.find(g => +g.id === 688);
        const kosovoGeom = countriesGeoms.find(g => +g.id === KOSOVO_ID);

        // Merge Kosovo into Serbia so they render as one territory
        let mergedSerbiaFeature = null;
        if (serbiaGeom && kosovoGeom) {
          const merged = topojson.merge(worldCache, [serbiaGeom, kosovoGeom]);
          mergedSerbiaFeature = { type: "Feature", id: 688, properties: {}, geometry: merged };
        }

        const europeFeatures = allFeatures
          .filter(f => EUROPE_IDS.has(+f.id) && +f.id !== 688 && +f.id !== KOSOVO_ID)
          .concat(mergedSerbiaFeature
            ? [mergedSerbiaFeature]
            : allFeatures.filter(f => +f.id === 688));

        // Fixed projection centered on mainland Europe — avoids fitExtent being
        // pulled south by France's overseas territories (French Guiana).
        const proj = d3.geoMercator()
          .center([14, 52])
          .scale(H * 0.95)
          .translate([W / 2, H / 2]);

        const path = d3.geoPath(proj);

        const paths = g
          .selectAll("path")
          .data(europeFeatures)
          .join("path")
          .attr("d", path)
          .attr("fill", d => {
            const v = loadDataRef.current[+d.id];
            return v > 0 ? cs(v) : "#e5e7eb";
          })
          .attr("stroke", "#d1d5db")
          .attr("stroke-width", 0.75)
          .style("cursor", "pointer");

        pathsRef.current = paths;

        paths
          .on("pointerenter", function (ev, d) {
            d3.select(this)
              .raise()
              .attr("stroke", "#fbbf24")
              .attr("stroke-width", 2)
              .style("filter", "brightness(1.4) drop-shadow(0 0 6px rgba(251,191,36,0.3))");
            const [x, y] = d3.pointer(ev, container);
            const id = +d.id;
            setTooltip({
              x, y,
              name: COUNTRY_NAMES[id] ?? "Unknown",
              loads: loadDataRef.current[id] ?? 0,
            });
          })
          .on("pointermove", ev => {
            const [x, y] = d3.pointer(ev, container);
            setTooltip(p => (p ? { ...p, x, y } : null));
          })
          .on("pointerleave", function () {
            d3.select(this)
              .attr("stroke", "#d1d5db")
              .attr("stroke-width", 0.75)
              .style("filter", "none");
            setTooltip(null);
          })
          .on("click", (ev, d) => {
            ev.stopPropagation();
            onCountryClick?.(+d.id);
          });

        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      svg.selectAll("*").remove();
      pathsRef.current = null;
      colorScaleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tipStyle = (() => {
    if (!tooltip || !containerRef.current) return null;
    const { clientWidth: CW, clientHeight: CH } = containerRef.current;
    let left = tooltip.x + 14;
    let top = tooltip.y - 12;
    if (left + 185 > CW) left = tooltip.x - 197;
    if (top + 82 > CH) top = CH - 90;
    if (top < 8) top = 8;
    return { left, top };
  })();

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
          <div className="w-7 h-7 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-[10px] tracking-[3px] text-gray-400 uppercase font-outfit">
            Loading map
          </span>
        </div>
      )}
      <svg ref={svgRef} className="w-full h-full" />
      {tooltip && tipStyle && (
        <div className="absolute z-50 pointer-events-none" style={tipStyle}>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-lg">
            <div className="font-outfit font-semibold text-[13px] text-gray-800 leading-tight">
              {tooltip.name}
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-bebas text-[26px] text-amber-600 leading-none">
                {tooltip.loads.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400 tracking-[2px] uppercase">
                active loads
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
