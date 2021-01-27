import os
from flask import Flask, request, render_template

app = Flask(__name__)

DEBUG = bool(os.environ.get("DEBUG",None))

@app.route("/")
def index():
    note_name = request.args.get('file', default = "", type = str)
    note_content = ""
    try:
        if note_name:
            note_content = open(note_name).read()
    except FileNotFoundError:
        note_content = "ไม่มี Note นั้นอยู่!!"
    return render_template("index.html", note_content=note_content)
    

if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host='0.0.0.0', debug=DEBUG, port=12000)