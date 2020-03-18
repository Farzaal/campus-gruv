const { hooks } = require('@adonisjs/ignitor')
const R = use('ramda')

hooks.after.providersBooted(() => {
  const Validator = use('Validator')
  const Database = use('Database')

  const existsFn = async (data, field, message, args, get) => {
    const value = get(data, field)
    if (!value) {
      return
    }
    if(R.equals(value, '1') || R.equals(value, '0')) {
        return;
    } else {
        throw new Error('Value must be 0 || 1')
    }
  }

  const actionValid = async (data, field, message, args, get) => {
    const value = get(data, field)
    if (!value) {
      return
    }
    if(R.equals(value, 'mute') || R.equals(value, 'block')) {
        return;
    } else {
        throw new Error('Action must be mute || block')
    }
  }

  Validator.extend('In', existsFn)
  Validator.extend('Action', actionValid)
})