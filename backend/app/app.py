from flask import Flask, Response
from app.data_loader import load_data

app = Flask(__name__)

@app.route("/api/ipca")
def ipca():
    return load_data()