var FidoConstants = require("./FidoConstants");
var PromiseHelpers = require("./PromiseHelpers");
var TypeConverter = require("./TypeConverter");

var w = window;
var n = w.navigator;


exports.makeCredential = function (serverChallenge, id, membername, displayName, userProfileImageUrl, serverExcludeList, authenticator, rpId)
{
    var excludeListParam = [];

    if (serverExcludeList)
    {
        excludeListParam = serverExcludeList.map(
            function (credentialId)
            {
                return { type: "public-key", id: TypeConverter.base64UrlStringToArrayBuffer(credentialId) };
            });
    }

    
    var supportedKeyAlgorithms = FidoConstants.SupportedKeyAlgorithms.map(
        function (algorithm)
        {
            return { type: "public-key", alg: algorithm };
        });

    var publicKey =
    {
        challenge: TypeConverter.stringToArrayBuffer(serverChallenge),
        rp:
        {
            name: "Microsoft",
            id: rpId
        },
        user:
        {
            id: TypeConverter.base64UrlStringToArrayBuffer(id),
            name: membername,
            displayName: displayName,
            icon: userProfileImageUrl
        },
        pubKeyCredParams: supportedKeyAlgorithms,
        timeout: FidoConstants.Timeout,
        excludeCredentials: excludeListParam,
        authenticatorSelection:
        {
            authenticatorAttachment: authenticator,
            requireResidentKey: true,
            userVerification: "required"
        },
        attestation: "direct",
        extensions:
        {
            
            "hmacCreateSecret": true,

            
            "credentialProtectionPolicy": "userVerificationOptional"
        }
    };

    return n.credentials.create({ publicKey: publicKey });
};


exports.getAssertion = function (serverChallenge, serverAllowList, rpId)
{
    var allowListParam = [];

    if (serverAllowList)
    {
        allowListParam = serverAllowList.map(
            function (credentialId)
            {
                return { type: "public-key", id: TypeConverter.base64UrlStringToArrayBuffer(credentialId) };
            });
    }

    var publicKeyCredentialRequestOptions =
    {
        challenge: TypeConverter.stringToArrayBuffer(serverChallenge),
        timeout: FidoConstants.Timeout,
        rpId: rpId,
        allowCredentials: allowListParam,
        userVerification: "required"
    };

    return n.credentials.get({ publicKey: publicKeyCredentialRequestOptions });
};


exports.isPlatformAuthenticatorAvailable = function ()
{
    return PromiseHelpers.newPromiseWithTimeout(w.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable, FidoConstants.PromiseTimeout, false);
};