'use strict';




function SessionsController(app, router) {
    router.post('/session/', post);
    router.delete('/session/', remove);

    function post(req, res, next) {
        //TODO: Make sure this is called over https
        //TODO : Harden against brute force attacks
        
        //Already logged in? return 403
        if(framework.helpers.session.isLoggedIn(req)) {
            return next(framework.error(1, 403, 'User is already logged in!'))
        }

        var username = req.body.username;
        var password = req.body.password;


        var sessionData = framework.helpers.session.login(username, password);
        if(!sessionData) {
            return next(framework.error(1, 401, 'Invalid credentials'))
        }

        res.send({'sessionId' : sessionData.id});

    }

    function remove(req, res, next) {
        //Middleware won't allow the user to reach this section without being logged in first
    }

}

module.exports = SessionsController;
