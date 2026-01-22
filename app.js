let config = require('./config')
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');

let app = express();

const mongoose = require('mongoose');

// mongo connect String
mongoose.connect(config.mongoURL).then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Connection Error ❌", err.message));;


app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use('/auth', require('./routes/auth.route'));
app.use('/user', require('./routes/user.route'));
app.use('/admin', require('./routes/admin.route'));

app.use(require('./middleware/passportJWT')().initialize());
app.use(require('./middleware/errorHandler'));


app.listen(config.app.port, () => console.log('Running...' + config.app.port));