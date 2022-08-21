import mongoose from 'mongoose'
import Review from './review.js'
const { Schema } = mongoose

const ImageSchema = new Schema({
  url: String,
  filename: String,
})
ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } }

const CampgroundsSchema = new Schema(
  {
    title: String,
    price: Number,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  opts
)

CampgroundsSchema.virtual('properties.popUpTitle').get(function () {
  return this.title
})
CampgroundsSchema.virtual('properties.popUpLocation').get(function () {
  return this.location
})
CampgroundsSchema.virtual('properties.popUpId').get(function () {
  return this._id
})

CampgroundsSchema.post('findOneAndDelete', async function (campDel) {
  if (campDel) {
    await Review.deleteMany({ _id: { $in: campDel.reviews } })
  }
})

export default mongoose.model('Campground', CampgroundsSchema)
