'use strict'
const Factory = use('Factory')
const faker = require('faker')
const PostMaster = use('App/Models/PostMaster')
const User = use('App/Models/User')

class PostMasterSeeder {
  async run () {
    const user = await User.ids()
    const campuses = [6,7,8,13,14,15,16,17,18,19,20,21,22]
    for(let i = 0; i < user.length; i++) {
      for(let j = 0; j < 13; j++) {
        const postMaster = new PostMaster()
        postMaster.user_id = user[i]
        postMaster.category_id = campuses[j] 
        postMaster.title = faker.lorem.text()
        postMaster.description = faker.lorem.paragraph()
        await postMaster.save()
        console.log(`Saving posts of user_id:${user[i]}`)
      }
    }
  }
}
module.exports = PostMasterSeeder
