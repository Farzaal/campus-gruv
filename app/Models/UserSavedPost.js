'use strict'
const Model = use('Model')

class UserSavedPost extends Model {

    static get table () {
        return 'user_saved_posts'
    }
    static get hidden () {
        return ['created_at', 'updated_at']
    }
    post(){
        return this.belongsTo('App/Models/PostMaster', 'post_id', 'id');
    }
    user(){
        return this.belongsTo('App/Models/User', 'user_id', 'id');
    }
}

module.exports = UserSavedPost
