import User from '../models/user.js'
import catchAsync from '../utilities/catchAsync.js'

const renderRegister = (req, res) => {
  res.render('users/register')
}

const register = catchAsync(async (req, res) => {
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

const renderLogin = (req, res) => {
  res.render('users/login')
}

const login = (req, res) => {
  req.flash('success', 'Welcome back!')
  const redirectUrl = req.session.returnTo || '/campgrounds'
  delete req.session.returnTo
  res.redirect(redirectUrl)
}

const logout = (req, res) => {
  req.logout(err => {
    if (err) {
      return next(err)
    }
    req.flash('warning', 'Signed Out!')
    res.redirect('/campgrounds')
  })
}

export { renderRegister, register, renderLogin, login, logout }
