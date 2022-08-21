import express from 'express'
import * as campgrounds from '../controllers/campgrounds.js'
import {
  isLoggedIn,
  isAuthor,
  validateCampground,
} from '../utilities/middleware.js'

import multer from 'multer'
import { storage } from '../cloudinary/index.js'
const upload = multer({ storage: storage })

const router = express.Router()

router
  .route('/')
  .get(campgrounds.renderIndex)
  .post(
    isLoggedIn,
    upload.array('image'),
    validateCampground,
    campgrounds.createCampgrounds
  )

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router
  .route('/:id')
  .get(campgrounds.showCampgrounds)
  .put(
    isLoggedIn,
    upload.array('image'),
    validateCampground,
    campgrounds.editCampground
  )
  .delete(isLoggedIn, isAuthor, campgrounds.deleteCampground)

router.get('/:id/edit', isLoggedIn, isAuthor, campgrounds.renderEditForm)

export default router
