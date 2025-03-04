const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const productRoute = require('./routes/productRoute');
const errorHandler = require("./middleWare/errorMiddleware")
const cookieParser = require('cookie-parser');

const app = express();

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:3001"],
      credentials: true,
    })
  );



//Routes Middleware
app.use('/api/users', userRoute);
app.use('/api/products', productRoute);


//Routes
app.get("/", (req, res) => {
    res.send('Home Page');
});

console.log(process.env.MONGODB_URI);


const PORT = process.env.PORT || 5000;

//ERROR middleware
app.use(errorHandler);

mongoose.set('strictQuery', true);

//Connect to MongoDB ans start the server
mongoose.connect(process.env.MONGODB_URI)

    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log(err);
    });

