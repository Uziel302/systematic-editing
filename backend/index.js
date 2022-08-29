var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var cors = require('cors');
const indexRouter = require('./router.js');
app.use(cors());


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', indexRouter);

app.listen(3000,() => console.log('Server is running on port 3000'));
