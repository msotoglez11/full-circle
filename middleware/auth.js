function isLoggedIn(req,res,next){
    if(req.session.user){
        next();
    } else{
        res.redirect('/users/login');
    }
}
module.exports=isLoggedIn;
//is user exists then save to session
//otherwise redirect to login page