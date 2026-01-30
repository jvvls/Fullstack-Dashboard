import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function GruposChart({ data }) {
  const ref = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    const width = 500;
    const radius = width / 2;

    const svg = d3
      .select(ref.current)
      .attr("viewBox", [-width / 2, -width / 2, width, width])
      .style("font", "12px sans-serif");

    svg.selectAll("*").remove();

    // --- Lista de meses em ordem
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // --- Normaliza o campo mês do seu dataset
    function normalizeMonth(m) {
      if (typeof m === "number") return monthNames[m - 1];
      if (typeof m === "string") {
        const lower = m.toLowerCase();
        if (lower.startsWith("jan")) return "Janeiro";
        if (lower.startsWith("fev")) return "Fevereiro";
        if (lower.startsWith("mar")) return "Março";
        if (lower.startsWith("abr")) return "Abril";
        if (lower.startsWith("mai")) return "Maio";
        if (lower.startsWith("jun")) return "Junho";
        if (lower.startsWith("jul")) return "Julho";
        if (lower.startsWith("ago")) return "Agosto";
        if (lower.startsWith("set")) return "Setembro";
        if (lower.startsWith("out")) return "Outubro";
        if (lower.startsWith("nov")) return "Novembro";
        if (lower.startsWith("dez")) return "Dezembro";
      }
      return m;
    }

    const normalizedData = data.map(d => ({ ...d, mes: normalizeMonth(d.mes) }));

    // --- Agrupa dados por região → mês
    const rootData = {
      name: "IPCA",
      children: Array.from(d3.group(normalizedData, d => d.regiao)).map(([regiao, regiaoRows]) => ({
        name: regiao,
        children: monthNames.map(mes => {
          const mesRows = regiaoRows.filter(r => r.mes === mes);
          return {
            name: mes,
            value: d3.sum(mesRows, d => Number(d.variacao) || 0),
          };
        }),
      })),
    };

    const root = d3
      .hierarchy(rootData)
      .sum(d => d.value || 0);

    const partition = d3.partition().size([2 * Math.PI, radius]);
    partition(root);

    const arc = d3
      .arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1);

    // --- Cores fixas por região
    const regions = Array.from(new Set(normalizedData.map(d => d.regiao)));
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(regions);

    const nodes = root.descendants().filter(d => d.depth);

    nodes.forEach(d => {
      if (d.depth === 1) {
        d.color = colorScale(d.data.name); // Região
      } else if (d.depth === 2) {
        d.color = d3.color(d.parent.color); // Mês: mesma cor da região
      } else {
        d.color = "#fff"; // raiz
      }
    });

    // --- Texto central
    const centerText = svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("IPCA");

    const centerValue = svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .style("font-size", "12px")
      .text("");

    // --- Tooltip discreto
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("color", "#000")
      .style("padding", "4px 8px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // --- Desenha arcos
    svg
      .append("g")
      .selectAll("path")
      .data(nodes)
      .join("path")
      .attr("fill", d => d.color)
      .attr("d", arc)
      .on("mouseover", function (event, d) {
        centerText.text(d.data.name);
        centerValue.text(`Valor: ${d.value?.toFixed(2) || 0}`);

        tooltip
          .style("opacity", 1)
          .html(
            d.ancestors().reverse().map(a => a.data.name).join(" / ") +
            `<br>Valor: ${d.value?.toFixed(2) || 0}`
          );
      })
      .on("mousemove", event => {
        tooltip.style("left", event.pageX + 10 + "px")
               .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", function () {
        centerText.text("IPCA");
        centerValue.text("");
        tooltip.style("opacity", 0);
      });

  }, [data]);

  return <svg ref={ref} className="chart" />;
}