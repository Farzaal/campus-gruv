'use strict'
const Model = use('Model')

class Campus extends Model {

    static get table () {
        return 'campuses'
    }
    static scopeActive (query) {
        return query.where({active: 1})
    }
    static get hidden () {
        return ['active', 'created_at', 'updated_at']
    }
    users() {
        return this.hasMany('App/Models/User', 'id', 'campus_id')
    }
}

module.exports = Campus
