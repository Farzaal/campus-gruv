"use strict";
const RoomMaster = use("App/Models/RoomMaster");
const RoomDetail = use("App/Models/RoomDetail");
const RoomMessage = use("App/Models/RoomMessage");
const Database = use("Database");
const uuidv4 = require("uuid/v4");
const R = require("ramda");

class RoomController {
  async userRoom({ request, auth, response }) {
    const body = request.get();
    if (!body.user_id) {
      return response.status(722).json({ message: "user_id is required" });
    }
    const user = await auth.getUser();
    const userJson = user.toJSON();
    const roomJson = await RoomDetail.getUserRoom(userJson.id, body.user_id);
    let roomParseJson = JSON.parse(roomJson);
    if (R.isEmpty(roomParseJson)) {
      const roomMaster = await RoomMaster.create({ room_identifier: uuidv4() });
      const { id } = roomMaster.toJSON();
      roomParseJson = [{ room_id: id }];
      await RoomDetail.createMany([
        { user_id: userJson.id, room_id: id },
        { user_id: body.user_id, room_id: id }
      ]);
    }
    return response.status(200).json(roomParseJson);
  }

  async userChatHistory({ request, auth, response }) {
    const page = request.input("page", 1);
    const user = await auth.getUser();
    const userJson = user.toJSON();
    try {
      const usrRooms = await Database.raw(
        `SELECT usr.id ,usr.first_name, usr.last_name , usr.profile_pic_url , usr.campus_id , m.room_id , m.message , m.created_at , m.updated_at  from room_messages m LEFT JOIN room_messages b ON m.room_id = b.room_id AND m.created_at < b.created_at INNER JOIN room_detail rd ON m.room_id = rd.room_id INNER JOIN users usr ON usr.id = IF(m.user_id = ${userJson.id}, rd.user_id,m.user_id) WHERE b.created_at IS NULL AND rd.user_id != m.user_id  AND m.room_id IN (SELECT room_id FROM room_detail WHERE user_id = ${userJson.id}) ORDER BY m.created_at DESC `
      );
      return response.status(200).json(usrRooms[0]);
    } catch (error) {
      console.log(error);
      return response.status(400).json({ error });
    }
  }
}

module.exports = RoomController;
