import express from 'express'
import { reviewSchema } from '../schemas.js'
import catchAsync from '../utilities/catchAsync.js'
import ExpressError from '../utilities/ExpressError.js'
import Review from '../models/review.js'
import Campground from '../models/campground.js'

const router = express.Router({ mergeParams: true })

const validateReview = function (req, res, next) {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(', ')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

router.post(
  '/',
  validateReview,
  catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    camp.reviews.push(review)
    Promise.all([camp.save(), review.save()])
    req.flash('success', 'Review was created successfully')
    res.redirect(`/campgrounds/${camp._id}`)
  })
)

router.delete(
  '/:reviewId',
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    Promise.all([
      await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }),
      await Review.findByIdAndDelete(reviewId),
    ])
    req.flash('warning', 'Review was deleted successfully')
    res.redirect(`/campgrounds/${id}`)
  })
)

export default router
