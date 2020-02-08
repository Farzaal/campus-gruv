'use strict'
const User = use('App/Models/User')
const RoomMaster = use('App/Models/RoomMaster')
const RoomDetail = use('App/Models/RoomDetail')
const RoomMessage = use('App/Models/RoomMessage')
const R = require('ramda')
const Database = use('Database')

class ChatController {
  constructor({ socket, request, auth }) {
    this.socket = socket
    this.request = request
    this.auth = auth
  }
  async onMessage(message) {
    const user = await this.auth.getUser()
    const { id, first_name } = user.toJSON()
    await RoomMessage.create({ room_id: message.room_id, user_id: id, message: message.message })
    const userRoom = await RoomDetail.query().where('room_id', message.room_id).with('user').fetch()  
    const userRoomJson = userRoom.toJSON()
    message.name = first_name
    this.socket.emitTo('message', message, [userRoomJson[0].user.socket_id, userRoomJson[1].user.socket_id])
  }
  async onFetch({ room_id }) {
    const user = await this.auth.getUser()
    const { id } = user.toJSON()
    await User.query().where('id', id).update({ socket_id: this.socket.id })
    const roomMsg = await RoomMessage.query().where('room_id', room_id).with('user').orderBy('created_at', 'DESC').paginate(1)
    const roomJson = roomMsg.toJSON()
    this.socket.emitTo('fetch', roomJson.data, [this.socket.id])
  }
  async onClose() {
    this.socket.close();
  }
  async onError() {
  }
}

module.exports = ChatController
