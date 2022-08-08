import mongoose from 'mongoose'
const Schema = mongoose.Schema

const campGroundsSchema = new Schema({
  title: String,
  price: Number,
  image: String,
  description: String,
  location: String,
})

export default mongoose.model('Campground', campGroundsSchema)
