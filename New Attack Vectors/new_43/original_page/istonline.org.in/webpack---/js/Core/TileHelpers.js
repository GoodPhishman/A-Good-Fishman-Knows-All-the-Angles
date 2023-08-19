var Helpers = require("./Helpers");
var LoginConstants = require("../LoginPage/LoginConstants");

var ArrayHelpers = Helpers.Array;

var TileHelpers =
{
    mergeSessions: function (sharedSessions, newSessions, replaceOtherIdpSessions)
    {
        var addedSessions = [];

        
        
        
        ArrayHelpers.forEach(
            newSessions,
            function (newSession)
            {
                var duplicateSessionIndex = _findDuplicateSessionIndex(newSession, sharedSessions);

                if (duplicateSessionIndex === -1)
                {
                    
                    
                    if (newSession.isWindowsSso)
                    {
                        sharedSessions.unshift(newSession);
                    }
                    else
                    {
                        sharedSessions.push(newSession);
                    }

                    addedSessions.push(newSession);
                }
                else if (newSession.isWindowsSso)
                {
                    
                    
                    
                    
                    sharedSessions.splice(duplicateSessionIndex, 1);
                    sharedSessions.unshift(newSession);
                    addedSessions.push(newSession);
                }
                else if (replaceOtherIdpSessions)
                {
                    
                    
                    
                    
                    
                    sharedSessions.splice(duplicateSessionIndex, 1);
                    sharedSessions.push(newSession);
                    addedSessions.push(newSession);
                }
            });

        return addedSessions;
    },

    parseMeControlSessions: function (userJson)
    {
        var c_signedInToRP = 1; 
        var c_signedInToIDP = 2; 

        return ArrayHelpers.map(
            userJson,
            function (user)
            {
                var fullName = user.firstName;
                var lastName = user.lastName;

                if (lastName)
                {
                    
                    if (fullName)
                    {
                        fullName += " " + lastName;
                    }
                    else
                    {
                        fullName = lastName;
                    }
                }

                return {
                    id: user.sessionId,
                    fullName: fullName,
                    name: user.memberName || user.signInName,
                    displayName: user.memberName || user.signInName,
                    idp: LoginConstants.SessionIdp.Msa,
                    isOtherIdp: true,
                    isSignedIn: user.isSignedIn || user.authenticatedState === c_signedInToRP || user.authenticatedState === c_signedInToIDP,
                    isWindowsSso: user.isWindowsSso || false,
                    isMeControlSession: true,
                    isGitHubFed: user.isGitHubFed || false
                };
            });
    },

    parseBssoSessions: function (userJson)
    {
        return ArrayHelpers.map(
            userJson,
            function (session)
            {
                return {
                    ssoUniqueId: session.ssoUniqueId,
                    name: session.name,
                    displayName: session.displayName,
                    idp: LoginConstants.SessionIdp.Aad,
                    ssoLink: session.url,
                    isWindowsSso: session.isWindowsSso,
                    isSignedIn: session.isSignedIn
                };
            });
    }
};

function _findDuplicateSessionIndex(newSession, sessions)
{
    for (var i = 0; i < sessions.length; i++)
    {
        if (sessions[i].name === newSession.name && sessions[i].idp === newSession.idp)
        {
            return i;
        }
    }

    return -1;
}

module.exports = TileHelpers;