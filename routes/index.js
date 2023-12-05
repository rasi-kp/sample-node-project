var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();


const signup = require('../config/mongodbconn');
const productdata = require('../config/productfetch');
const cartadd = require('../config/cartconnection');
const isAuth = require('../config/authendication');
const userhelpers=require('../Helpers/userhelpers');
router.get('/', async(req, res, next) => {
  let user = req.session.user
  
  if (req.session.loggedIn) {
    const username = await signup.findOne({ username:user.username })
    if(username.role=='user')
    res.redirect('/home');
    else if(username.role=='mainadmin')
    res.redirect('/mainadmin');
    else
     res.redirect('/admin')
  } else {
    res.render('users/login');
  }
});

/* GET home page. */
router.get('/home', isAuth, async (req, res, next) => {
  const currentuser=req.session.user;
  // const username = await signup.findOne({ username:currentuser.username })
  const data = await productdata.findallproduct;
  const username = await userhelpers.findusername(currentuser.username);

  res.render('users/home', { username: username.name, items: data });
});

//post home page login sucess post data
router.post('/home', async (req, res) => {
  const usercheck = await signup.findOne({ username: req.body.username })
  if (!req.body.username || !req.body.password) {
    res.render('users/login', { errorMessage: "Pls Enter the details" })
  }
  else if (!usercheck) {
    res.render('users/login', { errorMessage: 'Invalied User ID' });
  }
  else {
    const passwordmatch = await bcrypt.compare(req.body.password, usercheck.password)
    if (passwordmatch) {
      req.session.loggedIn = true;
      req.session.user = req.body;
      if (usercheck.role == 'mainadmin')
        res.redirect('/mainadmin');
      else if (usercheck.role == 'admin')
        res.redirect('/admin');
      else
        res.redirect('/home')
    }
    else {
      res.render('users/login', { errorMessage: "Invalied Password" });
    }
  }
});
router.get('/order', isAuth, (req, res) => {
  res.render('users/order');
})
//logout session clear and back to login page
router.get('/logout', isAuth, (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
router.get('/signup', (req, res) => {
  res.render('users/signup')
})
//signup form setup
router.post('/signup', async (req, res) => {
  console.log(req.body);
  const datas = {
    role: "user",
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
    dob: req.body.dob,
    gender: req.body.gender,
    address: req.body.address,
    password: req.body.password
  }
  const existuser = await signup.findOne({ username: req.body.username })
  const existemail = await signup.findOne({ email: req.body.email })

  if (existuser) {
    console.log(existuser)
    res.render('users/signup', { errorMessage: "UserID Already Exist" })
  }
  else if (existemail) {
    res.render('users/signup', { errorMessage: "Email Already Exist" })
  }
  else if (!existemail && !existuser && !datas.password) {
    res.render('users/signup', { errorMessage: "Pls Enter the details" })
  }
  else {
    const saltRounds = 10;
    const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
    datas.password = hashpassword
    const result = await signup.insertMany(datas)
    console.log('Data inserted successfully:' + result);
    res.redirect('/')
  }
})
router.get('/cart/:id',isAuth, async(req, res) => {
  try {
    const productId = req.params.id;
    const user = req.session.user;

    // Find the user's cart or create a new one if it doesn't exist
    let userCart = await cartadd.findOne({ userId: user.username });

    if (!userCart) {
      userCart = new CartModel({
        userId: user.username,
        items: [],
      });
    }

    // Check if the product is already in the cart
    const existingItemIndex = userCart.items.findIndex(item => String(item.productId) === productId);

    if (existingItemIndex !== -1) {
      // If the product is already in the cart, update the quantity
      userCart.items[existingItemIndex].quantity += 1;
    } else {
      // If the product is not in the cart, add a new item
      userCart.items.push({
        productId: productId,
        quantity: 1,
      });
    }

    // Save the updated cart to the database
    await userCart.save();

    // Redirect to the home page or wherever you want to go
    res.redirect('/home');
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).send('Internal Server Error');
  }
});
//   const proid = req.params.id;
//     const user = req.session.user;
//     let userCart = await cartadd.findOne({ userId: user.username });
//     if (!userCart) {
//       userCart = new CartModel({
//         userId: user.username,
//         items: [],
//       });
//     }
//     else {
//       // If the product is not in the cart, add a new item
//       userCart.items.push({
//         productId: productId,
//         quantity: 1,
//       });
//     }
//     await userCart.save();
//     res.redirect('/home');
// })


module.exports = router;
