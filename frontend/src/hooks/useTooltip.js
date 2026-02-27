import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { COLORS } from "../constants/chartConfig";

export function useTooltip() {
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
