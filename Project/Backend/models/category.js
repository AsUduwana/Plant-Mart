const mongoose = require('mongoose');
//mongoose schema
const categorySchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    color:{
        type: String,
        default: ''
    },
    icon:{
        type: String,
    },
    image:{
        type: String,
        required: true,
        default: ''
    },
})
categorySchema.virtual('id').get(function(){
    return this._id.toHexString();
});

categorySchema.set('toJSON',{
    virtuals:true,
});

// create model(MongoDB collections)
exports.Category = mongoose.model('Category', categorySchema);