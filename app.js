import './utilities/dotenv.js'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import methodOverride from 'method-override'
import ExpressMongoSanitize from 'express-mongo-sanitize'
import ejsMate from 'ejs-mate'
import ExpressError from './utilities/ExpressError.js'
import session from 'express-session'
import flash from 'connect-flash'
import passport from 'passport'
import LocalStrategy from 'passport-local'

import User from './models/user.js'

import campgroundRoute from './routes/campground.js'
import reviewRoute from './routes/review.js'
import userRoute from './routes/users.js'

mongoose
  .connect('mongodb://localhost:27017/yelp-camp')
  .then(() => {
    console.log('Database connected')
  })
  .catch(err => {
    console.log(err)
  })

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.set('view engine', 'ejs')
app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(ExpressMongoSanitize())

const sessionConfig = {
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    HttpOnly: true,
  },
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Routes

app.use((req, res, next) => {
  console.log(req.query)
  res.locals = {
    success: req.flash('success'),
    error: req.flash('error'),
    warning: req.flash('warning'),
    currentUser: req.user,
  }
  next()
})

app.use('/', userRoute)
app.use('/campgrounds', campgroundRoute)
app.use('/campgrounds/:id/reviews', reviewRoute)

app.get('/', (req, res) => {
  res.render('home')
})

app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if (!err.message) err.message = 'Oh no, Something went Wrong!'
  res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
  console.log('Listening on 3000')
})
