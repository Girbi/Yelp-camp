import express from 'express'
import catchAsync from '../utilities/catchAsync.js'
import ExpressError from '../utilities/ExpressError.js'
import Campground from '../models/campground.js'
import { campgroundSchema } from '../schemas.js'

const router = express.Router()

const validateCampground = function (req, res, next) {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(', ')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

router.get('/new', (req, res) => {
  res.render('campgrounds/new')
})

router.post(
  '/',
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressError('Invalid Campground Data', 400)

    const camp = new Campground(req.body.campground)
    await camp.save()
    req.flash('success', 'Succesfully created a new campground')
    res.redirect(`/campgrounds/${camp._id}`)
  })
)

router.get(
  '/',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
  })
)

router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id).populate('reviews')
    if (!camp) {
      req.flash('error', 'Campground not found')
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp })
  })
)

router.get(
  '/:id/edit',
  catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id)
    if (!camp) {
      req.flash('error', 'Campground not found')
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { camp })
  })
)

router.put(
  '/:id',
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    })
    req.flash('success', 'Succesfully updated campground')
    res.redirect(`/campgrounds/${camp._id}`)
  })
)

router.delete(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('warning', 'Succesfully deleted campground')
    res.redirect('/campgrounds')
  })
)

export default router
