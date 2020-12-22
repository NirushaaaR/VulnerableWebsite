import os
from flask import Flask, request, render_template, flash, redirect, url_for, make_response
import pymongo
from bson import ObjectId
import jwt
from ast import literal_eval

app = Flask(__name__)
app.secret_key = b'268253972110107b860ed1b86e43ef9413b437bff7d6ee3432dabc2fff35e7a3'

DEBUG = bool(os.environ.get("DEBUG",None))

client = pymongo.MongoClient("mongodb+srv://new_user31:dp0kona7qbL6PC9U@cluster0.qoyom.mongodb.net/vulnDb?retryWrites=true&w=majority")
db = client.vulnDb
user_collection = db.users
# user {username str, password str, secrets []}

def create_token(user_id):
    encoded_jwt = jwt.encode({'id': str(user_id)}, app.secret_key, algorithm='HS256')
    return encoded_jwt.decode('ascii')


def decode_token(token):
    user_id = jwt.decode(token, app.secret_key, algorithms=['HS256'])["id"]
    user = user_collection.find_one({"_id": ObjectId(user_id)})
    return user


def reset_db():
    user_collection.delete_many({})

    users = [{
        "username": "Dang",
        "password": "aLmKs12psl@fs",
        "secrets": ["ใคร ๆ ก็มีความลับกันทั้งนั้น", "โลกนี้นะเราไว้ใจใครไม่ได้หรอก", "FLAG{NOSQL_INJECTION_GO_BURRR}"]
    }, {
        "username": "John",
        "password": "sdjjipoq255@a",
        "secrets": ["อย่าถามว่าเราเพ้อถึงใคร ก็เธอเองนั่นไง เธอนั่นแหละ เธอหน่ะ"]
    }]

    user_collection.insert_many(users)

reset_db()

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
            return render_template("register.html")
        user_exists = user_collection.find_one({"username": username})
        if user_exists:
            flash("username นี้ถูกใช้ไปแล้วกรุณาใช้ username อื่น")
            return render_template("register.html")
        user = {
            "username": username,
            "password": password,
            "secrets": []
        }

        # TODO: fail safe if the user are more than ... collection reset database
        count_user = user_collection.count_documents()
        print(count_user)
        if count_user > 50:
            # reset database
            reset_db()

        result = user_collection.insert_one(user)
        user_id = result.inserted_id
        # create token here
        token = create_token(user_id)
        resp = make_response(redirect(url_for("secret")))
        resp.set_cookie('token_nosqli', token, httponly=True)
        return resp
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        try:
            # so the challenge is easier
            password = literal_eval(password)
        except:
            pass
        
        print(password)
        # nosql injection!!
        user = user_collection.find_one({"username": username, "password": password})
        if user is not None:
            # token
            token = create_token(user["_id"])
            resp = make_response(redirect(url_for("secret")))
            resp.set_cookie('token_nosqli', token, httponly=True)
            return resp
        flash("username หรือ password ผิด")
    return render_template("login.html")

@app.route("/secret", methods=["GET", "POST"])
def secret():
    token = request.cookies.get("token_nosqli")
    if not token:
        flash("ต้อง login ก่อนถึงจะใช้บริการได้")
        return redirect("login")
    # decode token
    user = decode_token(token)
    if not user:
        flash("token หมกอายุกรุณา login ใหม่")
        resp = (redirect("login"))
        resp.set_cookie("token_nosqli", "", max_age=0)
        return resp
    
    if request.method == "POST":
        if len(user.get("secrets", [])) >= 3:
            flash("secret ของคุณเต็มแล้ว กรุณาจ่าย 100000000000000 บาทเพื่อเก็บ secret อย่างไม่จำกัด!!")
        else:
            secret = request.form["secret"]
            user["secrets"].append(secret)
            user_collection.update_one({ "_id": ObjectId(user["_id"]) }, { "$set": {"secrets": user["secrets"]} })
    # return secret
    return render_template("secret.html", secrets=user.get("secrets", []))

if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host='0.0.0.0', debug=DEBUG, port=10000)