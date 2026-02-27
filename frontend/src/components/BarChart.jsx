import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { COLORS, GROUP_GERAL } from "../constants/chartConfig";
import { useTooltip } from "../hooks/useTooltip";

export default function BarChart({ data, state }) {
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
  }, [data, state, tooltip]);

  return <svg ref={ref} />;
}
