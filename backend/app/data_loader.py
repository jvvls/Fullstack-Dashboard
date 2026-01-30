import pandas as pd
import os

def load_data():
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))
    CSV_PATH = os.path.join(
        BASE_DIR,
        "data",
        "processed",
        "ipca_grupos_regioes_long.csv"
    )

    df = pd.read_csv(CSV_PATH)

    print(df.head())

    json_output = df.to_json(orient="records")
    print(json_output)

    return json_output