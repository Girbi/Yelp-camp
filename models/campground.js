import mongoose from 'mongoose'
import Review from './review.js'
const { Schema } = mongoose

const CampgroundsSchema = new Schema({
  title: String,
  price: Number,
  image: String,
  description: String,
  location: String,
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
