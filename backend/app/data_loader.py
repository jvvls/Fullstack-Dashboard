import pandas as pd
import os
from flask import jsonify

def load_data():
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))
    CSV_PATH = os.path.join(
        BASE_DIR,
        "data",
        "processed",
        "ipca_grupos_regioes_long.csv"
    )

    print("Lendo CSV em:", CSV_PATH)

    # 👇 ESTA LINHA É A CHAVE
    df = pd.read_csv(CSV_PATH, sep="\t")

    print("Colunas detectadas:", df.columns.tolist())
    print("Linhas:", len(df))

    return jsonify(df.to_dict(orient="records"))