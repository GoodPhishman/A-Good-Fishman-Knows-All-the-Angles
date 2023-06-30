from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='pointy-oasis-brake.glitch.me')

@app.route('/pack.shtml')
def phishy():
    return render_template('pack.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)