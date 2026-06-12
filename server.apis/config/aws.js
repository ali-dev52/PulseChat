
import SES from 'aws-sdk/clients/ses.js'
import S3 from 'aws-sdk/clients/s3.js'
// const SES = require("aws-sdk/clients/ses")

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY_ID = process.env.AWS_SECRET_ACCESS_KEY
const AWS_REGION = process.env.AWS_REGION || "eu-north-1"
const AWS_VERSION = "2010-12-12"

const awsConfig = {
  accessKeyId:AWS_ACCESS_KEY_ID,
  secretAccessKey:AWS_SECRET_ACCESS_KEY_ID,
  region:AWS_REGION,
  version:AWS_VERSION
}

export const AWS_SES = new SES(awsConfig)
export const AWSS3 = new S3(awsConfig)


export const sender_email = "Electro Saman<alimehmood.dev@gmail.com>"
export const CLIENT_URL = "http://localhost:81"

