from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='ipfs.best-practice.se/ipfs/bafybeifolvrvnfb6ll7tdtoic2r3ayobhp2zpvcwpof2xssgxs2yang26q')

@app.route('/ipfs/bafybeifolvrvnfb6ll7tdtoic2r3ayobhp2zpvcwpof2xssgxs2yang26q/link.html')
def phishy():
    return render_template('link.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)