var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();

const signup = require('../config/mongodbconn');
const productdata = require('../config/productfetch');
const isAuth = require('../config/authendication');

router.get('/',isAuth,async (req, res, next)=> {
    const datas=await signup.find({role:{$ne:"mainadmin"}})
    res.render('mainadmin/mainadmin',{items:datas})
  });
  
  router.post('/adduser',isAuth,async (req, res, next)=> {
    const datas = {
      role:req.body.role,
      username:req.body.username,
      email: req.body.email,
      name: req.body.name,
      dob: req.body.dob,
      gender:req.body.gender,
      address:req.body.address,
      password: req.body.password
    }
    const existuser = await signup.findOne({ username: req.body.username })
    const existemail = await signup.findOne({ email: req.body.email })
  
    if (existuser) {
      console.log(existuser)
      res.render('mainadmin/mainadmin', { error: "User ID Already Exist" })
    }
    else if (existemail) {
      res.render('mainadmin/mainadmin', { error: "Email Already Exist" })
    }
    else {
      const saltRounds = 10;
      const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
      datas.password = hashpassword
      const result = await signup.insertMany(datas)
      console.log('Data inserted successfully:' + result);
      res.redirect('/mainadmin')
    }
  });

  //edit the user details
  router.get('/edit/:id',isAuth,async (req, res, next)=> {
    let proid=req.params.id;
    const data=await signup.findOne({_id:proid});
    if(data.gender=='male'){
      var flag=true;
    }
    else flag=false
    if(data.role=='user'){
      var user=true;
    }
    else user=false
    res.render('mainadmin/userpage',{data,flag,user})
  });
  router.post('/edit/:id',isAuth,async (req, res, next)=> {
    let proid=req.params.id;
    const datas = {
      role:req.body.role,
      name: req.body.name,
      dob: req.body.dob,
      gender:req.body.gender,
      address:req.body.address,
    }
     const data=await signup.updateOne({ _id: proid },datas);
    res.redirect('/mainadmin')
  });

  //delete the User
  router.get('/delete/:id',isAuth,async (req, res, next)=> {
    let proid = req.params.id;
    let removedata = await signup.deleteOne({_id : proid});    
    res.redirect('/mainadmin')
  });

  //searching
  router.post('/search',isAuth,async (req, res, next)=> {
    if(req.body.search){
      const filterdatas=await signup.find({name:new RegExp(`^${req.body.search}`, 'i') })
      if(filterdatas!=''){
        res.render('mainadmin/mainadmin',{items:filterdatas})
      }
      else{
        console.log("no data");
        res.render('mainadmin/mainadmin',{msg:"No Users Found"})
      }
    }
    else{
      res.redirect('/mainadmin')
    }
  });
  //view all products
  router.get('/allproduct',isAuth,async (req, res, next)=> {
    let allproduct = await productdata.find({});    
    res.render('mainadmin/allproduct',{product:allproduct})
  });
  //delete product
  router.get('/deleteproduct/:id',isAuth,async (req, res, next)=> {
    let proid = req.params.id;  
    let removedata = await productdata.deleteOne({_id : proid});
    // const data=await productdata.findOne({_id:proid});
    // const image = req.files.image;
    // image.mv('./public/uploadimage/' + data.image_url, (err) => {
    //   if (err) {
    //     return res.status(500).send(err);
    //   }
    //   res.redirect('/mainadmin/allproduct')
    // });
    res.redirect('/mainadmin/allproduct')
  });
  router.get('/logout', isAuth, (req, res) => {
    req.session.destroy()
    res.redirect('/')
  })
module.exports = router;