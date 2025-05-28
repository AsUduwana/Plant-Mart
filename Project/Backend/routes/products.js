const {Product} = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose =require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = { //define MIME type
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        //cb(null,fileName + '-'+ Date.now())
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({ storage: storage });


 //ex: http://localhost:3000/api/v1/products
 //API for filter data rather than display all of every products
router.get(`/`,async (req, res)=>{ 
    //send query parameter
    // example : http://localhost:3000/api/v1/products?categories=<category-1_ID>,<category-3_ID>,...
    let filter = {};
    if(req.query.categories)
    {
        filter = {category: req.query.categories.split(',')} //split the string based on coma
    }
    const productList = await Product.find();//find(filter).select('name image category -_id').populate('category'); // show only selected data and not show id

    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList);
})

//filter product from category

router.get(`/:productId`,async (req, res)=>{ 
    const product = await Product.findById(req.params.productId).populate('category'); // connect table together

    if(!product){
        res.status(500).json({success: false , message:'No product for ID'})
    }
    res.send(product);
})

router.post(`/`, uploadOptions.single('image'), async (req, res)=>{ 
    const category = await Category.findById(req.body.category); //validate the category
    if (!category) {
        return res.status(400).send('Invalid Category')
    }
    const file = req.file;
    if (!file) return res.status(400).send('No image in product ');

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/plantimage.jpg"
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })
    product = await product.save();

    if(!product)
    return res.status(500).send('The product cannot be created')
    
    res.send(product);
})
router.put('/:productId',async(req, res)=>{
    if(!mongoose.isValidObjectId(req.params.productId)){//mongoose method to verify the ObjectId
        res.status(400).send('Invalid Product ID')
    
    }
    const category = await Category.findById(req.body.category); //validate the category
    if (!category) {
        return res.status(400).send('Invalid Category')
    }
    const product = await Product.findByIdAndUpdate(req.params.productId,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        {new:true} //update new updated data

        )
        if(!product){ //if no product created
            return res.status(500).json({success: false, message: 'the product cannot be updated',}) 
            //return res.status(404).send('the category cannot be created')
        }
        res.send({product, message:'product is updated'});
   
})
router.delete('/:productId',async(req,res)=>{
    await Product.findByIdAndRemove(req.params.productId)
    .then(product =>{
        if(product){
            return res.status(200).json({success: true, message:'the product successfully deleted'})
        }else{
            return res.status(404).json({success: false, message:'product is not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error:err})
    })
})

//product count API for admin
router.get(`/get/count`,async (req, res)=>{ 
    const productCount = await Product.countDocuments() //mongoose method to count documents in table with callback

    if(!productCount){
        res.status(500).json({success: false })
    }
    res.send({
        productCount: productCount
    });
})

//featured product API
router.get(`/get/featured/:count`,async (req, res)=>{ 
    const count = req.params.count ? req.params.count: 0 // if count pass then get it otherwise it is 0
    const products = await Product.find({isFeatured:true}).limit(+count);//get products with isFeatured is true

    if(!products){
        res.status(500).json({success: false })
    }
    res.send(products);
})

router.put(
    '/gallery-images/:productId',
    uploadOptions.array('images', 5), //upload max =5
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.productId)) {
            return res.status(400).send('Invalid Product Id');
        }
        const files = req.files;
        let imagesPaths = []; //create array for gallery
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`);
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.productId,
            {
                images: imagesPaths,
            },
            { new: true }
        );

        if (!product)
            return res.status(500).send('the gallery cannot be updated');

        res.send(product);
    }
);
module.exports= router;