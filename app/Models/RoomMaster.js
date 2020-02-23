'use strict'
const Model = use('Model')

class RoomMaster extends Model {

    static get table () {
        return 'room_master'
    }
    static get hidden () {
        return ['created_at', 'updated_at']
    }
    roomDetail() {
        return this.hasMany('App/Models/RoomDetail', 'id', 'room_id')
    }
    roomMessage() {
        return this.hasMany('App/Models/RoomMessage', 'id', 'room_id')
    }
}

module.exports = RoomMaster
