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

// USER ROUTES WITHOUT AUTH
Route.group(() => {
  Route.post('/user/signup', 'UserController.signUp').validator('SignUp')
  Route.post('/user/signin', 'UserController.signIn').validator('SignIn')
  Route.get('/user/send_otp', 'UserController.sendUserOtp').validator('SendUserOtp')
  Route.get('/download/pdf', 'DefinitionTypeController.downloadPdf')
  Route.get('/generate/pdf', 'DefinitionTypeController.generatePdf')
  Route.get('/user/verify_otp', 'UserController.verifyUserOtp').validator('VerifyUserOtp')
  Route.get('/user/reset_password', 'UserController.resetPassword')
}).prefix('api/v1')

// POST ROUTES
Route.group(() => {
  Route.get('app/lov', 'DefinitionTypeController.definitionType')
  Route.post('post/detail', 'PostController.postDetail').validator('PostDetail')
  Route.post('post/create', 'PostController.createPost').validator('CreatePost')
  Route.get('user/save/post', 'PostController.userSavePost')
  Route.get('user/unsave/post', 'PostController.unsaveUserPost')
  Route.get('fetch/saved/posts', 'PostController.fecthUserSavedPosts')
  Route.get('view/count', 'PostController.postViewCount')
  Route.get('user/unsave/post', 'PostController.userUnsavedPost')
  Route.post('post/like', 'LikeController.likePost').validator('LikeValidation')
  Route.post('post/unlike', 'LikeController.unlikePost').validator('LikeValidation')
  Route.post('post/report', 'PostController.reportPost').validator('PostFlag')
  Route.get('user/share/post', 'PostController.userSharePost')
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

// PROFILE ROUTES
Route.group(() => {
  Route.patch('edit/profile', 'UserController.editUserProfile').validator('EditProfile')
  Route.get('get/user', 'UserController.getUserById')
  Route.get('user/notifications', 'UserController.userNotifications')
  Route.get('user/follow', 'UserController.followUser')
  Route.get('user/unfollow', 'UserController.unFollowUser')
  Route.get('follow/details', 'UserController.followDetails')
}).prefix('api/v1').middleware('auth:jwt')

// SEARCH ROUTES
Route.group(() => {
  Route.get('search/post', 'SearchController.searchPost').validator('Search')
  Route.get('search/user', 'SearchController.searchUsers').validator('Search')
  Route.get('search/campus', 'SearchController.searchCampus')
  Route.get('follower/posts', 'SearchController.followerPost')
}).prefix('api/v1').middleware('auth:jwt')

// ROOM ROUTES
Route.group(() => {
  Route.get('room/details', 'RoomController.userRoom')
}).prefix('api/v1').middleware('auth:jwt')
