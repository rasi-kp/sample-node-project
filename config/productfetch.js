const mongoose=require('mongoose');
// const connect=mongoose.connect("mongodb://127.0.0.1:27017/store")
// connect.then(() => {
//     console.log("connection sucessfully");
// })
// .catch(()=>{
//     console.log("error in connection");
// })
const productSchema = new mongoose.Schema({
    user: String,
    name: {
        type: String,
        required: true
    },
    image_url: String, // Updated field name
    description: String,
    price: {
        type: Number,
        required: true
    },
    category: String,
});


const productdata=new mongoose.model('products',productSchema)

module.exports=productdata;