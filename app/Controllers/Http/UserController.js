'use strict'
const User = use('App/Models/User')
const uuidv4 = require('uuid/v4');
const Logger = use('Logger')
const Hash = use('Hash')
const R = use('ramda')
const Config = use('Config')
const UserSavedPost = use('App/Models/UserSavedPost')
const ApiService = use('App/Services/ApiService')
const HelperService = use('App/Services/HelperService')
const UserFollower = use('App/Models/UserFollower')
const UserPostAction = use('App/Models/UserPostAction')
const UserWiseNotification = use('App/Models/UserWiseNotification')
const UserOtp = use('App/Models/UserOtp')
const UserService = use('App/Services/UserService')

class UserController {

  async signUp({ request, response }) {
    const body = request.post()
    const uuid = uuidv4()
    let emailOtp = '', message = 'Signup success', fileUrl = ''
    const userExists = await User.findBy('email', body.email)
    if (userExists) {
      return response.status(722).send({ message: 'Mail already exist' })
    }
    try {
      const user = new User()
      if (request.file('profile_pic')) {
        const prof = request.file('profile_pic')
        fileUrl = await HelperService.uploadToS3(prof, uuid)
      }
      user.first_name = body.first_name
      user.last_name = body.last_name
      user.email = body.email
      user.password = body.password
      user.profile_pic_url = fileUrl.Location
      user.uuid = uuid
      await user.save()
      const emailOtp = await HelperService.saveUserOtp(body.email)
      HelperService.sendEmail(body.email, "SignUp Success", "email", emailOtp)
      return response.status(201).send({ message })
    } catch (exp) {
      console.log(exp);
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
    HelperService.sendEmail(email, 'Reset Password', 'reset_password', userOtpJson[0].otp)
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
    const { id, uuid } = authUser.toJSON()
    const user = await User.find(id)
    if (request.file('profile_pic')) {
      const prof = request.file('profile_pic')
      const { Location } = await HelperService.uploadToS3(prof, uuid)
      user.profile_pic_url = Location
    }
    user.campus_id = campus_id
    dob ? user.dob = new Date(dob) : ''
    major ? user.major = major : ''
    first_name ? user.first_name = first_name : ''
    last_name ? user.last_name = last_name : ''
    contact_no ? user.contact_no = contact_no : ''
    graduate_year ? user.graduate_year = new Date(graduate_year) : ''
    await user.save()
    // const savedUser = await User.find(id)
    const savedUser = await User.query().where("id", id).with("campus").first()
    const savedUserJson = savedUser.toJSON()
    return response.status(200).json(savedUserJson)
  }

  async getUserById({ request, auth, response }) {
    const authUser = await auth.getUser()
    const authUserJson = authUser.toJSON()
    const body = request.get()
    if (!body.user_id) {
      return response.status(722).json({ message: 'user_id is required' })
    }
    const user = await User.query().where('id', body.user_id)
      .with('campus')
      .with('userFollowing').first()
    if (!user) {
      return response.status(200).json({ message: 'User does not exist' })
    }
    const userJson = user.toJSON()
    const { userFollowing } = userJson
    const followStatus = userFollowing.find((follower) => follower.follower_id == authUserJson.id)
    let isFollowing = R.isNil(followStatus) ? false : true
    delete userJson['userFollowing']
    userJson.isFollowing = isFollowing 
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
      const sendNotification = await UserService.checkUserAction(body.user_id, authUserJson.id)
      const notificationMsg = `${authUserJson.first_name} ${authUserJson.last_name} has followed you`
      const userFollower = new UserFollower()
      userFollower.user_id = body.user_id
      userFollower.follower_id = authUserJson.id
      await userFollower.save()
      if(sendNotification) {
        await UserWiseNotification.create({ user_id: body.user_id, notification_by: authUserJson.id, notification_message: notificationMsg })
        const sendNotification = await ApiService.sendUserNotification({ user_id: body.user_id, notification: notificationMsg });
      }
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
    const notificationMsg = `${authUserJson.first_name} ${authUserJson.last_name} has unfollowed you`
    await UserFollower.query().where('user_id', body.user_id).where('follower_id', authUserJson.id).delete()
    return response.status(200).json({ message: 'User Follower destroyed' })
  }

  async userNotifications({ request, response }) {
    const body = request.get()
    if (!body.user_id && !body.page) {
      return response.status(722).send({ message: 'user_id, page is required' })
    }
    const userNot = await UserWiseNotification.query().where('user_id', body.user_id).with('userNotification').orderBy('id', 'DESC').paginate(body.page)
    const userNotJson = userNot.toJSON()
    return response.status(200).send(userNotJson)
  }

  async followDetails({ request, auth, response }) {
    try {
      const body = request.get()
      if (!body.user_id) {
        return response.status(200).json({ message: 'User_id is required' })
      }
      let followerDetails = {};
      const user_id = body.user_id
      const followingCount = await UserFollower.query().where('user_id', user_id).getCount()
      const followerCount = await UserFollower.query().where('follower_id', user_id).getCount()
      followerDetails = { user_id, followerCount, followingCount }
      return response.status(200).json([followerDetails])
    } catch (e) {
      Logger.info({ url: request.url(), Exception: e.message })
      return response.status(200).json({ message: 'Something Went Wrong' })
    }
  }

  async userAction({ request, auth, response }) {
    try {
      let message = 'User action saved successfully'
      const body = request.post()
      const { action, apply_action, apply_to } = body
      const authUser = await auth.getUser()
      const authUserJson = authUser.toJSON()
      if(R.equals(apply_action, 1)) {
        const act = new UserPostAction()
        await UserPostAction.create({ user_id: authUserJson.id, user_action: action, apply_to: apply_to })
      } else {
        const action = await UserService.checkUserAction(authUserJson.id, body.apply_to, 'action')
        console.log(action)
        !R.isEmpty(action) ? await UserPostAction.query().where('id', action[0].id).delete() : ''
      }
      return response.status(200).json({ message })
    } catch(e) {
      console.log(e)
      return response.status(200).json({ message: 'Something went wrong' })
    }
  }
}

module.exports = UserController
