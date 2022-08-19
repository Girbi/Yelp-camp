import User from '../models/user.js'
import express from 'express'
import catchAsync from '../utilities/catchAsync.js'
import passport from 'passport'

const router = express.Router()

router.get('/register', (req, res) => {
  res.render('users/register')
})

router.post(
  '/register',
  catchAsync(async (req, res) => {
    try {
      const { username, email, password } = req.body
      const user = new User({ email, username })
      const registeredUser = await User.register(user, password)
      req.login(registeredUser, err => {
        if (err) {
          return next(err)
        } else {
          req.flash('success', 'Welcome to YelpCamp')
          res.redirect('/campgrounds')
        }
      })
    } catch (err) {
      req.flash('error', err.message)
      res.redirect('register')
    }
  })
)

router.get('/login', (req, res) => {
  res.render('users/login')
})

router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
    keepSessionInfo: true,
  }),
  (req, res) => {
    req.flash('success', 'Welcome back!')
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)
  }
)

router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      return next(err)
    }
    req.flash('warning', 'Signed Out!')
    res.redirect('/campgrounds')
  })
})

export default router
