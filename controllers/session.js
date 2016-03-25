'use strict';




function SessionsController(app, router) {

    var sessionHelper = framework.helpers.session;

    router.get('/session/', get);
    router.post('/session/', post);
    router.delete('/session/', remove);

    function get(req, res, next) {
        //Already logged in? return 403
        res.status(204).send();
    }

    function post(req, res, next) {
        //TODO: Make sure this is called over https
        //TODO : Harden against brute force attacks
        
        //Already logged in? return 403
        if(sessionHelper.isLoggedIn(req)) {
            return next(framework.error(1, 403, 'User is already logged in!'))
        }

        var username = req.body.username;
        var password = req.body.password;


        var sessionData = sessionHelper.login(username, password);
        if(!sessionData) {
            return next(framework.error(1, 401, 'Invalid credentials'))
        }

        res.send({'sessionId' : sessionData.id});

    }

    function remove(req, res, next) {
        //Middleware won't allow the user to reach this section without being logged in first
        sessionHelper.logout(req);
        res.status(204).send();
    }

}

module.exports = SessionsController;
