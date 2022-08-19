import Campground from '../models/campground.js'
import Review from '../models/campground.js'
import ExpressError from '../utilities/ExpressError.js'
import { campgroundSchema, reviewSchema } from '../schemas.js'

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl
    req.flash('error', 'You must be signed in first!')
    return res.redirect('/login')
  }
  next()
}

const isAuthor = async (req, res, next) => {
  const { id } = req.params
  const camp = await Campground.findById(id)
  if (!camp.author.equals(req.user._id)) {
    req.flash('warning', 'You do not have permission to do that')
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}
const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params
  const review = await Review.findById(id)
  if (!review.author.equals(req.user._id)) {
    req.flash('warning', 'You do not have permission to do that')
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}

const validateCampground = function (req, res, next) {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(', ')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

const validateReview = function (req, res, next) {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(', ')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

export {
  isAuthor,
  isLoggedIn,
  validateCampground,
  validateReview,
  isReviewAuthor,
}
