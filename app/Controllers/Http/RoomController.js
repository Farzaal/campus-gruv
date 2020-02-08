'use strict'
const RoomMaster = use('App/Models/RoomMaster')
const RoomDetail = use('App/Models/RoomDetail')
const Database = use('Database')
const uuidv4 = require('uuid/v4');
const R = require('ramda')

class RoomController {

    async userRoom({ request, auth, response }) {
        const body = request.get()
        if(!body.user_id) {
            return response.status(722).json({ message: 'user_id is required' });
        }
        const user = await auth.getUser()
        const userJson = user.toJSON();
        const roomJson = await RoomDetail.getUserRoom(userJson.id, body.user_id)
        let roomParseJson = JSON.parse(roomJson) 
        if(R.isEmpty(roomParseJson)) {
            const roomMaster = await RoomMaster.create({ room_identifier: uuidv4() })
            const { id } = roomMaster.toJSON()
            roomParseJson = [{ room_id: id }] 
            await RoomDetail.createMany([{ user_id: userJson.id, room_id: id }, { user_id: body.user_id, room_id: id }])
        }
        return response.status(200).json(roomParseJson);
    }   
}

module.exports = RoomController
