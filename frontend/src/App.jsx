import { useEffect, useMemo, useState } from "react";
import "./App.css";
import BarChart from "./components/BarChart";
import Filters from "./components/Filters";
import LineChart from "./components/LineChart";
import MapChart from "./components/MapChart";

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
  }, [years, months, year, month]);

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
