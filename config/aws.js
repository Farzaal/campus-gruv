const Env = use('Env')
 
module.exports = {
  accessKeyId: Env.get('ACCESS_KEY_ID'),
  secretAccessKey: Env.get('SECRET_ACCESS_KEY'),
  bucketName: Env.get('BUCKET_NAME'),
  postbucketName: Env.get('POST_BUCKET_NAME'),
  pdfbucketName: Env.get('PDF_BUCKET_NAME'),
  compressedimages: Env.get('COMPRESSED_IMAGES_BUCKET'),
}