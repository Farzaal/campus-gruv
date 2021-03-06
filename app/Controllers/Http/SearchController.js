"use strict";
const R = use("ramda");
const PostMaster = use("App/Models/PostMaster");
const User = use("App/Models/User");
const Campus = use("App/Models/Campus");
const UserFollower = use("App/Models/UserFollower");
const UserPostAction = use("App/Models/UserPostAction");
const HelperService = use("App/Services/HelperService");
const Logger = use("Logger");
const Database = use("Database");

class SearchController {
  async searchPost({ request, auth, response }) {
    const body = request.get();
    const { type, page } = body;
    const { id } = await this.getFromAuthUser(auth);
    const campus_id = body.campus_id ? body.campus_id : auth.user.campus_id
    const actions = await HelperService.userPostActions(id)
    if (R.equals(type, "post_all")) {
      const posts = await PostMaster.query()
        .active()
        .where("campus_id", campus_id)
        .whereNotIn("user_id", actions)
        .with("postDetail", builder => builder.select("post_id", "post_detail_title", "image_url"))
        .with("comments.user", builder => builder.select("id","first_name","last_name","email","profile_pic_url"))
        .with("users", builder => builder.select("id","first_name","last_name","email","profile_pic_url"))
        .with("userFollowing", builder => builder.where("follower_id", id))
        .with("userSavedPost", builder => builder.where("user_id", auth.user.id))
        .with("userWiseLike", builder => builder.where("user_id",auth.user.id))
        .with("postCategory")
        .with("campuses", builder => builder.select("id", "description"))
        .orderBy("created_at", "DESC")
        .paginate(page);
      const postsJson = posts.toJSON();
      const postCol = HelperService.getFollowerStatus(postsJson, id)
      return response.status(200).json(postCol);
    }

    if (R.equals(type, "post_category") && body.category_id) {
      const posts = await PostMaster.query()
        .active()
        .where("campus_id", campus_id)
        .where("category_id", body.category_id)
        .whereNotIn("user_id", actions)
        .with("postDetail", builder => builder.select("post_id", "post_detail_title", "image_url"))
        .with("comments.user", builder => builder.select("id","first_name","last_name","email","profile_pic_url"))
        .with("users", builder => builder.select("id","first_name","last_name","email","profile_pic_url"))
        .with("userFollowing", builder => builder.where("follower_id", id))
        .with("userSavedPost", builder => builder.where("user_id", auth.user.id))
        .with("userWiseLike", builder => builder.where("user_id",auth.user.id))
        .with("postCategory")
        .with("campuses", builder => builder.select("id", "description"))
        .orderBy("created_at", "DESC")
        .paginate(page);
      const postsJson = posts.toJSON();
      const postCol = HelperService.getFollowerStatus(postsJson, id)
      return response.status(200).json(postCol);
    }
    if (R.equals(type, "post_search") && body.description) {
      const posts = await PostMaster.query()
        .active()
        .where("title", "LIKE", `%${body.description}%`)
        .whereNotIn("user_id", actions)
        .with("postDetail", builder => builder.select("post_id", "post_detail_title", "image_url"))
        .with("comments.user", builder => builder.select("id","first_name","last_name","email","profile_pic_url"))
        .with("users", builder => builder.select("id","first_name","last_name","email","profile_pic_url"))
        .with("userFollowing", builder => builder.where("follower_id", id))
        .with("userSavedPost", builder => builder.where("user_id", auth.user.id))
        .with("userWiseLike", builder => builder.where("user_id",auth.user.id))
        .with("postCategory")
        .with("campuses", builder => builder.select("id", "description"))
        .orderBy("created_at", "DESC")
        .paginate(page);
      const postsJson = posts.toJSON();
      const postCol = HelperService.getFollowerStatus(postsJson, id)
      return response.status(200).json(postCol);
    }
    return response.status(400).json({ message: "Invalid Type or missing required param" });
  }

  async searchUsers({ request, auth, response }) {
    const body = request.get();
    const { type, page } = body;
    const { campus_id, id } = await this.getFromAuthUser(auth);
    const actions = HelperService.userPostActions(id)
    if (R.equals(type, "post") && body.user_id && !body.description) {
        const posts = await PostMaster.query().active().where("campus_id", campus_id).where("user_id", body.user_id)
        .with("postDetail", builder => builder.select("post_id", "post_detail_title", "image_url"))
        .with("comments.user", builder => builder.select("id","first_name","last_name","email","profile_pic_url"))
        .with("users", builder => builder.select("id","first_name","last_name","email","profile_pic_url"))
        .with("userFollowing", builder => builder.where("follower_id", id))
        .with("userSavedPost", builder => builder.where("user_id", auth.user.id))
        .with("userWiseLike", builder => builder.where("user_id",auth.user.id))
        .with("postCategory")
        .with("campuses", builder => builder.select("id", "description"))
        .orderBy("created_at", "DESC")
        .paginate(page);
      const postsJson = posts.toJSON();
      const postCol = HelperService.getFollowerStatus(postsJson, id)
      return response.status(200).json(postCol);
    }
    if (R.equals(type, "post") && body.description && body.user_id) {
      const posts = await PostMaster.query().active().where("campus_id", campus_id).where("user_id", body.user_id)
        .where("title", "LIKE", `%${body.description}%`)
        .with("postDetail", builder => builder.select("post_id", "post_detail_title", "image_url"))
        .with("comments.user", builder => builder.select("id","first_name","last_name","email","profile_pic_url"))
        .with("users", builder => builder.select("id","first_name","last_name","email","profile_pic_url"))
        .with("userFollowing", builder => builder.where("follower_id", id))
        .with("userSavedPost", builder => builder.where("user_id", auth.user.id))
        .with("userWiseLike", builder => builder.where("user_id",auth.user.id))
        .with("postCategory")
        .with("campuses", builder => builder.select("id", "description"))
        .orderBy("created_at", "DESC")
        .paginate(page);
      const postsJson = posts.toJSON();
      const postCol = HelperService.getFollowerStatus(postsJson, id)
      return response.status(200).json(postCol);
    }
    if (R.equals(type, "user") && body.description) {
      const actions = await HelperService.userPostActions(id)
      const users = await User.query()
        .where("first_name", "LIKE", `%${body.description}%`)
        .whereNotIn("id", actions)
        .with("campus")
        .with("userFollowing", builder => builder.where("follower_id", id))
        .orderBy("created_at", "DESC")
        .paginate(page);
      const usersJson = users.toJSON();
      const postCol = HelperService.getFollowerStatus(usersJson, id)
      return response.status(200).json(postCol);
    }
    return response.status(400).json({ message: "Invalid Type or missing required param" });
  }

  async searchCampus({ request, response }) {
    const body = request.get();
    if (!body.description) {
      return response.status(722).json({ message: "Description is required" });
    }
    const { page, description } = body;
    const campuses = await Campus.query().active().where("description", "LIKE", `%${description}%`).paginate(page);
    const campusJson = campuses.toJSON();
    return response.status(200).json(campusJson);
  }

  async followerPost({ request, auth, response }) {
    try {
      const page = request.input('page', 1)
      const authUserJson = await this.getFromAuthUser(auth)
      const campus_id = request.input('campus_id',authUserJson.campus_id)
      const followers = await UserFollower.query().where('follower_id', authUserJson.id).select('user_id').fetch()
      const followerIds = R.pluck('user_id')(followers.toJSON())
      const postAction = HelperService.userPostActions(authUserJson.id)
      const ids = R.symmetricDifference(followerIds, postAction)
        const followerPosts = await PostMaster.query().active().where("campus_id", campus_id).whereIn('user_id', ids)
          .with('postDetail', (builder) => builder.select('post_id', 'post_detail_title', 'image_url'))
          .with('comments.user', (builder) => builder.select('id', 'first_name', 'last_name', 'email', 'profile_pic_url'))
          .with('users', (builder) => builder.select('id', 'first_name', 'last_name', 'email', 'profile_pic_url'))
          .with('userFollowing', (builder) => builder.where('follower_id', authUserJson.id))
          .with("userSavedPost", builder => builder.where("user_id", auth.user.id))
          .with("userWiseLike", builder => builder.where("user_id",auth.user.id))
          .with('postCategory')
          .with('campuses', (builder) => builder.select('id', 'description'))
          .orderBy('created_at', 'DESC').paginate(page)
      const followerPostsJson = followerPosts.toJSON()
      return response.status(200).json(followerPostsJson)
    } catch (e) {
      Logger.info({ url: request.url(), Exception: e.message });
      return response.status(400).json({
        message: "Something went wrong. Unable to get your followed user posts"
      });
    }
  }

  async getFromAuthUser(auth) {
    const authUser = await auth.getUser();
    const authUserJson = authUser.toJSON();
    return authUserJson;
  }

  async getUserFollowings({ request, auth, response }) {

    const { user_id } = request.get();
    const { campus_id, id } = await this.getFromAuthUser(auth);
    const page = request.input('page', 1)
    try {
        const following = await UserFollower.query()
        .where("follower_id", user_id)
        .select("user_id")
        .fetch();
      const followingIds = R.pluck("user_id")(following.toJSON());
      const followings = await User.query()
        .where("campus_id", campus_id)
        .whereIn("id", followingIds)
        .with("userFollowing", builder => builder.where("follower_id", user_id))
        .orderBy("created_at", "DESC")
        .paginate(page);
      const followingusersJson = followings.toJSON();
      return response.status(200).json(followingusersJson);
    } catch (e) {
      Logger.info({ url: request.url(), Exception: e.message });
      return response.status(400).json({
        message: "Something went wrong. Unable to get followings"
      });
    }
  }

  async getUserFollowers({ request, response, auth }) {
    const { user_id } = request.get();
    const { campus_id, id } = await this.getFromAuthUser(auth);
    const page = request.input('page', 1)
    try {
      const follower = await UserFollower.query().where("user_id", id).select("follower_id").fetch();
      const followerIds = R.pluck("follower_id")(follower.toJSON());
      const postAction = await HelperService.userPostActions(id)
      const userId = R.symmetricDifference(followerIds, postAction)
      const followers = await User.query().where("campus_id", campus_id)
        .whereIn("id", userId)
        .with("userFollowing", builder => builder.where("follower_id", id))
        .orderBy("created_at", "DESC")
        .paginate(page);
      const followerusersJson = followers.toJSON();
      return response.status(200).json(followerusersJson);
    } catch (e) {
      console.log(e)
      Logger.info({ url: request.url(), Exception: e.message });
      return response.status(400).json({ message: "Something went wrong. Unable to get followers" });
    }
  }
}

module.exports = SearchController;
