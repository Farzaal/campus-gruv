'use strict'
const Model = use('Model')

class PostReport extends Model {

    static get table () {
        return 'post_reports'
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

module.exports = PostReport
