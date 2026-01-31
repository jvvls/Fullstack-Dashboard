import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import "./App.css";

/* =========================
   CONSTANTES
========================= */

const GROUP_GERAL = "Índice geral";

const COLORS = {
  brasil: "#38bdf8",
  state: "#22c55e",
  muted: "#334155",
  bg: "#020617",
  axis: "#94a3b8",
  tooltipBg: "#020617",
  tooltipBorder: "#1e293b",
};

const MAP_COLOR_SCALE = d3
  .scaleDiverging(d3.interpolateRdYlGn)
  .domain([-2, 0, 2]);

// SOMENTE O QUE EXISTE NO DATASET
const GEO_TO_DATASET = {
  Acre: "Rio Branco (AC)",
  Bahia: "Salvador (BA)",
  Ceará: "Fortaleza (CE)",
  "Distrito Federal": "Brasília (DF)",
  "Espírito Santo": "Grande Vitória (ES)",
  Goiás: "Goiânia (GO)",
  Maranhão: "São Luís (MA)",
  "Mato Grosso do Sul": "Campo Grande (MS)",
  "Minas Gerais": "Belo Horizonte (MG)",
  Pará: "Belém (PA)",
  Paraná: "Curitiba (PR)",
  Pernambuco: "Recife (PE)",
  "Rio de Janeiro": "Rio de Janeiro (RJ)",
  "Rio Grande do Sul": "Porto Alegre (RS)",
  Sergipe: "Aracaju (SE)",
  "São Paulo": "São Paulo (SP)",
};

/* =========================
   TOOLTIP
========================= */

function useTooltip() {
  const ref = useRef(null);

  useEffect(() => {
    ref.current = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", COLORS.tooltipBg)
      .style("border", `1px solid ${COLORS.tooltipBorder}`)
      .style("border-radius", "8px")
      .style("padding", "6px 10px")
      .style("font-size", "12px")
      .style("color", "#e5e7eb")
      .style("pointer-events", "none")
      .style("opacity", 0);

    return () => ref.current.remove();
  }, []);

  return ref;
}

/* =========================
   APP
========================= */

export default function App() {
  const [data, setData] = useState([]);
  const [geo, setGeo] = useState(null);
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [state, setState] = useState(null);

  useEffect(() => {
    fetch("/api/ipca").then(r => r.json()).then(setData);
    fetch(
      "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson"
    )
      .then(r => r.json())
      .then(setGeo);
  }, []);

  const years = useMemo(
    () => [...new Set(data.map(d => d.ano))].sort(),
    [data]
  );

  const months = useMemo(
    () => [...new Set(data.map(d => d.mes))].sort((a, b) => a - b),
    [data]
  );

  useEffect(() => {
    if (!year && years.length) setYear(years.at(-1));
    if (!month && months.length) setMonth(months.at(-1));
  }, [years, months]);

  const filtered = useMemo(
    () =>
      data.filter(
        d =>
          (!year || d.ano === year) &&
          (!month || d.mes === month)
      ),
    [data, year, month]
  );

    return (
      <div className="dashboard">
        {/* HEADER / FILTROS */}
        <div className="card dashboard-header">
          <div className="dashboard-header-content">
            <h1 className="dashboard-title">IPCA — Painel Interativo</h1>

            <Filters
              year={year}
              setYear={setYear}
              years={years}
              month={month}
              setMonth={setMonth}
              months={months}
            />
          </div>
        </div>

        <div className="main-grid">
          {/* MAPA (sem título ocupando espaço) */}
          <div className="card map-card">
            {geo && (
              <MapChart
                geo={geo}
                data={filtered}
                selected={state}
                onSelect={setState}
              />
            )}
          </div>

          {/* COLUNA DIREITA (cards “limpos”) */}
          <div className="charts-column">
            <div className="card">
              <BarChart data={filtered} state={state} />
            </div>

            <div className="card">
              <LineChart data={data} state={state} />
            </div>
          </div>
        </div>
      </div>
    );
}

/* =========================
   FILTERS
========================= */

function Filters({ year, setYear, years, month, setMonth, months }) {
  return (
    <div className="filters">
      <select value={year ?? ""} onChange={e => setYear(+e.target.value)}>
        {years.map(y => (
          <option key={y}>{y}</option>
        ))}
      </select>

      <select value={month ?? ""} onChange={e => setMonth(+e.target.value)}>
        {months.map(m => (
          <option key={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}

/* =========================
   MAPA
========================= */

function MapChart({ geo, data, selected, onSelect }) {
  const ref = useRef();
  const tooltip = useTooltip();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const projection = d3.geoMercator().fitSize([width, height], geo);
    const path = d3.geoPath(projection);

    const values = new Map(
      data
        .filter(d => d.grupo === GROUP_GERAL && d.regiao !== "Brasil")
        .map(d => [d.regiao, d.variacao])
    );

    svg
      .append("g")
      .selectAll("path")
      .data(geo.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => {
        const key = GEO_TO_DATASET[d.properties.name];
        if (!key) return COLORS.muted;
        return MAP_COLOR_SCALE(values.get(key) ?? 0);
      })
      .attr("stroke", d => {
        const key = GEO_TO_DATASET[d.properties.name];
        return selected === key ? COLORS.brasil : COLORS.bg;
      })
      .attr("stroke-width", d => {
        const key = GEO_TO_DATASET[d.properties.name];
        return selected === key ? 2.5 : 1;
      })
      .on("mouseenter", (e, d) => {
        const key = GEO_TO_DATASET[d.properties.name];
        if (!key) return;

        tooltip.current
          .style("opacity", 1)
          .html(
            `<strong>${key}</strong><br/>${values
              .get(key)
              ?.toFixed(2) ?? "–"}%`
          );
      })
      .on("mousemove", e => {
        tooltip.current
          .style("left", `${e.pageX + 12}px`)
          .style("top", `${e.pageY + 12}px`);
      })
      .on("mouseleave", () => tooltip.current.style("opacity", 0))
      .on("click", (_, d) => {
        const key = GEO_TO_DATASET[d.properties.name];
        if (key) onSelect(key);
      });
  }, [geo, data, selected]);

  return <svg ref={ref} className="map-svg" />;
}

/* =========================
   BAR CHART
========================= */

function BarChart({ data, state }) {
  const ref = useRef();
  const tooltip = useTooltip();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const source = state
      ? data.filter(d => d.regiao === state)
      : data.filter(d => d.regiao === "Brasil");

    const series = d3.rollups(
      source.filter(d => d.grupo !== GROUP_GERAL),
      v => d3.mean(v, d => d.variacao),
      d => d.grupo
    );

    const width = 800;
    const height = 360;
    const margin = { top: 20, right: 20, bottom: 80, left: 60 };

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const x = d3
      .scaleBand()
      .domain(series.map(d => d[0]))
      .range([margin.left, width - margin.right])
      .padding(0.25);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(series.map(d => d[1])))
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .selectAll("rect")
      .data(series)
      .enter()
      .append("rect")
      .attr("x", d => x(d[0]))
      .attr("y", d => y(Math.max(0, d[1])))
      .attr("height", d => Math.abs(y(d[1]) - y(0)))
      .attr("width", x.bandwidth())
      .attr("fill", state ? COLORS.state : COLORS.brasil)
      .on("mouseenter", (e, d) => {
        tooltip.current
          .style("opacity", 1)
          .html(`<strong>${d[0]}</strong><br/>${d[1].toFixed(2)}%`);
      })
      .on("mousemove", e => {
        tooltip.current
          .style("left", `${e.pageX + 12}px`)
          .style("top", `${e.pageY + 12}px`);
      })
      .on("mouseleave", () => tooltip.current.style("opacity", 0));

    svg
      .append("g")
      .attr("transform", `translate(0,${y(0)})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }, [data, state]);

  return <svg ref={ref} />;
}

/* =========================
   LINE CHART
========================= */

function LineChart({ data, state }) {
  const ref = useRef();
  const tooltip = useTooltip();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 900;
    const height = 360;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const build = region =>
      d3
        .rollups(
          data.filter(
            d => d.regiao === region && d.grupo === GROUP_GERAL
          ),
          v => d3.mean(v, d => d.variacao),
          d => `${d.ano}-${String(d.mes).padStart(2, "0")}`
        )
        .map(([date, value]) => ({ date, value }));

    const series = [
      { name: "Brasil", color: COLORS.brasil, values: build("Brasil") },
      ...(state
        ? [{ name: state, color: COLORS.state, values: build(state) }]
        : []),
    ];

    const all = series.flatMap(s => s.values);

    const x = d3
      .scalePoint()
      .domain(all.map(d => d.date))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(all, d => d.value))
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line()
      .x(d => x(d.date))
      .y(d => y(d.value));

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x).tickValues(
          x.domain().filter((_, i) => i % 3 === 0)
        )
      );

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    series.forEach(s => {
      svg
        .append("path")
        .datum(s.values)
        .attr("fill", "none")
        .attr("stroke", s.color)
        .attr("stroke-width", 2)
        .attr("d", line);
    });

    svg
      .append("g")
      .selectAll("circle")
      .data(all)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.value))
      .attr("r", 3)
      .attr("fill", COLORS.brasil)
      .on("mouseenter", (e, d) => {
        tooltip.current
          .style("opacity", 1)
          .html(`${d.date}<br/>${d.value.toFixed(2)}%`);
      })
      .on("mousemove", e => {
        tooltip.current
          .style("left", `${e.pageX + 12}px`)
          .style("top", `${e.pageY + 12}px`);
      })
      .on("mouseleave", () => tooltip.current.style("opacity", 0));
  }, [data, state]);

  return <svg ref={ref} />;
}