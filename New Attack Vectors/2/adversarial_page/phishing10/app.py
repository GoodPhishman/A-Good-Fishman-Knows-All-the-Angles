from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='storageapi.fleek.co/f672b375-ef55-42a7-bdff-b11eb8fc9abd-bucket')

@app.route('/f672b375-ef55-42a7-bdff-b11eb8fc9abd-bucket/66.html')
def phishy():
    return render_template('66.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)