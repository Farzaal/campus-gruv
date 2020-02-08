'use strict'
const Model = use('Model')

class RoomMessage extends Model {

    static get table () {
        return 'room_messages'
    }
    room() {
        return this.belongsTo('App/Models/Room', 'id', 'room_id')
    }
    user() {
        return this.belongsTo('App/Models/User', 'user_id', 'id')
    }
}

module.exports = RoomMessage
