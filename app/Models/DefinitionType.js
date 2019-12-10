'use strict'
const Model = use('Model')

class DefinitionType extends Model {

    static get table () {
        return 'definition_type'
    }
    static scopeActive (query) {
        return query.where({active: 1})
    }
    static get hidden () {
        return ['comments', 'additional_info', 'active', 'created_by', 'created_at', 'updated_at']
    }
    definitionTypeDetail() {
        return this.hasMany('App/Models/DefinitionTypeDetail', 'id', 'def_type_id')
    }
}

module.exports = DefinitionType
