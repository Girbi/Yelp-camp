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

const CampgroundsSchema = new Schema({
  title: String,
  price: Number,
  images: [ImageSchema],
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
})

CampgroundsSchema.post('findOneAndDelete', async function (campDel) {
  if (campDel) {
    await Review.deleteMany({ _id: { $in: campDel.reviews } })
  }
})

export default mongoose.model('Campground', CampgroundsSchema)
