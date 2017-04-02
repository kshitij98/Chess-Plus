var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {
    var valid = true;
    console.log(req.body);
    if (valid) {
        // make dashboard
        res.render('/dashboard', {username: req.body.username});
    }
    else {
        // change this accordingly
        res.redirect('/');
    }
});

module.exports = router;
