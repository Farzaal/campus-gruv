'use strict'
const User = use('App/Models/User')
const uuidv4 = require('uuid/v4');
const Cloudinary = use('Cloudinary')
const Logger = use('Logger')
const Config = use('Config')
const Hash = use('Hash')
const UserSavedPost = use('App/Models/UserSavedPost')

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
        user.profile_pic_url = this.uploadToCloudnainary(prof) 
      }
      user.first_name = body.first_name
      user.last_name = body.last_name
      user.email = body.email
      user.password = body.password
      user.uuid = uuidv4()
      await user.save()
      this.sendEmail(body.email, emailSubject, emailText)
      return response.status(201).send({ message })
    } catch (exp) {
      Logger.info({ url: request.url(), Exception: exp.message })
      return response.status(400).send({ message: exp.message })
    }
  }

  async uploadToCloudnainary(prof) {
    let cloudinaryMeta = await Cloudinary.uploader.upload(prof.tmpPath)
    return cloudinaryMeta.secure_url
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
    const securePassword = Hash.make(password)
    const resetPass = await User.query().where('otp', otp).update({ password: securePassword, otp: '' })
    if(resetPass) {
      return response.status(200).json({ message: 'Password reset successfully' })
    }
    return response.status(400).json({ message: 'Unable to reset password' })
  }

  async editUserProfile({ request, auth, response }) {
    const campus_id = request.input('campus_id', '')
    const dob = request.input('dob', '')
    const major = request.input('major', '')
    const first_name = request.input('first_name', '')
    const last_name = request.input('last_name', '')
    const contact_no = request.input('contact_no', '')
    const graduate_year = request.input('graduate_year', '')
    const authUser = await auth.getUser()
    const { id } = authUser.toJSON()
    const user = await User.find(id)
    if(request.file('profile_pic')) {
      const prof = request.file('profile_pic')
      user.profile_pic_url = await this.uploadToCloudnainary(prof) 
    }
    user.campus_id = campus_id 
    dob ? user.dob = new Date(dob) : ''
    major ? user.major = major: ''
    first_name ? user.first_name = first_name: ''
    last_name ? user.last_name = last_name: ''
    contact_no ? user.contact_no = contact_no : '' 
    graduate_year ? user.graduate_year = new Date(graduate_year) : '' 
    await user.save()
    return response.status(200).json({ message: 'Profile updated successfully' })
  }

  async getAuthUser({ request, auth, response }) {
    const authUser = await auth.getUser()
    const authUserJson = authUser.toJSON()
    const user = User.find(authUserJson.id)
    const userJson = user.toJSON()
    return response.status(200).json(userJson )
  }

  async savedPosts({ request, auth, response }) {
    const body = request.get()
    if(!body.post_id) {
      return response.status(722).json({ message: 'post_id is required' })
    }
    const authUser = await auth.getUser()
    const authUserJson = authUser.toJSON()
    const userSavedPost = new UserSavedPost()
    userSavedPost.post_id = body.post_id
    userSavedPost.user_id = authUserJson.id
    await userSavedPost.save()
    return response.status(200).json({ message: 'User post saved Successfully' })
  }
}

module.exports = UserController
