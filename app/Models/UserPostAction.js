'use strict'
const Model = use('Model')

class UserPostAction extends Model {

    static get table () {
        return 'user_post_actions'
    }
    static get hidden () {
        return ['created_at', 'updated_at']
    }
    user() {
        return this.belongsTo('App/Models/User', 'user_id', 'id')
    }
    applyTo() {
        return this.belongsTo('App/Models/User', 'apply_to', 'id')
    }
}

module.exports = UserPostAction
