
import * as yup from 'yup'

export const SignUpSchema = yup.object({
    full_name:yup.string().min(2).max(25).required("Enter Your First Name"),
   
    email:yup.string().email().required("Enter Your email"),
    password:yup.string().min(2).max(25).matches(/[A-Z]/, "At least 1 uppercase letter").matches(/[a-z]/, "At least 1 lowercase letter").matches(/[0-9]/, "At least 1 number").required("Enter Your Password"),
    confirm_password:yup.string().required().oneOf([yup.ref("password"),null],"Enter Your Password")


})