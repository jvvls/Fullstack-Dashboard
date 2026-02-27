import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { COLORS, GROUP_GERAL } from "../constants/chartConfig";
import { useTooltip } from "../hooks/useTooltip";

export default function LineChart({ data, state }) {
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
  }, [data, state, tooltip]);

  return <svg ref={ref} />;
}
