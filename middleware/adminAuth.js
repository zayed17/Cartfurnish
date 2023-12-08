const isLogin = (req, res, next) => {
    try {
      if (req.session.admin_id) {
        next();
      } else {
        res.redirect('/admin');
      }
    } catch (error) {
      console.error(error.message);
      res.redirect('/admin/login'); // Redirect in case of unexpected error
    }
  };

  const isLogout = async (req,res,next)=>{

    try {
        
        if (req.session.admin_id) {
            res.redirect('/admin/dashboard')
        } else {
            next();
        }
        
    } catch (error) {
        
        console.log(error.message);

    }
}


  module.exports = {
    isLogin,
    isLogout
  }