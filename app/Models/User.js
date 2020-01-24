'use strict'
const Model = use('Model')

class User extends Model {
  
  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'UserHook.hashPassword')
  }
  static get hidden () {
    return ['password', 'token', 'is_active', 'uuid']
  }
  static async getUserbyEmail(email, token) {                             
    const userByEmail = await this.query().where('email', email).with('campus').fetch()
    const userByEmailJson = userByEmail.toJSON()    
    const userWithToken = { ...userByEmailJson[0], ...token }    
    return userWithToken;
  }
  campus(){
    return this.belongsTo('App/Models/Campus', 'campus_id', 'id');
  }
  postMaster() {
    return this.hasMany('App/Models/PostMaster')
  }
  comment() {
    return this.hasMany('App/Models/User')
  }
  userSavedPost() {
    return this.hasMany('App/Models/UserSavedPost', 'id', 'user_id')
  }
  userFollower() {
    return this.hasMany('App/Models/UserFollower', 'id', 'follower_id')
  }
  userFollowing() {
    return this.hasMany('App/Models/UserFollower', 'id', 'user_id')
  }
}

module.exports = User
