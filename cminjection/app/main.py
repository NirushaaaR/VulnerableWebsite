from flask import Flask, request, render_template

app = Flask(__name__)

DEBUG = False

@app.route("/", methods=["GET", "POST"])
def index():
    context = {}
    if request.method == "POST":
        data = request.form.get("calculator")
        try:
            data = data.replace("__", "")
            result = eval(data)
        except:
            result = "Error!!"

        context["result"] = result

    return render_template("index.html", **context)

if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host='0.0.0.0', debug=DEBUG, port=12600)