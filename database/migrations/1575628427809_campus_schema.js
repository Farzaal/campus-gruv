'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CampusSchema extends Schema {
  up () {
    this.create('campuses', (table) => {
      table.increments()
      table.string('name', 254).notNullable()
      table.string('description', 254)
      table.timestamps()
    })
  }

  down () {
    this.drop('campuses')
  }
}

module.exports = CampusSchema
