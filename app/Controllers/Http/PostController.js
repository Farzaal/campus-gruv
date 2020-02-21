"use strict";
const PostMaster = use("App/Models/PostMaster");
const PostDetail = use("App/Models/PostDetail");
const UserSavedPost = use("App/Models/UserSavedPost");
const UserSharePost = use("App/Models/SharedPost");
const PostReport = use("App/Models/PostReport");
const Cloudinary = use("Cloudinary");
const Logger = use("Logger");
const Database = use("Database");
const R = use("ramda");
const fs = use("fs");
const Env = use("Env");
const Helpers = use("Helpers");
const tinify = require("tinify");
tinify.key = Env.get("TINY_PNG_API_KEY");

class PostController {
  async createPost({ request, auth, response }) {
    try {
      const postData = request.only([
        "user_id",
        "category_id",
        "title",
        "description"
      ]);
      const authUser = await auth.getUser();
      const { campus_id } = authUser.toJSON();
      postData.campus_id = campus_id;
      const post = await PostMaster.create(postData);
      const userPost = post.toJSON();
      return response.status(200).json(userPost);
    } catch (exp) {
      return response.status(400).json({ message: "Unable to create post" });
    }
  }

  async postDetail({ request, auth, response }) {
    const body = request.post();
    const postDetailImages = request.file("post_detail_images");
    let message = "Unable to save post detail";
    try {
      let cloudinaryMeta = await Cloudinary.uploader.upload(
        postDetailImages.tmpPath
      );
      const postDetail = new PostDetail();
      postDetail.post_id = body.post_id;
      postDetail.user_id = body.user_id;
      postDetail.image_url = cloudinaryMeta.secure_url;
      request.post_detail_title
        ? (body.post_detail_title = request.post_detail_title)
        : (postDetail.post_detail_title = "No Title");
      await postDetail.save();
      return response.status(200).json(postDetail);
    } catch (exp) {
      Logger.info({ url: request.url(), Exception: exp.message });
      return response.status(400).json({ message: exp.message });
    }
  }

  async handleCloudinaryUpload(postDetailImages) {
    let imageUrls = {};
    // const compresPath = Helpers.tmpPath(`${postDetailImages.clientName}`)
    // let cloudinaryMeta = await Cloudinary.uploader.upload(postDetailImages.tmpPath)
    // const source = await tinify.fromFile(postDetailImages)
    // await source.toFile(secPath)
    // let cloudinaryCompressed = await Cloudinary.uploader.upload(compresPath)
    // imageUrls.originalImageUrl = cloudinaryMeta.secure_url
    // imageUrls.compresImageUrl = cloudinaryCompressed.secure_url
    // fs.unlinkSync(compresPath)
    return imageUrls;
  }

  async fecthUserSavedPosts({ request, auth, response }) {
    try {
      const page = request.input("page", 1);
      const authUser = await auth.getUser();
      const authUserJson = authUser.toJSON();
      const savePostIds = await UserSavedPost.query()
        .where("user_id", authUserJson.id)
        .select("post_id")
        .fetch();
      const postIds = R.pluck("post_id")(savePostIds.toJSON());
      const posts = await PostMaster.query()
        .active()
        .whereIn("id", postIds)
        .with("postDetail", builder =>
          builder.select("post_id", "post_detail_title", "image_url")
        )
        .with("comments.user", builder =>
          builder.select(
            "id",
            "first_name",
            "last_name",
            "email",
            "profile_pic_url"
          )
        )
        .with("users", builder =>
          builder.select(
            "id",
            "first_name",
            "last_name",
            "email",
            "profile_pic_url"
          )
        )
        .with("userFollowing", builder =>
          builder.where("follower_id", authUserJson.id)
        )
        .with("userSavedPost.post", builder => builder.select("id"))
        .with("userWiseLike.user", builder => builder.select("id"))
        .with("postCategory")
        .with("campuses", builder => builder.select("id", "description"))
        .orderBy("created_at", "DESC")
        .paginate(page);
      const postsJson = posts.toJSON();
      return response.status(200).json(postsJson);
    } catch (e) {
      Logger.info({ url: request.url(), Exception: e.message });
      return response
        .status(400)
        .json({ message: "Something went wrong. Unable to get saved posts" });
    }
  }

  async userSavePost({ request, auth, response }) {
    try {
      const body = request.get();
      if (!body.post_id) {
        return response.status(722).json({ message: "Post_id is required" });
      }

      const authUser = await auth.getUser();
      const authUserJson = authUser.toJSON();
      const userSavePost = new UserSavedPost();
      userSavePost.post_id = body.post_id;
      userSavePost.user_id = authUserJson.id;
      await userSavePost.save();
      return response.status(200).json({ message: "Post Saved Successfully" });
    } catch (e) {
      Logger.info({ url: request.url(), exception: e.message });
      return response.status(400).json({ message: "Post already saved" });
    }
  }

  async unsaveUserPost({ request, auth, response }) {
    const body = request.get();
    if (!body.post_id) {
      return response.status(722).json({ message: "Post_id is required" });
    }
    const authUser = await auth.getUser();
    const authUserJson = authUser.toJSON();
    try {
      const userSavePost = await UserSavedPost.query()
        .where("user_id", authUserJson.id)
        .where("post_id", body.post_id)
        .delete();
      return response
        .status(200)
        .json({ message: "Post Unsaved Successfully" });
    } catch (e) {
      console.log(e);
      return response.status(400).json({ message: "Something went wrong" });
    }
  }

  async userSharePost({ request, auth, response }) {
    try {
      const body = request.get();
      if (!body.post_id) {
        return response.status(722).json({ message: "Post_id is required" });
      }
      console.log(body);
      const authUser = await auth.getUser();
      const authUserJson = authUser.toJSON();
      const userSavePost = new UserSharePost();
      userSavePost.post_id = body.post_id;
      // userSavePost.user_id = body.user_id
      userSavePost.user_id = authUserJson.id;
      await userSavePost.save();
      return response.status(200).json({ message: "Post Shared Successfully" });
    } catch (e) {
      Logger.info({ url: request.url(), exception: e.message });
      return response.status(400).json({ message: e.message });
    }
  }

  // async reportPost({ request, auth, response }) {
  //     const body = request.post()
  //     const reportCount = await PostReport.query().where('post_id', body.post_id).getCount()
  //     if(R.equals(reportCount, 3)) {
  //         return response.status(400).json({ message: 'Post is already inactive' })
  //     }
  //     if(R.equals(reportCount, 2)) {
  //         await PostMaster.query().where('id', body.post_id).update({ active: 0 })
  //     }
  //     const postReport = new PostReport()
  //     postReport.post_id = body.post_id
  //     postReport.user_id = body.user_id
  //     await postReport.save()
  //     return response.status(200).json({ message: 'Post reported successfully' })
  // }

  async reportPost({ request, auth, response }) {
    try {
      const body = request.post();
      const user_id = auth.user.id;
      const post_id = body.post_id;

      const reportLimit = 3;
      //check if current report exist from same user
      const existingreport = await Database.from("post_reports").where({
        user_id,
        post_id
      });
      const reportexist = existingreport.length === 0 ? false : true;

      if (!reportexist) {
        //check num of counts on that posts
        const reportsOnThatPost = await Database.from("post_reports").where({
          post_id
        });

        if (reportsOnThatPost.length < reportLimit) {
          const Report = new PostReport();
          Report.user_id = user_id;
          Report.post_id = post_id;
          Report.reason = body.reason
          Report.description = body.description
          await Report.save();
          if (reportsOnThatPost.length === reportLimit - 1) {
            console.log("inactive hogya");
            await PostMaster.query()
              .where("id", post_id)
              .update({ active: 0 });
          }
          return response
            .status(200)
            .json({ message: "Post Reported Successfully" });
        }
        return response
          .status(400)
          .json({ message: "post limit reached maximum,under review" });
      } else {
        return response.status(400).json({ message: "Post already reported" });
      }

      //make report if none of above
    } catch (e) {
      Logger.info({ url: request.url(), exception: e.message });
      return response.status(400).json({ message: e.message });
    }
  }

  async postViewCount({ request, response }) {
    const body = request.get();
    if (!body.post_id) {
      return response.status(722).json({ message: "post_id is required" });
    }
    await Database.table("post_master")
      .where("id", body.post_id)
      .increment("view_count", 1);
    return response.status(200).json({ message: "View count updated" });
  }
}

module.exports = PostController;
