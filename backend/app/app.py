from flask import Flask, jsonify
import pandas as pd
import os

app = Flask(__name__)

BASE_DIR = os.getcwd()  
CSV_PATH = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "ipca_grupos_regioes_long.csv"
)

@app.route("/api/ipca")
def ipca():
    print("Lendo CSV em:", CSV_PATH)

    df = pd.read_csv(CSV_PATH, sep="\t")
    return jsonify(df.to_dict(orient="records"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)