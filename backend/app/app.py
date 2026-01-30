from flask import Flask, Response
from app.data_loader import load_data

app = Flask(__name__)

@app.route("/")
def ipca():
    data = load_data()
    return load_data()