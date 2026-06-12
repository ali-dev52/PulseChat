


export const catchErr = (err,res) => {
      res.json({
        error:err.message
      })
}
export const error = (arg,res) => {
      res.json({
        error:arg
      })
}
export const warning = (arg,res) => {
      res.json({
        warning:arg
      })
}
export const success = (arg,res) => {
      res.json({
        success:arg
      })
}