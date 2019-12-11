const Env = use('Env')
 
module.exports = {
  name: Env.get('CLOUDINARY_NAME', 'dp8ybac11'),
  api_key: Env.get('CLOUDINARY_API_KEY', '691494556986484'),
  api_secret: Env.get('CLOUDINARY_API_SECRET', 'MmBILQnYvJATLA_QyZa97uLk2s0')
}