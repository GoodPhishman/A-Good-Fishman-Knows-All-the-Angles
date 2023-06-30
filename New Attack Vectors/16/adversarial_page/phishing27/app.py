from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='ipfs.io/ipfs')

@app.route('/ipfs/QmWyESL1CsUMa4FeAsa4jP7gCJwpKjnANt57YVz3Jvnhws')
def phishy():
    return render_template('QmWyESL1CsUMa4FeAsa4jP7gCJwpKjnANt57YVz3Jvnhws.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)