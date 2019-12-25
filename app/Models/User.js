'use strict'
const Model = use('Model')

class User extends Model {
  
  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'UserHook.hashPassword')
  }

  static get hidden () {
    return ['password', 'token', 'is_active', 'email_verified', 'uuid', 'otp']
  }
  static async getUserbyEmail(email, token) {
    const userByEmail = await this.findBy('email', email)
    const userWithToken = { ...userByEmail.toJSON(), ...token }    
    return userWithToken;
  }
  campus(){
    return this.belongsTo('App/Models/DefinitionTypeDetail', 'campus_id', 'id');
  }
  postMaster() {
    return this.hasMany('App/Models/PostMaster')
  }
}

module.exports = User
