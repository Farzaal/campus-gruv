'use strict'
const Model = use('Model')
const Database = use('Database')

class RoomDetail extends Model {

    static get table () {
        return 'room_detail'
    }
    roomMaster() {
        return this.belongsTo('App/Models/RoomMaster', 'room_id', 'id')
    }
    user() {
        return this.belongsTo('App/Models/User', 'user_id', 'id')
    }

    static async getUserRoom(authUserId, user_id) {
        const query = `SELECT A.room_id FROM room_detail A, room_detail B 
        WHERE A.user_id = ?
        AND B.user_id = ?
        AND A.room_id = B.room_id`;
        const room = await Database.raw(query,[authUserId, user_id])
        const roomJSON = JSON.stringify(room[0])
        return roomJSON
    }
}

module.exports = RoomDetail
