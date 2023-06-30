from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='teams.de-php.info/view')

@app.route('/view/892eada7-289b-450c-8c83-2831308e7d05')
def phishy():
    return render_template('892eada7-289b-450c-8c83-2831308e7d05.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)