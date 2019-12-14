'use strict'
const DefinitionType = use('App/Models/DefinitionType')
const R = require('ramda')

class DefinitionTypeController {

    async definitionType({ request, auth, response }) {

        const { def_type_id } = request.get() 
        if(!def_type_id) {
            return response.status(722).json({message: 'Missing def_type_id'})
        }
        const defTypes = await DefinitionType.query().where('id', def_type_id).with('definitionTypeDetail').fetch()
        if(R.isEmpty(defTypes.toJSON())) {
            return response.status(404).json({message: 'No def_type found'})
        }
        return response.status(200).json(defTypes.toJSON())
    }
}

module.exports = DefinitionTypeController
