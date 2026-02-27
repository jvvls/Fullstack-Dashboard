import { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  COLORS,
  GEO_TO_DATASET,
  GROUP_GERAL,
  MAP_COLOR_SCALE,
} from "../constants/chartConfig";
import { useTooltip } from "../hooks/useTooltip";

export default function MapChart({ geo, data, selected, onSelect }) {
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
  }, [geo, data, selected, onSelect, tooltip]);

  return <svg ref={ref} className="map-svg" />;
}
