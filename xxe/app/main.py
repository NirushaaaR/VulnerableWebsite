import os
from flask import Flask, request, render_template
from lxml import etree

app = Flask(__name__)

DEBUG = bool(os.environ.get("DEBUG",None))

@app.route("/", methods=["GET", "POST"])
def hello():
    parsed_xml = ""
    if request.method == 'POST':
        xml = request.form['xml']
        parser = etree.XMLParser(no_network=False, dtd_validation=False, load_dtd=True, huge_tree=True)
        try:
            doc = etree.fromstring(xml.encode(), parser)
            parsed_xml = etree.tostring(doc).decode('utf8')
            print(parsed_xml)
        except Exception as err:
            print(err)
            parsed_xml = str(err)
    return render_template("index.html", parsed_xml=parsed_xml)

if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host='0.0.0.0', debug=DEBUG, port=9000)