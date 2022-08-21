import express from 'express'
import passport from 'passport'
import * as users from '../controllers/users.js'

const router = express.Router()

router.route('/register').get(users.renderRegister).post(users.register)

router
  .route('/login')
  .get(users.renderLogin)
  .post(
    passport.authenticate('local', {
      failureFlash: true,
      failureRedirect: '/login',
      keepSessionInfo: true,
    }),
    users.login
  )

router.get('/logout', users.logout)

export default router
