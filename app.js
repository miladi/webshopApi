const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.options('*', cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const productRouter = require('./routers/productRouter')();
app.use('/api', productRouter);

const brandRouter = require('./routers/brandRouter')();
app.use('/api', brandRouter);

const countryRouter = require('./routers/countryRouter')();
app.use('/api', countryRouter);

const addressRouter = require('./routers/addressRouter')();
app.use('/api', addressRouter);

const categoryRouter = require('./routers/categoryRouter')();
app.use('/api', categoryRouter);

const customerRouter = require('./routers/customerRouter')();
app.use('/api', customerRouter);

const orderStatusRouter = require('./routers/orderStatusRouter')();
app.use('/api', orderStatusRouter);

const paymentMethodRouter = require('./routers/paymentMethodRouter')();
app.use('/api', paymentMethodRouter);

const orderRouter = require('./routers/orderRouter')();
app.use('/api', orderRouter);

const orderRowRouter = require('./routers/orderRowRouter')();
app.use('/api', orderRowRouter);

const productImageRouter = require('./routers/productImageRouter')();
app.use('/api', productImageRouter);

const promoTypeRouter = require('./routers/promoTypeRouter')();
app.use('/api', promoTypeRouter);

const promoCodeRouter = require('./routers/promoCodeRouter')();
app.use('/api', promoCodeRouter);

const shippingMethodRouter = require('./routers/shippingMethodRouter')();
app.use('/api', shippingMethodRouter);

const taxRouter = require('./routers/taxRouter')();
app.use('/api', taxRouter);

const favoriteRouter = require('./routers/favoriteRouter')();
app.use('/api', favoriteRouter);


app.server = app.listen(port, () => { console.log(`Running on port ${port}`); });


module.exports = app;

