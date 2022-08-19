import express from 'express'
import { reviewSchema } from '../schemas.js'
import catchAsync from '../utilities/catchAsync.js'
import Review from '../models/review.js'
import Campground from '../models/campground.js'
import {
  isLoggedIn,
  isReviewAuthor,
  validateReview,
} from '../utilities/middleware.js'

const router = express.Router({ mergeParams: true })

router.post(
  '/',
  validateReview,
  isLoggedIn,
  catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    camp.reviews.push(review)
    Promise.all([camp.save(), review.save()])
    req.flash('success', 'Review was created successfully')
    res.redirect(`/campgrounds/${camp._id}`)
  })
)

router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
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
