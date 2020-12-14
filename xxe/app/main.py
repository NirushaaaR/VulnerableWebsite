import os
from flask import Flask, request
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
        except:
            print("Not XML")
    return f"""
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XXE</title>
</head>
<body>
    <form method="post" id="xml-form">
        <textarea name="xml" id="xml-form" cols="30" rows="10"></textarea>
        <button>Submit</button>
    </form>
    {parsed_xml}
</body>
</html>
    """

if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host='0.0.0.0', debug=DEBUG, port=9000)