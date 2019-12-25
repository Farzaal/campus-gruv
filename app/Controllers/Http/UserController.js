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
    let emailSubject = 'Signup success'
    let emailText = 'Congratulations. You have registered successfully'
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
      this.sendEmail(body.email, emailSubject, emailText)
      return response.status(201).send({ message })
    } catch (exp) {
      Logger.info({ url: request.url(), Exception: exp.message })
      return response.status(400).send({ message: exp.message })
    }
  }

  async sendEmail(email, subject, text) {
    try {
      const sendGrid = Config.get('sendGrid.sgMail')
      const msg = {
        to: email,
        from: Config.get('constants.admin_email'),
        subject: subject,
        text: text,
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
  
  async sendUserOtp({ request, response }) {
    const { email } = request.get()
    const emailSubject = "Reset password"
    const userOtp = Math.random().toString(36).slice(2) 
    const emailText = `Your OTP for reset password is ${userOtp}`
    if(!email){
      return response.status(722).json({ message: 'email is required' })
    }
    const findByEmail = await User.findBy('email', email)
    if(findByEmail) {
      const findByEmailJson = findByEmail.toJSON()
      const { email } = findByEmailJson
      await User.query().where('email', email).update({ otp: userOtp })
      this.sendEmail(email, emailSubject, emailText)
      return response.status(200).json({ message: 'An OTP has been sent to a specified email' })
    }
    return response.status(404).json({ message: 'Email does not exist in system' })
  }

  async verifyUserOtp({ request, response }) {
    const { otp } = request.get()
    const findByOtp = await User.findBy('otp', otp)
    if(findByOtp) {
      return response.status(200).json({ message: 'Valid OTP' })
    }
    return response.status(404).json({ message: 'Invalid OTP' })
  }
  
  async resetPassword({ request, response }) {
    const { otp, password } = request.get()
    const resetPass = await User.query().where('otp', otp).update({ password: password, otp: '' })
    if(resetPass) {
      return response.status(200).json({ message: 'Password reset successfully' })
    }
    return response.status(400).json({ message: 'Unable to reset password' })
  }
}

module.exports = UserController
