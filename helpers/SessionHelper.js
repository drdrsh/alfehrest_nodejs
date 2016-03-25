'use strict';

//This is a very simple file system session handler, not meant to be super secure in any way
/* Weaknesses :
*   Allows for session hijack if attacker knows vicitim session_id
*   prone to brute force attacks
*
*/
var SessionHelper = {};
var path   = require("./PathHelper.js");
var fs     = require('fs');
var crypto = require('crypto');

//TODO: Proper session token validation
function validateSession(req) {
    return true;
}

function getSessionIdFromHeaders(req) {
    var auth = req.headers['authorization'];
    if(!auth) {
        return null;
    }
    //We will use this as a file name, make sure nothing suspecious is in
    var validToken = /[A-Za-z0-9]{64}/ig;
    if(!validToken.test(auth)) {
        return false;
    }
    return auth;
}

SessionHelper.requestRequiresAuthentication = function(req) {

    var allowedRoutes = framework.helpers.settings.get('general', 'no_auth_routes');
    var requestMethod = req.method.toLowerCase();
    
    //Remove initial and trailing slashes
    var requestUrl = req.originalUrl.substr(framework.rootUrl.length).replace(/^\//ig, '').replace(/\/$/ig, '');

    var l = allowedRoutes.length;
    for(let i=0; i<l; i++) {
        let methodMatch = false;
        let pathMatch = true;

        let parts = allowedRoutes[i].split(':');
        let allowedMethod= parts[0];
        let allowedRoute = parts[1].replace(/^\//ig, '').replace(/\/$/ig, '');
        let requestRoute = requestUrl + '/';

        if(allowedMethod === '*' || requestMethod === allowedMethod) {
            methodMatch = true;
        } else {
            continue;
        }

        let regex = new RegExp(allowedRoute);
        pathMatch = regex.test(requestRoute);

        if(methodMatch && pathMatch) {
            return false;
        }
    }

    return true;
};

SessionHelper.logout = function(req) {
    var auth = getSessionIdFromHeaders(req);
    var sessionFN = path.sessions(`${auth}.json`);
    fs.unlinkSync(sessionFN);
    return true;
};

SessionHelper.login = function(username, password) {

    /* Prevent username 'test' from logging in if we are not in test env
    *  just a security precaution against forgetfulness :)
    */
    if(framework.env !== 'test' && username === 'test') {
        return false;
    }

    var sessionDirectory = path.sessions();
    fs.existsSync(sessionDirectory) || fs.mkdirSync(sessionDirectory);

    var hash = crypto.createHash('sha256');
    hash.update(password);
    var hashedPassword = hash.digest('hex');

    var profileFN = path.profiles(`${username}.json`);
    if(!fs.existsSync(profileFN)) {
        return null;
    }

    var buf = fs.readFileSync(profileFN, "utf8");
    var userProfile = JSON.parse(buf);

    //Could be hardened against timed requests
    if(userProfile.password != hashedPassword) {
        return null;
    }

    const sessionId = crypto.randomBytes(32).toString('hex');
    var sessionStart = new Date().getTime();
    var sessionFN = path.sessions(`${sessionId}.json`);
    var session = {
        'id': sessionId,
        'username': username,
        'dateStarted': sessionStart,
        'lastActivity': sessionStart
    };
    fs.writeFileSync(sessionFN, JSON.stringify(session), 'utf-8');

    return session;

};

SessionHelper.isLoggedIn = function(req) {

    var auth = getSessionIdFromHeaders(req);

    if(!auth || !validateSession(req)) {
        return false;
    }

    var sessionFN = path.sessions(`${auth}.json`);

    if(!fs.existsSync(sessionFN)) {
        return false;
    }

    var buf = fs.readFileSync(sessionFN, "utf8");
    var userSession = JSON.parse(buf);

    var noActivityFor = new Date().getTime() - userSession.lastActivity;
    var noActivityLimit = framework.helpers.settings.get('general', 'max_session') * 60 * 1000;
    if(noActivityFor > noActivityLimit) {
        fs.unlinkSync(sessionFN);
        return false;
    }

    userSession.lastActivity = new Date().getTime();
    fs.writeFileSync(sessionFN, JSON.stringify(userSession), 'utf-8');

    return true;
};

module.exports = SessionHelper;
