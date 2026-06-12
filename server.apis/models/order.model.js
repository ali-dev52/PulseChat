import { model, Schema } from "mongoose";
import checkoutSchema from "./checkout.model.js";

const orderSchema = new Schema({
       buyer: {
           type: Schema.Types.ObjectId,
           ref: "users"
       },
    //    buyerId: {

    //    },
       items: [checkoutSchema],
       orderStatus: {
             type: String, 
             enum: ['pending', 'shipped', 'delivered', "cancelled"],
             default: "pending"
       },
       shippingAddress: {
               address: { type: String, required: true},   
               pastal_code: { type: String, required: true},   
               city: { type: String, required: true},   
               state: { type: String, required: true},   
               country: { type: String, required: true},   
               phone: { type: String, required: true},    
       },
       shippingCharges: {type: Number, required: true},
       saving: {type: Number, required: true},
       deliveryTime: {
                type: String, 
                default:   Date.now()
       }, 
       stripeId: {},
})

const Order = model("order", orderSchema )
export default Order