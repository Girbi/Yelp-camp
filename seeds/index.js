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
      images: [
        {
          url: 'https://res.cloudinary.com/dtrhzpdhi/image/upload/v1661074638/YelpCamp/rxvgtdh7r4rviccblefk.jpg',
          filename: 'YelpCamp/rxvgtdh7r4rviccblefk',
        },
        {
          url: 'https://res.cloudinary.com/dtrhzpdhi/image/upload/v1661074639/YelpCamp/ulysa1ln7hdsnswjzgfs.jpg',
          filename: 'YelpCamp/ulysa1ln7hdsnswjzgfs',
        },
      ],
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
