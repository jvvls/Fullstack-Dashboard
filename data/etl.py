import pandas as pd
import os
import re

RAW_DIR = "data/raw"
OUTPUT_PATH = "data/processed/ipca_grupos_regioes_long.csv"

dfs = []

for filename in os.listdir(RAW_DIR):
    if not filename.endswith(".csv"):
        continue

    match = re.match(r"(\d{4})_(\d{2})\.csv", filename)
    if not match:
        continue

    ano = int(match.group(1))
    mes = int(match.group(2))

    file_path = os.path.join(RAW_DIR, filename)

    df = pd.read_csv(file_path, sep=";", encoding="utf-8")

    df.rename(columns={df.columns[0]: "grupo"}, inplace=True)

    df["grupo"] = df["grupo"].str.replace(r"^\d+\.", "", regex=True)
    df["grupo"] = df["grupo"].str.strip()

    df_long = df.melt(
        id_vars="grupo",
        var_name="regiao",
        value_name="variacao"
    )

    df_long = df_long.dropna(subset=["variacao"])

    df_long["variacao"] = (
        df_long["variacao"]
        .astype(str)
        .str.replace(",", ".")
        .astype(float)
    )

    df_long["regiao"] = df_long["regiao"].str.strip()

    df_long["ano"] = ano
    df_long["mes"] = mes

    df_long = df_long[["ano", "mes", "grupo", "regiao", "variacao"]]

    dfs.append(df_long)

df_final = pd.concat(dfs, ignore_index=True)

df_final.to_csv(
    OUTPUT_PATH,
    index=False,
    sep="\t"
)
print("ETL FINALIZADO COM SUCESSO")
print(f"Linhas geradas: {df_final.shape[0]}")
