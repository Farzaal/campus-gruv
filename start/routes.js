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
}).prefix('api/v1')

Route.group(() => {
  Route.get('app/lov', 'DefinitionTypeController.definitionType')
  Route.post('post/detail', 'PostController.postDetail').validator('PostDetail')
  Route.post('post/create', 'PostController.createPost').validator('CreatePost')
  Route.get('post/all', 'PostController.fetchAllPosts')
  Route.post('post/like', 'LikeController.likePost').validator('LikeValidation')
  Route.post('post/unlike', 'LikeController.unlikePost').validator('LikeValidation')
}).prefix('api/v1').middleware('auth:jwt')