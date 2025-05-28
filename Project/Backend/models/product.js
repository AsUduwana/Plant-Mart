const mongoose = require('mongoose');
//mongoose schema
const productSchema = mongoose.Schema({
    name: {
        type : String,
        required: true,
    },
    description: {
        type : String,
        required: true,
    },
    richDescription: {
        type: String,
        //required: true
        default: ''
    },
    image:{
        type: String,
        required: true,
        default: ''
    },
    images:[{
        type: String,
        default: ''
    }],
    price:{
        type: Number,
        required: true,
        default: 0
    },
    category:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', //ObjectId is reference to category schema on other table. this use in populate()
        required: true
    },
    countInStock:{
        type : Number,
        required: true,
        min : 0, //stock count cannot be minus
        max : 50
    },
    ratings:{
        type : Number,
        //required: true,
        default: 0
    },
    numReviews:{
        type: Number,
        default: 0
    },
    isFeatured:{
        type: Boolean,
        default: false
    },
    dateCreated:{
        type: Date,
        default: Date.now,
    },
})

productSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

productSchema.set('toJSON',{
    virtuals:true,
});
// create model(MongoDB collections)
exports.Product = mongoose.model('Product',productSchema);

