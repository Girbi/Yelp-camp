import express from 'express'
import catchAsync from '../utilities/catchAsync.js'
import Campground from '../models/campground.js'
import {
  isLoggedIn,
  isAuthor,
  validateCampground,
} from '../utilities/middleware.js'

const router = express.Router()

router.get(
  '/',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
  })
)

router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new')
})

router.post(
  '/',
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressError('Invalid Campground Data', 400)

    const camp = new Campground(req.body.campground)
    camp.author = req.user._id
    await camp.save()
    req.flash('success', 'Succesfully created a new campground')
    res.redirect(`/campgrounds/${camp._id}`)
  })
)

router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id)
      .populate({
        path: 'reviews',
        populate: {
          path: 'author', // Review author
        },
      })
      .populate('author') // Camp author
    if (!camp) {
      req.flash('error', 'Campground not found')
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp })
  })
)

router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor,
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
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    })
    req.flash('success', 'Succesfully updated campground')
    res.redirect(`/campgrounds/${id}`)
  })
)

router.delete(
  '/:id',
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('warning', 'Succesfully deleted campground')
    res.redirect('/campgrounds')
  })
)

export default router
