import * as d3 from "d3";

export const GROUP_GERAL = "Índice geral";

export const COLORS = {
  brasil: "#38bdf8",
  state: "#22c55e",
  muted: "#334155",
  bg: "#020617",
  axis: "#94a3b8",
  tooltipBg: "#020617",
  tooltipBorder: "#1e293b",
};

export const MAP_COLOR_SCALE = d3
  .scaleDiverging(d3.interpolateRdYlGn)
  .domain([-2, 0, 2]);

export const GEO_TO_DATASET = {
  Acre: "Rio Branco (AC)",
  Bahia: "Salvador (BA)",
  Ceará: "Fortaleza (CE)",
  "Distrito Federal": "Brasília (DF)",
  "Espírito Santo": "Grande Vitória (ES)",
  Goiás: "Goiânia (GO)",
  Maranhão: "São Luís (MA)",
  "Mato Grosso do Sul": "Campo Grande (MS)",
  "Minas Gerais": "Belo Horizonte (MG)",
  Pará: "Belém (PA)",
  Paraná: "Curitiba (PR)",
  Pernambuco: "Recife (PE)",
  "Rio de Janeiro": "Rio de Janeiro (RJ)",
  "Rio Grande do Sul": "Porto Alegre (RS)",
  Sergipe: "Aracaju (SE)",
  "São Paulo": "São Paulo (SP)",
};
