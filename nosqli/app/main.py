import os
from flask import Flask, request, render_template, flash, redirect, url_for, make_response
import pymongo
from hashlib import md5
import jwt

app = Flask(__name__)
app.secret_key = b'268253972110107b860ed1b86e43ef9413b437bff7d6ee3432dabc2fff35e7a3'

DEBUG = bool(os.environ.get("DEBUG",None))

client = pymongo.MongoClient("mongodb+srv://new_user31:dp0kona7qbL6PC9U@cluster0.qoyom.mongodb.net/vulnDb?retryWrites=true&w=majority")
db = client.vulnDb
user_collection = db.users
# user {username str, password str, secrets []}

def create_token(user_id):
    encoded_jwt = jwt.encode({'id': user_id}, app.secret_key, algorithm='HS256')
    return encoded_jwt.decode('ascii')


def decode_token(token):
    user_id = jwt.decode(token, app.secret_key, algorithms=['HS256'])
    user = user_collection.find_one({"_id": user_id})
    return user


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        password2 = request.form["password2"]
        if password != password2:
            flash("password ไม่เหมือนกัน")
        user = {
            "username": username,
            "password": md5(password.encode()),
            "secrets": []
        }
        result = user_collection.insert_one(user)
        user_id = result.inserted_id
        # TODO: fail safe if the user are more than ... collection reset database
        # create token here
        token = create_token(user_id)
        resp = make_response(redirect(url_for("secret")))
        resp.set_cookie('token_nosqli', token, httponly=True)
        return resp
    return render_template("register.html")

@app.route("/login")
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        user = user_collection.find_one({"username": username, "password": md5(password.encode())})
        if user is not None:
            # token
            token = create_token(user["_id"])
            resp = make_response(redirect(url_for("secret")))
            resp.set_cookie('token_nosqli', token, httponly=True)
            return resp
        flash("username หรือ password ผิด")
    return render_template("login.html")

@app.route("/secret")
def secret():
    token = request.cookies.get("token_nosqli")
    if not token:
        flash("ต้อง login ก่อนถึงจะใช้บริการได้")
        return redirect("login")
    # decode token
    user = decode_token(token)
    if not user:
        flash("token หมกอายุกรุณา login ใหม่")
        return redirect("login")
    # return secret
    return render_template("secret.html", secrets=user.get("secrets", []))

if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host='0.0.0.0', debug=DEBUG, port=10000)