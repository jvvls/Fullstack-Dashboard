import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function LineBrasil({ data }) {
  const ref = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    const width = 800;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };

    const svg = d3
      .select(ref.current)
      .attr("viewBox", `0 0 ${width} ${height}`);

    svg.selectAll("*").remove();

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.value))
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line()
      .x(d => x(d.date))
      .y(d => y(d.value));

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#2563eb")
      .attr("stroke-width", 2)
      .attr("d", line);
  }, [data]);

  return <svg ref={ref} className="chart" />;
}