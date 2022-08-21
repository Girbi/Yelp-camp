import express from 'express'
import {
  isLoggedIn,
  isReviewAuthor,
  validateReview,
} from '../utilities/middleware.js'

import * as reviews from '../controllers/reviews.js'

const router = express.Router({ mergeParams: true })

router.post('/', validateReview, isLoggedIn, reviews.createReview)

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, reviews.deleteReview)

export default router
