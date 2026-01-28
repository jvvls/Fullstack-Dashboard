import pandas as pd
import re

INPUT_PATH = "data/raw/ipca_grupos_regioes.csv"

OUTPUT_PATH = "data/processed/ipca_grupos_regioes_long.csv"

df = pd.read_csv(INPUT_PATH, sep=";", encoding="utf-8")

df.rename(columns={df.columns[0]: "grupo"}, inplace=True)

df["grupo"] = df["grupo"].str.replace(r"^\d+\.", "", regex=True)

df["grupo"] = df["grupo"].str.strip()

df_long = df.melt(
    id_vars="grupo",
    var_name="regiao",
    value_name="variacao"
)

df_long = df_long.dropna(subset=["variacao"])

df_long["variacao"] = df_long["variacao"].astype(str)
df_long["variacao"] = (
    df_long["variacao"]
    .str.replace(",", ".")
    .astype(float)
)

df_long["regiao"] = df_long["regiao"].str.strip()

df_long.to_csv(OUTPUT_PATH, index=False)

print("ETL finalizado com sucesso!")
print(f"Arquivo gerado em: {OUTPUT_PATH}")
