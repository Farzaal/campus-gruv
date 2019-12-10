'use strict'
const Model = use('Model')

class DefinitionTypeDetail extends Model {

    static get table () {
        return 'definition_type_detail'
    }
    static scopeActive (query) {
        return query.where({active: 1})
    }
    static get hidden () {
        return ['def_type_id', 'comments', 'active', 'created_by', 'created_at', 'updated_at']
    }
}

module.exports = DefinitionTypeDetail
