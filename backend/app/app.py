from flask import Flask, Response
from data_loader import load_data

app = Flask(__name__)

@app.route("/api/ipca")
def ipca():
    return load_data()

if __name__ == "__main__":
    app.run(host="0.0.0.0")