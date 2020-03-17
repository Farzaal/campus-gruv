const UserPostAction = use('App/Models/UserPostAction')
const R = use('ramda')

class UserService {
    
    static async checkUserAction(user_id, action_by, type='status') {
        try {
            const action = await UserPostAction.query().where('user_id', user_id).where('apply_to', action_by).fetch()
            const actJson = action.toJSON()
            if(R.equals(type, 'action')) {
                return actJson
            }
            if (R.gt(actJson.length, 0)) {
                return false
            }
            return true
        } catch (e) {
            console.log(e);
            return null
        }
    }

}

module.exports = UserService