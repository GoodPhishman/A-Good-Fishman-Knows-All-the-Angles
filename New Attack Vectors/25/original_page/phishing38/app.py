from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='u1945162.plsk.regruhosting.ru')

@app.route('/')
def phishy():
    return render_template('indexb9f0.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)