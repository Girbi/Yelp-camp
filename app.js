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
import helmet from 'helmet'
import MongoStore from 'connect-mongo'

import User from './models/user.js'

import campgroundRoute from './routes/campground.js'
import reviewRoute from './routes/review.js'
import userRoute from './routes/users.js'

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

mongoose
  .connect(dbUrl)
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

const secret = process.env.SECRET || 'mySecretisawesome'

const sessionConfig = {
  name: 'session',
  secret,
  store: MongoStore.create({
    mongoUrl: dbUrl,
    secret: 'mySecret',
    touchAfter: 24 * 3600, //seconds
  }),
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    HttpOnly: true,
    // secure: true,
  },
}
app.use(session(sessionConfig))
app.use(flash())

const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com',
  'https://api.tiles.mapbox.com',
  'https://api.mapbox.com',
  'https://kit.fontawesome.com',
  'https://cdnjs.cloudflare.com',
  'https://cdn.jsdelivr.net',
]
const styleSrcUrls = [
  'https://kit-free.fontawesome.com',
  'https://stackpath.bootstrapcdn.com',
  'https://api.mapbox.com',
  'https://api.tiles.mapbox.com',
  'https://fonts.googleapis.com',
  'https://use.fontawesome.com',
  'https://cdn.jsdelivr.net',
]
const connectSrcUrls = [
  'https://api.mapbox.com',
  'https://*.tiles.mapbox.com',
  'https://events.mapbox.com',
]
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      childSrc: ['blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://res.cloudinary.com/dtrhzpdhi/',
        'https://images.unsplash.com',
      ],
      fontSrc: ["'self'"],
    },
  })
)

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Routes

app.use((req, res, next) => {
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

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Listening on ${port}`)
})
