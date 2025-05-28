//create own server or web server with express 

const express = require('express');
const app = express();
//we are watching changes from node monitor

const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

require('dotenv/config');

app.use(cors());
app.options('*', cors());

//middleware (understand the json sent by front end)
app.use(bodyParser.json())
//display api logs
app.use(morgan('tiny'));
//check user athenticate or not
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

//get the values for enviromnet  file
const api = process.env.API_URL;

//Routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);




//const Product = require('./models/product');

mongoose.connect(process.env.CONNECTION_STRING)
//create call back using promises
/*.then(() => {
    console.log('Database Connection is Established...')
}) 
.catch((err)=>{
    console.log(err);
})*/
mongoose.connect(process.env.CONNECTION_STRING, {useNewUrlParser: true,useUnifiedTopology: true})
.then(()=>{
    console.log('mongodb is connected')
}).catch((err)=>{
    console.log('mondb not connected');
    console.log(err);
});

app.listen(3000, ()=>{
    console.log('server is running http://localhost:3000');
})
// run the server on specific port
