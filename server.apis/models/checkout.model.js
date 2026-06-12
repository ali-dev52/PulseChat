import {  Schema } from "mongoose";

const checkoutSchema = new Schema({

     product: {
           type: Schema.Types.ObjectId,
           ref: "product"
     },
     user: {
           type: Schema.Types.ObjectId,
           ref: "users"
     },
     totalprice: { type: Number, required: true  },
     qty: { type: Number, required: true  },


})


export default checkoutSchema