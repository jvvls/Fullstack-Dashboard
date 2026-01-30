import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

const REGIAO_PARA_UF = {
  AC: "AC", AL: "AL", AP: "AP", AM: "AM", BA: "BA", CE: "CE",
  DF: "DF", ES: "ES", GO: "GO", MA: "MA", MT: "MT", MS: "MS",
  MG: "MG", PA: "PA", PB: "PB", PR: "PR", PE: "PE", PI: "PI",
  RJ: "RJ", RN: "RN", RS: "RS", RO: "RO", RR: "RR", SC: "SC",
  SP: "SP", SE: "SE", TO: "TO"
};

function getUF(regiao) {
  const match = regiao.match(/\((\w{2})\)/);
  return match ? match[1].toUpperCase() : null;
}

export default function MapBrasil({ data }) {
  const ref = useRef();
  const [mesSelecionado, setMesSelecionado] = useState(null);
  const [anoSelecionado, setAnoSelecionado] = useState(null);

  // Meses e anos disponíveis
  const meses = useMemo(() => [...new Set(data.map(d => d.mes))], [data]);
  const anos = useMemo(() => [...new Set(data.map(d => d.ano))], [data]);

  // Filtrar dados
  const dadosFiltrados = useMemo(() => {
    return data.filter(d => {
      const mes = String(d.mes);
      const ano = String(d.ano);
      const mesOk = !mesSelecionado || mes === mesSelecionado;
      const anoOk = !anoSelecionado || ano === anoSelecionado;
      return mesOk && anoOk;
    });
  }, [data, mesSelecionado, anoSelecionado]);

  useEffect(() => {
    if (!dadosFiltrados.length) return;

    const width = 800;
    const height = 400;

    const svg = d3.select(ref.current)
      .attr("viewBox", `0 0 ${width} ${height}`);
    svg.selectAll("*").remove();

    // Agrupar por UF e calcular média
    const porUF = d3.rollup(
      dadosFiltrados
        .map(d => ({ uf: getUF(d.regiao), variacao: Number(d.variacao) }))
        .filter(d => d.uf && !isNaN(d.variacao)),
      v => d3.mean(v, d => d.variacao),
      d => d.uf
    );

    const maxValue = d3.max([...porUF.values()]) || 1;
    const color = d3.scaleSequential()
      .domain([0, maxValue])
      .interpolator(d3.interpolateYlOrRd);

    // Carregar mapa
    d3.json("https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson")
      .then(geo => {
        const projection = d3.geoMercator().fitSize([width, height], geo);
        const path = d3.geoPath(projection);

        // Criar paths
        const paths = svg.append("g")
          .selectAll("path")
          .data(geo.features)
          .join("path")
          .attr("d", path)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("fill", "#2a2a40"); // cor inicial neutra

        // Adicionar titles ANTES da transição
        paths.each(function(d) {
          d3.select(this)
            .append("title")
            .text(() => {
              const v = porUF.get(d.properties.sigla);
              return `${d.properties.name}: ${v?.toFixed(2) ?? "sem dado"}%`;
            });
        });

        // Transição suave das cores
        paths.transition()
          .duration(500)
          .attr("fill", d => {
            const v = porUF.get(d.properties.sigla);
            return v != null ? color(v) : "#2a2a40";
          });

        // Legenda
        const legendWidth = 200;
        const legendHeight = 12;

        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
          .attr("id", "gradient")
          .attr("x1", "0%")
          .attr("x2", "100%");

        gradient.selectAll("stop")
          .data(d3.range(0, 1.01, 0.01))
          .join("stop")
          .attr("offset", d => `${d * 100}%`)
          .attr("stop-color", d => color(maxValue * d));

        const legend = svg.append("g")
          .attr("transform", `translate(${width - legendWidth - 20}, ${height - 40})`);

        legend.append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .attr("rx", 6)
          .style("fill", "url(#gradient)");

        legend.selectAll(".legend-label")
          .data(["Baixo", "Alto"])
          .join("text")
          .attr("class", "legend-label")
          .attr("x", (d,i) => i === 0 ? 0 : legendWidth)
          .attr("y", -5)
          .attr("text-anchor", d => d === "Baixo" ? "start" : "end")
          .attr("fill", "#e0e0e0")
          .attr("font-size", 12)
          .text(d => d);
      });

  }, [dadosFiltrados]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select
          className="select-filter"
          onChange={e => setMesSelecionado(e.target.value || null)}
          value={mesSelecionado || ""}
        >
          <option value="">Todos os meses</option>
          {meses.map(m => <option key={m} value={String(m)}>{m}</option>)}
        </select>

        <select
          className="select-filter"
          onChange={e => setAnoSelecionado(e.target.value || null)}
          value={anoSelecionado || ""}
        >
          <option value="">Todos os anos</option>
          {anos.map(a => <option key={a} value={String(a)}>{a}</option>)}
        </select>
      </div>
      <svg ref={ref} className="chart" />
    </div>
  );
}