const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`,async (req, res)=>{ 
    const categoryList = await Category.find();

    if(!categoryList){
        res.status(500).json({success: false})
    }
    res.status(200).send(categoryList);
})

router.get('/:categoryId', async(req,res)=>{
    const category = await Category.findById(req.params.categoryId)
    if(!category){
        return res.status(500).json({success: false, message: 'categoryId has no category'}) 
    }
    res.status(200).send(category);

})

router.post('/',async(req, res)=>{
    let category = new Category({
        name: req.body.name,
        color: req.body.color,
        icon: req.body.icon,
        image: req.body.image
    })
    category = await category.save();
    if(!category){ //if no category created
        return res.status(404).json({success: false, message: 'the category cannot be created',}) 
        //return res.status(404).send('the category cannot be created')
    }
    res.send({category, message:'category is added'});
})

router.put('/:categoryId',async(req, res)=>{
    const category = await Category.findByIdAndUpdate(req.params.categoryId,
        {
            name: req.body.name,
            color: req.body.color,
            icon: req.body.icon,
            image: req.body.image
        },
        {new:true} //update new updated data

        )
        if(!category){ //if no category created
            return res.status(404).json({success: false, message: 'the category cannot be updated',}) 
            //return res.status(404).send('the category cannot be created')
        }
        res.send({category, message:'category is updated'});
   
})

router.delete('/:categoryId',async(req,res)=>{
    await Category.findByIdAndRemove(req.params.categoryId)
    .then(category =>{
        if(category){
            return res.status(200).json({success: true, message:'the category successfully deleted'})
        }else{
            return res.status(404).json({success: false, message:'category is not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error:err})
    })
})

/*router.delete('/:categoryId', async(req, res)=>{
     const category = await Category.findByIdAndRemove(req.params.categoryId)
        if(!category){
            return res.status(404).json({success: false, message:'category not found'})
            //return res.status(200).json({success: true, message:'the category successfully deleted!'})
        } 
        //res.status(200).send(category);
        res.status(200).json({success: true, message: 'category has deleted'})
})*/

// called app to initialize the route
//exchange data with the front end with GET request

module.exports= router;