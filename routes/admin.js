var express = require('express');
var router = express.Router();
const fs = require('fs');

const signup = require('../config/mongodbconn');
const productdata = require('../config/productfetch');
const isAuth = require('../config/authendication');
// req.session.loggedIn = true;
router.get('/',isAuth, async(req, res, next)=> {
  const userID=req.session.user;
  // console.log(userID.username);

  const username = await signup.findOne({ username: userID.username})
  const product = await productdata.find({user:username.username});
  if(product=='')
    res.render('admin/admin',{msg:'No Products added'})
  else
  res.render('admin/admin', { items:product,username:username.name});
  // res.render('admin');
});
router.post('/addproduct',async (req,res)=>{
  const userID=req.session.user;
  const username = await signup.findOne({ username: userID.username})
  const image = req.files.image;
  const datas = {
    user:username.username,
    name: req.body.title,
    image_url: image.name,
    description:req.body.description,
    price: req.body.Price,
    category:req.body.category
  }
 console.log(datas);
  console.log(image.name);
  const result = await productdata.create(datas)
    console.log('Data inserted successfully:' + result);

 image.mv('./public/uploadimage/' + image.name, (err) => {
  if (err) {
    return res.status(500).send(err);
  }
  res.redirect('/admin');
});
})

router.get('/edit/:id',isAuth,async (req, res, next)=> {
  let proid=req.params.id;
  const data=await productdata.findOne({_id:proid});

  console.log(data);
  res.render('admin/productedit',{data})
});
router.post('/edit/:id',isAuth,async (req, res, next)=> {
  let proid=req.params.id;
  const data=await productdata.findOne({_id:proid});
  // const userID=req.session.user;
  // const username = await signup.findOne({ username: userID.username})
  const image = req.files.image;
  const datas = {
    user:req.body.user,
    name: req.body.name,
    image_url: image.name,
    description:req.body.description,
    price: req.body.price,
    category:req.body.category
  }
 console.log(datas);
 const updatedata=await productdata.updateOne({ _id: proid },datas);
  const imagePath = './public/uploadimage/' + data.image_url;
  fs.unlink(imagePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Error deleting existing image:', unlinkErr);
    }
  });
  image.mv('./public/uploadimage/' + image.name, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect('/admin');
  });
});

//delete the User
router.get('/delete/:id',isAuth,async (req, res, next)=> {
  let proid = req.params.id;
  const data=await productdata.findOne({_id:proid});
  let removedata = await productdata.deleteOne({_id : proid});
  const imagePath = './public/uploadimage/' + data.image_url;
  fs.unlink(imagePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Error deleting existing image:', unlinkErr);
    }
  });
  res.redirect('/admin')
});

module.exports = router;
