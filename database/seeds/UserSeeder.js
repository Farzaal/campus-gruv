'use strict'
const Factory = use('Factory')
const faker = require('faker')
const User = use('App/Models/User')

class UserSeeder {
  async run () {
    for (let i = 0; i < 300; i++) {
      const user = new User()
      user.first_name = faker.name.firstName()
      user.last_name = faker.name.lastName()
      user.email = `${user.first_name}@gmail.com`
      user.password = 'seed123'
      user.profile_pic_url = faker.image.imageUrl()
      user.campus_id = Math.floor(Math.random() * (5 - 1 + 1)) + 1
      await user.save()
      console.log(`${user.first_name} saved \n`)
    }
  }
}

module.exports = UserSeeder
