import { useEffect, useMemo, useState } from "react";
import "./App.css";

import MapBrasil from "./charts/Map";
import LineBrasil from "./charts/IndexChart";
import GruposChart from "./charts/Sunburst";

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

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  const serieBrasil = useMemo(() => {
    return data
      .filter(
        d =>
          normalize(d.grupo) === "indice geral" &&
          normalize(d.regiao) === "brasil"
      )
      .map(d => ({
        date: new Date(d.ano, d.mes - 1, 1),
        dateKey: toYearMonth(d.ano, d.mes),
        value: Number(d.variacao),
      }))
      .sort((a, b) => a.date - b.date);
  }, [data]);

  return (
    <div className="app">
      <header className="header">
        <h1>Dashboard IPCA</h1>
        <p>Índice de Preços ao Consumidor Amplo</p>
      </header>

      {/* =====================
          Layout fullscreen
          Mapa à esquerda, dois cards à direita
      ====================== */}
      <section className="dashboard">
        <div className="left-panel">
          <div className="card">
            <GruposChart data={data} className="chart" />
          </div>
        </div>

        <div className="right-panel">

          <div className="card">
            <MapBrasil data={data} className="chart" />
          </div>
          
          <div className="card">
            <LineBrasil data={serieBrasil} className="chart" />
          </div>

        </div>
      </section>
    </div>
  );
}