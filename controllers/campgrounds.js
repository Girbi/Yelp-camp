import Campground from '../models/campground.js'
import catchAsync from '../utilities/catchAsync.js'
import { cloudinary } from '../cloudinary/index.js'

import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding.js'
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

const renderIndex = catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
})

const renderNewForm = (req, res) => {
  res.render('campgrounds/new')
}

const createCampgrounds = catchAsync(async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send()

  const camp = new Campground(req.body.campground)
  camp.geometry = geoData.body.features[0].geometry
  camp.images = req.files.map(file => ({
    url: file.path,
    filename: file.filename,
  }))
  camp.author = req.user._id
  await camp.save()
  console.log(camp)
  req.flash('success', 'Succesfully created a new campground')
  res.redirect(`/campgrounds/${camp._id}`)
})

const showCampgrounds = catchAsync(async (req, res) => {
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

const renderEditForm = catchAsync(async (req, res) => {
  const { id } = req.params
  const camp = await Campground.findById(id)
  if (!camp) {
    req.flash('error', 'Campground not found')
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/edit', { camp })
})

const editCampground = catchAsync(async (req, res) => {
  const { id } = req.params
  const camp = await Campground.findById(id)
  const images = req.files.map(file => ({
    url: file.path,
    filename: file.filename,
  }))
  camp.images.push(...images)
  await camp.save()
  await camp.updateOne({ _id: id }, { ...req.body.campground })

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename)
    }
    await camp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    })
  }
  req.flash('success', 'Succesfully updated campground')
  res.redirect(`/campgrounds/${id}`)
})

const deleteCampground = catchAsync(async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndDelete(id)
  req.flash('warning', 'Succesfully deleted campground')
  res.redirect('/campgrounds')
})

export {
  renderIndex,
  renderNewForm,
  createCampgrounds,
  showCampgrounds,
  renderEditForm,
  editCampground,
  deleteCampground,
}
