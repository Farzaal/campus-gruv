const axios = require('axios');
const Config = use('Config')

class ApiService {

    static async sendUserNotification(data) {
        try {
            const notification = await axios.post(`${Config.get('constants.SEND_USER_NOTIFICATION')}/api/v1/send/notification`, data);
            return notification;
        } catch(err) {
            return err.message;
        }
    }

}

module.exports = ApiService
