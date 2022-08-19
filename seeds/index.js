import mongoose from 'mongoose'
import Campground from '../models/campground.js'
import cities from './cities.js'
import { places, descriptors } from './seedHelpers.js'

mongoose
  .connect('mongodb://localhost:27017/yelp-camp')
  .then(() => {
    console.log('Database connected')
  })
  .catch(err => {
    console.log(err)
  })

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await Campground.deleteMany({})
  for (let i = 0; i < 50; i++) {
    const rand1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      author: '62feb530877c91488a284365',
      location: `${cities[rand1000].city} ${cities[rand1000].state} `,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: 'https://source.unsplash.com/collection/483251',
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam, magni in aliquam a quas natus pariatur corporis modi labore voluptatum ab facere optio minus, explicabo vero ipsa error quisquam. Cum!',
      price,
    })
    await camp.save()
  }
}
seedDB().then(() => {
  mongoose.connection.close()
})
