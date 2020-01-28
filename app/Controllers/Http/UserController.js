'use strict'
const User = use('App/Models/User')
const uuidv4 = require('uuid/v4');
const Cloudinary = use('Cloudinary')
const Logger = use('Logger')
const Config = use('Config')
const Hash = use('Hash')
const R = use('ramda')
const UserSavedPost = use('App/Models/UserSavedPost')
const UserFollower = use('App/Models/UserFollower')
const UserWiseNotification = use('App/Models/UserWiseNotification')
const UserOtp = use('App/Models/UserOtp')

class UserController {

  async signUp({ request, response }) {
    const body = request.post()
    let emailOtp = ''
    let message = 'Signup success'
    let type = ['email', 'reset_password']
    const userExists = await User.findBy('email', body.email)
    if (userExists) {
      return response.status(722).send({ message: 'Mail already exist' })
    }
    try {
      const user = new User()
      if (request.file('profile_pic')) {
        const prof = request.file('profile_pic')
        user.profile_pic_url = await this.uploadToCloudnainary(prof)
      }
      user.first_name = body.first_name
      user.last_name = body.last_name
      user.email = body.email
      user.password = body.password
      user.uuid = uuidv4()
      await user.save()
      for (let i = 0; i < 2; i++) {
        const otp = Math.random().toString(36).slice(2)
        const userOtp = new UserOtp()
        userOtp.otp = otp
        userOtp.email = body.email
        userOtp.type = type[i]
        R.equals(type[i], 'email') ? emailOtp = otp : ''
        R.equals(type[i], 'email') ? userOtp.active = 1 : 0
        await userOtp.save()
      }
      this.sendEmail(body.email, "SignUp Success", "email", emailOtp)
      return response.status(201).send({ message })
    } catch (exp) {
      Logger.info({ url: request.url(), Exception: exp.message })
      return response.status(400).send({ message: exp.message })
    }
  }

  async sendUserOtp({ request, response }) {
    const { email, type } = request.get()
    const message = 'An otp has been sent via an email'
    if (!R.equals(type, 'reset_password')) {
      return response.status(722).json({ message: 'Invalid type' })
    }
    const userOtp = await UserOtp.query().where('email', email).where('type', type).fetch()
    if (R.isEmpty(userOtp.toJSON())) {
      return response.status(404).json({ message: 'User does not exist in system' })
    }
    await UserOtp.query().where('email', email).where('type', type).update({ active: 1 })
    const userOtpJson = userOtp.toJSON()
    this.sendEmail(email, 'Reset Password', 'reset_password', userOtpJson[0].otp)
    return response.status(200).json({ message })
  }

  async verifyUserOtp({ request, response }) {
    const { type, email, otp } = request.get()
    const userOtp = await UserOtp.query().active().where('email', email).where('type', type).where('otp', otp).fetch()
    if (R.isEmpty(userOtp.toJSON())) {
      return response.status(404).json({ message: 'Invalid OTP' })
    }
    if (R.equals(type, 'email')) {
      await User.query().where('email', email).update({ email_verified: 1 })
      await UserOtp.query().where('email', email).where('type', type).update({ active: 0 })
      return response.status(200).json({ message: 'Email verified success' })
    }
    return response.status(200).json({ message: 'Valid OTP' })
  }

  async resetPassword({ request, response }) {
    const { email, otp, password } = request.get()
    if (!email || !otp || !password) {
      return response.status(722).json({ message: 'Missing required params' })
    }
    const securePassword = await Hash.make(password)
    const resetPass = await User.query().where('email', email).update({ password: securePassword })
    if (resetPass) {
      await UserOtp.query().where('email', email).where('type', 'reset_password').update({ active: 0 })
      return response.status(200).json({ message: 'Password reset successfully' })
    }
    return response.status(400).json({ message: 'Unable to reset password' })
  }

  async uploadToCloudnainary(prof) {
    let cloudinaryMeta = await Cloudinary.uploader.upload(prof.tmpPath)
    return cloudinaryMeta.secure_url
  }

  async sendEmail(email, subject, type, otp) {
    try {
      const text = type == 'email' ? `You have registered successfully. Below is your otp for email verification. Otp = ${otp}` :
        `Your otp for reset password is ${otp}`
      const sendGrid = Config.get('sendGrid.sgMail')
      const msg = {
        to: email,
        from: Config.get('constants.admin_email'),
        subject: subject,
        text: text,
      };
      sendGrid.send(msg);
      return true
    } catch (e) {
      Logger.info({ url: 'user/signup', Exception: e.message })
      return false
    }
  }

  async signIn({ request, auth, response }) {
    const body = request.post()
    const token = await auth.attempt(body.email, body.password)
    if (token) {
      const user = await User.getUserbyEmail(body.email, token)
      return response.status(200).json(user)
    }
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
    if (request.file('profile_pic')) {
      const prof = request.file('profile_pic')
      user.profile_pic_url = await this.uploadToCloudnainary(prof)
    }
    user.campus_id = campus_id
    dob ? user.dob = new Date(dob) : ''
    major ? user.major = major : ''
    first_name ? user.first_name = first_name : ''
    last_name ? user.last_name = last_name : ''
    contact_no ? user.contact_no = contact_no : ''
    graduate_year ? user.graduate_year = new Date(graduate_year) : ''
    await user.save()
    const savedUser = await User.find(id)
    const savedUserJson = savedUser.toJSON()
    return response.status(200).json(savedUserJson)
  }

  async getUserById({ request, response }) {
    const body = request.get()
    if (!body.user_id) {
      return response.status(722).json({ message: 'user_id is required' })
    }
    const user = await User.query().where('id', body.user_id).with('campus').first()
    if (!user) {
      return response.status(200).json({ message: 'User does not exist' })
    }
    const userJson = user.toJSON()
    return response.status(200).json(userJson)
  }

  async savedPosts({ request, auth, response }) {
    const body = request.get()
    if (!body.post_id) {
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

  async followUser({ request, auth, response }) {
    const body = request.get()
    if (!body.user_id) {
      return response.status(722).json({ message: 'user_id is required' })
    }
    try {
      const authUser = await auth.getUser()
      const authUserJson = authUser.toJSON()
      const notificationMsg = `${authUserJson.first_name} ${authUserJson.last_name} has followed you`
      const userFollower = new UserFollower()
      userFollower.user_id = body.user_id
      userFollower.follower_id = authUserJson.id
      await userFollower.save()
      await UserWiseNotification.create({ user_id: body.user_id, notification_by: authUserJson.id, notification_message: notificationMsg })
      return response.status(200).json({ message: 'User Follower created' })
    } catch (e) {
      console.log(e)
      return response.status(400).json({ message: 'Something went wrong' })
    }
  }

  async unFollowUser({ request, auth, response }) {
    const body = request.get()
    if (!body.user_id) {
      return response.status(722).json({ message: 'user_id is required' })
    }
    const authUser = await auth.getUser()
    const authUserJson = authUser.toJSON()
    await UserFollower.query().where('user_id', authUserJson.id).where('follower_id', body.user_id).delete()
    return response.status(200).json({ message: 'User Follower destroyed' })
  }

  async userNotifications({ request, response }) {
    const body = request.get()
    if (!body.user_id && !body.page) {
      return response.status(722).send({ message: 'user_id, page is required' })
    }
    const userNot = await UserWiseNotification.query().where('user_id', body.user_id).with('userNotification').orderBy('created_at', 'DESC').paginate(body.page)
    const userNotJson = userNot.toJSON()
    return response.status(200).send(userNotJson)
  }

  async followDetails({ request, auth, response }) {
    try {
      const body = request.get()
      if(!body.user_id) {
        return response.status(200).json({ message: 'User_id is required' })
      }
      let followerDetails = {};
      const user_id = body.user_id 
      const followerCount = await UserFollower.query().where('user_id', user_id).getCount()
      const followingCount = await UserFollower.query().where('follower_id', user_id).getCount()
      followerDetails = { user_id, followerCount, followingCount }
      return response.status(200).json([followerDetails])
    } catch (e) {
      Logger.info({ url: request.url(), Exception: e.message })
      return response.status(200).json({ message: 'Something Went Wrong' })
    }
  }
}

module.exports = UserController
