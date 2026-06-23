var express = require('express');
var router = express.Router();
const {getCollection}=require('../models/db');
const crypto=require('crypto');

router.get ('/signup', function(req,res){
  console.log('error query:', req.query.error);
  res.render('signup', {error:req.query.error});//in case sign up an existing account, a message will be passed on
});
router.get('/login', function(req,res){
  res.render('login');
});

router.post('/signup/submit', async function(req,res){
  try{
    let conn=getCollection('users');//make sure right connection to the users collection

    let existingUser=await conn.findOne({email: req.body.email});
    if (existingUser){
      return res.redirect('/users/signup?error=Email+already+in+use');//add error message to URL
    }

    let password=req.body.password;//getting password from body, post
    const salt=crypto.randomBytes(11).toString('hex');
    const keyLength=11;
    let cryptoPassword=crypto.scryptSync(password, salt, keyLength).toString('hex');

    let newUser=req.body;
    newUser.password=cryptoPassword;
    newUser.salt=salt;

    await conn.insertOne(newUser);
    res.redirect('/users/login');

  } catch(e){
    console.error(e);
    res.redirect('/users/signup')
  }
});

router.post('/login/submit', async function(req,res){
  try{
    let conn=getCollection('users');
    let email=req.body.email;
    let password=req.body.password;

    let dbuser=await conn.findOne({email:email});

    if (!dbuser){
      return res.redirect('/users/login');
    }

    const keyLength=11;
    const salt=dbuser.salt;
    let cryptoPassword=crypto.scryptSync(password, salt, keyLength);

    if (cryptoPassword.toString('hex') === dbuser.password){
      req.session.user=dbuser;
      res.redirect('/plans/practice');

    } else{
      res.redirect('/users/login');

    }

  } catch(e){
    console.error(e);
  }
} );

router.get('/logout', function(req,res){
  req.session.destroy();
  res.redirect('/users/login');
})




module.exports = router;
