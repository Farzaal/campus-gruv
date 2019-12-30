'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})

Route.group(() => {
  Route.post('/user/signup', 'UserController.signUp').validator('SignUp')
  Route.post('/user/signin', 'UserController.signIn').validator('SignIn')
  Route.get('/user/send_otp', 'UserController.sendUserOtp')
  Route.get('/user/verify_otp', 'UserController.verifyUserOtp')
  Route.get('/user/reset_password', 'UserController.resetPassword')
}).prefix('api/v1')

// POST ROUTES
Route.group(() => {
  Route.get('app/lov', 'DefinitionTypeController.definitionType')
  Route.post('post/detail', 'PostController.postDetail').validator('PostDetail')
  Route.post('post/create', 'PostController.createPost').validator('CreatePost')
  Route.get('post/all', 'PostController.fetchAllPosts')
  Route.post('post/like', 'LikeController.likePost').validator('LikeValidation')
  Route.post('post/unlike', 'LikeController.unlikePost').validator('LikeValidation')
}).prefix('api/v1').middleware('auth:jwt')

// COMMENT ROUTES
Route.group(() => {
  Route.post('comment/create', 'CommentController.createComment').validator('Comment')
  Route.patch('comment/edit', 'CommentController.editComment')
  Route.delete('comment/delete', 'CommentController.deleteComment')
}).prefix('api/v1').middleware('auth:jwt')

Route.group(() => {
  Route.get('fetch/campuses', 'SettingController.fetchCampuses')
  Route.get('post/categories', 'SettingController.fetchPostCategories')
}).prefix('api/v1').middleware('auth:jwt')

Route.group(() => {
  Route.patch('edit/profile', 'UserController.editUserProfile').validator('EditProfile')
  Route.get('save/post', 'UserController.savedPosts')
}).prefix('api/v1').middleware('auth:jwt')