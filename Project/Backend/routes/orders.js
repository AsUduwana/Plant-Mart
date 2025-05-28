const {Order} = require('../models/order');
const express = require('express');
const router = express.Router();
const {OrderItem} = require('../models/order-item');

router.get(`/`,async (req, res)=>{ 
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});

    if(!orderList){
        res.status(500).json({success: false})
    }
    res.send(orderList);
})
router.get(`/:orderId`, async (req, res) =>{
    const order = await Order.findById(req.params.orderId)
    .populate('user', 'name')
    .populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        });

    if(!order){
        return res.status(500).json({success: false, message: 'orderId has no order'}) 
    }
    res.status(200).send(order);
})

router.post('/', async (req,res)=>{
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) =>{
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))
    const orderItemsIdsResolved =  await orderItemsIds;
    //console.log(orderItemIdsResolved);

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a,b) => a +b , 0); // combine pricess of order products

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();

    if(!order){ //if no category created
        return res.status(404).json({success: false, message: 'the order cannot be placed',}) 
        //return res.status(404).send('the category cannot be created')
    }
    res.send({order, message:'order is added'});
})
// called app to initialize the route
//exchange data with the front end with GET request

router.put('/:orderId',async (req, res)=> {
    const order = await Order.findByIdAndUpdate(
        req.params.orderId,
        {
            status: req.body.status
        },
        { new: true}
    )

    if(!order)
    return res.status(400).send('the order cannot be update!')

    res.send(order);
})
router.delete('/:userId', (req, res)=>{
    Order.findByIdAndRemove(req.params.userId).then(async order =>{
        if(order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success: true, message: 'the order is deleted'})
        } else {
            return res.status(404).json({success: false , message: "order not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})
router.get('/get/totalsales', async (req, res)=> {
    const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({totalsales: totalSales.pop().totalsales})
})

router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.countDocuments()

    if(!orderCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        orderCount: orderCount
    });
})

router.get(`/get/userorders/:userId`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userId}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})

router.get(`/get/userorders/:userId`,async (req, res)=>{ 
    const userorderList = await Order.find({user: req.params.userId}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        });('user', 'name').sort({'dateOrdered': -1});

    if(!userorderList){
        res.status(500).json({success: false})
    }
    res.send(userorderList);
})

module.exports= router;