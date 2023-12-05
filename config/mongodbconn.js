
const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://127.0.0.1:27017/store")
connect.then(() => {
    console.log("connection sucessfully");
})
    .catch(() => {
        console.log("error in connection");
    })

const signup = new mongoose.Schema({
    role: String,
    username: String,
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    dob: {
        type: String,
    },
    gender: String,
    address: String,
    password: {
        type: String,
        required: true
    }
})
const signupdata = new mongoose.model("users", signup)
module.exports = signupdata;



