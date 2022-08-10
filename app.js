import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import Campground from './models/campground.js'
import methodOverride from 'method-override'
import ejsMate from 'ejs-mate'
import catchAsync from './utilities/catchAsync.js'
import ExpressError from './utilities/ExpressError.js'
import campgroundSchema from './schemas.js'

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

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

const validateCampground = function (req, res, next) {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(', ')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

app.post(
  '/campgrounds',
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressError('Invalid Campground Data', 400)

    const camp = new Campground(req.body.campground)
    await camp.save()
    res.redirect(`/campgrounds/${camp._id}`)
  })
)

app.get(
  '/campgrounds',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
  })
)

app.get(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id)
    res.render('campgrounds/show', { camp })
  })
)

app.get(
  '/campgrounds/:id/edit',
  catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id)
    res.render('campgrounds/edit', { camp })
  })
)

app.put(
  '/campgrounds/:id',
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    })

    res.redirect(`/campgrounds/${camp._id}`)
  })
)

app.delete(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
  })
)

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
