'use strict'
const Model = use('Model')

class UserOtp extends Model {

    static get table () {
        return 'user_otps'
    }

    static scopeActive (query) {
        return query.where('active', 1)
    }

    static get hidden () {
        return ['created_at', 'updated_at']
    }
}

module.exports = UserOtp
