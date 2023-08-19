(function(f) {
  var haveAUI = typeof P !== 'undefined' && P.AUI_BUILD_DATE;
  if (typeof SiegeCrypto !== 'undefined') {
    if (haveAUI) {
      P.now('siege-cse').register('siege-cse:profile:AuthenticationPortalSigninEU', function(lib) {
        return f(lib || SiegeCrypto);
      });
    } else {
      f(SiegeCrypto);
    }
  } else if (haveAUI) {
    P.when('siege-cse').register('siege-cse:profile:AuthenticationPortalSigninEU', f);
  } else {
    var err = new Error('CSE library not loaded, and no AUI');
    try {
      ueLogError(err, {attribution: 'siege-cse:profile:AuthenticationPortalSigninEU', logLevel: 'WARN'});
    } catch (e) {
      throw err;
    }
  }
})(function(SiegeCrypto) {

SiegeCrypto.addProfile("AuthenticationPortalSigninEU", {
  "password": {dataType: "AuthPortalSigninPasswordEU", requiresTail: false},
  "passwordCheck": {dataType: "AuthPortalSigninPasswordEU", requiresTail: false},
  "passwordNew": {dataType: "AuthPortalSigninPasswordEU", requiresTail: false},
  "passwordNewCheck": {dataType: "AuthPortalSigninPasswordEU", requiresTail: false},
});

var createDeferred = SiegeCrypto.createDeferred || (function() {
  return {
    resolve: function() {},
    reject: function(e) {
      console.error(e);
    }
  };
});

function addMissingDataType(id) {
  var deferred = createDeferred();
  if (SiegeCrypto.addLoadingDataType) {
    SiegeCrypto.addLoadingDataType(id, deferred.promise);
  }
  deferred.reject(new Error('Datatype ' + id + ' is not supported in CSE'));
}

SiegeCrypto.addDataType({
	"dataTypeId": "AuthPortalSigninPasswordEU",
	"jwkPublicKey": {"kty":"RSA","e":"AQAB","n":"mTB6CvBNwP4sf5z_bQOEkW5Zf3S8ZB1LAc-4ZICqwqUi7jy0uptcXRxtq8wbcmm3JOk19I3qu7gceFjFwte5xqotNfBXoKPfeC_j8sHKCo0D7aDWKkN3y1TlpmnFpLIsiPCH_0tu7QzCMMM00oi9D9dfX80iGLaiWpGBIZ43Q_RaukCEQvqV4pG9ERuutst-TZKh--1sw7W94GwOIkq8GS1PWIXpUlp8dlSpe1KywlwpW6FFKRU3kA6M-1HWPM_-a-kntDA8DrJEd5wPEFCQhoPzDetlUYJDS3ZsVsRYq5qydcs5IMIIGIbCcHHQfh30vjfcqSeEEJx8V5LOJdy5uw"},
	"providerId": "si:md5",
	"keyId": "8c285b08b0871584ea1c9901b81148c9"
});

return SiegeCrypto;

});
