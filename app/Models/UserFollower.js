'use strict'
const Model = use('Model')

class UserFollower extends Model {

    static get table () {
        return 'user_followers'
    }
    static get hidden () {
        return ['created_at', 'updated_at']
    }
    user() {
        return this.belongsTo('App/Models/User', 'user_id', 'id')
    }
}

module.exports = UserFollower
