'use strict'
const User = use('App/Models/User')
const uuidv4 = require('uuid/v4');
const Cloudinary = use('Cloudinary')
const Logger = use('Logger')
const Config = use('Config')

class UserController {

  async signUp({ request, response }) {
    const body = request.post()
    let message = 'Signup success'
    const userExists = await User.findBy('email', body.email)
    if (userExists) {
      return response.status(722).send({ message: 'Mail already exist' })
    }
    try {
      const user = new User()
      if (request.file('profile_pic')) {
        const prof = request.file('profile_pic')
        let cloudinaryMeta = await Cloudinary.uploader.upload(prof.tmpPath)
        user.profile_pic_url = cloudinaryMeta.secure_url
      }
      user.first_name = body.first_name
      user.last_name = body.last_name
      user.email = body.email
      user.password = body.password
      user.campus_id = body.campus_id
      user.uuid = uuidv4()
      await user.save()
      this.sendEmail(body.email)
      return response.status(201).send({ message })
    } catch (exp) {
      Logger.info({ url: request.url(), Exception: exp.message })
      return response.status(400).send({ message: exp.message })
    }
  }

  async sendEmail(email) {
    try {
      const sendGrid = Config.get('sendGrid.sgMail')
      const msg = {
        to: email,
        from: 'campus.gruv.2020@gmail.com',
        subject: 'Campus Gruv signup successful',
        text: 'Welcome to campus gruv. You have registered successfully',
      };
      sendGrid.send(msg);
      return true
    } catch(e) {
      Logger.info({ url: 'user/signup', Exception: e.message})
      return false
    }
  }

  async signIn({request, auth, response}) {
    const body = request.post()
    const token = await auth.attempt(body.email, body.password)
    if(token) {
      const user = await User.getUserbyEmail(body.email, token)
      return response.status(200).json(user)
    }
  }
}

module.exports = UserController
