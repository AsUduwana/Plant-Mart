const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); //password hash
const jwt = require('jsonwebtoken'); //create token 

router.get(`/`,async (req, res)=>{ 
    const userList = await User.find().select('-passworHash');

    if(!userList){
        res.status(500).json({success: false})
    }
    res.send(userList);
})
// called app to initialize the route
//exchange data with the front end with GET request

router.get('/:userId', async(req,res)=>{
    const user = await User.findById(req.params.userId).select('-passwordHash');
    if(!user){
        return res.status(500).json({success: false, message: 'no user from that ID'}) 
    }
    res.status(200).send(user);

})

router.post('/',async(req, res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10), // adding salt for password
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        address1: req.body.address1,
        address2: req.body.address2,
        zip: req.body.zip,
        city: req.body.city,
    })
    user = await user.save();
    if(!user){ //if no category created
        return res.status(404).json({success: false, message: 'The user cannot be registered',}) 
        //return res.status(404).send('the category cannot be created')
    }
    res.send({user, message:'user is added'});
})

//user can register
router.post('/register',async(req, res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10), // adding salt for password
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        address1: req.body.address1,
        address2: req.body.address2,
        zip: req.body.zip,
        city: req.body.city,
    })
    user = await user.save();
    if(!user){ //if no category created
        return res.status(404).json({success: false, message: 'the user cannot be registered',}) 
        //return res.status(404).send('the category cannot be created')
    }
    res.send({user, message:'user is added'});
})



router.post('/login',async(req, res)=>{
    //user need to loging using email and password

    const user = await User.findOne({email: req.body.email});
    const secret = process.env.secret;

    if(!user){ //if no email found
        return res.status(400).json({success: false, message: 'The user not found',}) 
    }
    //compare the body password with hash
    if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){
        const token = jwt.sign({
            userId : user.id,
            //seperate users and admins by token
            isAdmin: user.isAdmin
        },
        secret,{
            expiresIn: '1d' // make token expire
        }
        )
        return res.status(200).json({user: user.email, token:token , message:'user authenticated & token created'});
    }else{
        return res.status(400).json({success: false, message:'Wrong Password!'});
    }
    //return res.status(200).json({user, message:'user found'});
})
//usercount API for admin
router.get(`/get/count`,async (req, res)=>{ 
    const userCount = await User.countDocuments() //mongoose method to count documents in table with callback

    if(!userCount){
        res.status(500).json({success: false })
    }
    res.send({
        userCount: userCount
    });
})
router.delete('/:userId',async(req,res)=>{
    await User.findByIdAndRemove(req.params.userId)
    .then(user =>{
        if(user){
            return res.status(200).json({success: true, message:'the user successfully deleted'})
        }else{
            return res.status(404).json({success: false, message:'user not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error:err})
    })
})

module.exports= router;

/*{
    "name" : "jothipala",
    "email": "jothipala@email.com",
    "passwordHash": "12345",
    "phone": "0123456789",
    "isAdmin": true,
    "address1": "No 100",
    "zip":"12345",
    "city":"Colombo",
}*/