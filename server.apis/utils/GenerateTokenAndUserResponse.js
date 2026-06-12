
import { JWT_SECRET } from "../config/config.js"
import jwt from 'jsonwebtoken'


const GenerateTokenAndUser = (User,req,res,message) => {
      const token = jwt.sign({id:User._id},JWT_SECRET,{expiresIn:"1d"})
      const refreshtoken = jwt.sign({id:User._id},JWT_SECRET,{expiresIn:"7d"})

      return res.json({
        User,
        token,
        refreshtoken,
        success:message
      })
}

export default GenerateTokenAndUser;
