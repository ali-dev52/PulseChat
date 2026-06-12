import { Schema,model } from 'mongoose'

const categorySchema = new Schema({
      category_name:{
        type:String,
        require:true
      },
},{timestamps:true})


const cat = model("category",categorySchema)
export default cat;


