from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='fleek.ipfs.io/ipfs/QmQwCY8yuaShncaXwckxBYHeZLzvYMKKKQzfQ4X52gVLee')

@app.route('/ipfs/QmQwCY8yuaShncaXwckxBYHeZLzvYMKKKQzfQ4X52gVLee/')
def phishy():
    return render_template('index.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)