import { useEffect, useMemo, useState } from "react";
import "./App.css";

/* ===============================
   Utils
================================ */
function normalize(str) {
  return str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function toYearMonth(ano, mes) {
  return `${ano}-${String(mes).padStart(2, "0")}`;
}

/* ===============================
   App
================================ */
export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -------- Fetch -------- */
  useEffect(() => {
    setLoading(true);

    fetch("/api/ipca")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        setData(json);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  /* -------- Série: Índice Geral Brasil -------- */
  const serieBrasil = useMemo(() => {
    return data
      .filter(
        d =>
          normalize(d.grupo) === "indice geral" &&
          normalize(d.regiao) === "brasil"
      )
      .map(d => ({
        dateKey: toYearMonth(d.ano, d.mes),
        date: new Date(d.ano, d.mes - 1, 1),
        value: Number(d.variacao),
      }))
      .sort((a, b) => a.date - b.date);
  }, [data]);

  /* -------- KPIs -------- */
  const ultimo = serieBrasil.at(-1);
  const max = serieBrasil.length
    ? Math.max(...serieBrasil.map(d => d.value))
    : null;
  const min = serieBrasil.length
    ? Math.min(...serieBrasil.map(d => d.value))
    : null;

  /* -------- Estados -------- */
  if (loading) return <p>Carregando…</p>;
  if (error) return <p>Erro: {error}</p>;

  /* ===============================
     Layout
  ================================ */
  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <h1>Dashboard IPCA</h1>
        <p>Índice de Preços ao Consumidor Amplo</p>
      </header>

      {/* MAPA (PRIMEIRO) */}
      <section className="card full">
        <h2>Mapa – Variação Regional do IPCA</h2>
        <div id="chart-map-brasil" className="chart" />
      </section>

      {/* KPIs */}
      <section className="kpis">
        <div className="kpi">
          <span>Último valor</span>
          <strong>{ultimo?.value ?? "—"}%</strong>
        </div>

        <div className="kpi">
          <span>Máximo</span>
          <strong>{max ?? "—"}%</strong>
        </div>

        <div className="kpi">
          <span>Mínimo</span>
          <strong>{min ?? "—"}%</strong>
        </div>
      </section>

      {/* LINHA */}
      <section className="card full">
        <h2>Índice Geral – Brasil</h2>
        <div id="chart-line-brasil" className="chart" />
      </section>

      {/* COMPARAÇÕES */}
      <section className="grid-2">
        <div className="card">
          <h2>Comparação por Grupo</h2>
          <div id="chart-grupos" className="chart" />
        </div>

        <div className="card">
          <h2>Evolução Regional</h2>
          <div id="chart-regioes" className="chart" />
        </div>
      </section>
    </div>
  );
}