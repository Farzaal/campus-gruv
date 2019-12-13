const Env = use('Env')
 
module.exports = {
  name: Env.get('CLOUDINARY_NAME', 'drtvwanfx'),
  api_key: Env.get('CLOUDINARY_API_KEY', '111264895227789'),
  api_secret: Env.get('CLOUDINARY_API_SECRET', 'XKwfoJIvkQyq40b1SxsjAShJ0dI')
}