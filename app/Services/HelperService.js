const Config = use('Config')
const AWS = require('aws-sdk')
const fs = require('fs')
const tinify = require("tinify");
const Env = use("Env");
tinify.key = Env.get("TINY_PNG_API_KEY");
const UserOtp = use('App/Models/UserOtp')
const UserPostAction = use('App/Models/UserPostAction')
const R = require('ramda')

class HelperService {

    static async sendEmail(email, subject, type, otp) {
        try {
            const text = type == 'email' ? `You have registered successfully. Below is your otp for email verification. Otp = ${otp}` :
                `Your otp for reset password is ${otp}`
            const sendGrid = Config.get('sendGrid.sgMail')
            const msg = {
                to: email,
                from: Config.get('constants.admin_email'),
                subject: subject,
                text: text,
            };
            sendGrid.send(msg);
            return true
        } catch (e) {
            Logger.info({ url: 'user/signup', Exception: e.message })
            return false
        }
    }

    static uploadToS3(prof, folder, bucketName = null) {    
        const bucket = bucketName ? bucketName : Config.get('aws.bucketName')
        const params = this.s3Params(prof, folder, bucket);
        const s3 = new AWS.S3({ accessKeyId: Config.get('aws.accessKeyId'), secretAccessKey: Config.get('aws.secretAccessKey') })
        return new Promise((accept, reject) => {
            s3.upload(params, function (err, data) {
                if (err) {
                    console.log("Error occurred while resolving promise", err);
                    reject(err)
                }
                accept(data);
            });
        })
    }

    static s3Params(prof, folder, bucket) {
        return {
            Bucket: bucket,
            Key: `${folder}/${prof.clientName}`,
            Body: fs.createReadStream(prof.tmpPath),
            ACL: 'public-read'
        };
    }

    static async saveUserOtp(email) {
        try {
            let emailOtp = '', type = ['email', 'reset_password']
            for (let i = 0; i < 2; i++) {
                const otp = Math.random().toString(36).slice(2)
                const userOtp = new UserOtp()
                userOtp.otp = otp
                userOtp.email = email
                userOtp.type = type[i]
                R.equals(type[i], 'email') ? emailOtp = otp : ''
                R.equals(type[i], 'email') ? userOtp.active = 1 : 0
                await userOtp.save()
            }
            return emailOtp;
        } catch (e) {
            console.log(e)
            return ''
        }
    }

    static getFollowerStatus(posts, id) {
        let postFolStatus = []
        if(R.isEmpty(posts)) {
            return postFolStatus
        }
        posts.map((post) => {
            const { userFollowing } = post
            let isFollowing = false;
            if (!R.isEmpty(userFollowing)) {
                const status = userFollowing.find((follower) => follower.follower_id == id)
                isFollowing = R.isNil(status) ? false : true
            }
            delete post['userFollowing']
            post.isFollowing = isFollowing
            postFolStatus.push(post)
        })
        return postFolStatus
    }

    static async userPostActions(id) {
        let actions = []
        const userAction = await UserPostAction.query().where('user_id', id).fetch()
        if(R.isEmpty(userAction.toJSON())) {
            return actions
        }
        actions = R.pluck("apply_to")(userAction.toJSON());
        return actions
    }
}

module.exports = HelperService
