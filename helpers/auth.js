module.exports ={
    ensureAuthenticated: (req,res,next)=>{
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg','Kindly Login to access page' );
        res.redirect('/users/login');
    }
}