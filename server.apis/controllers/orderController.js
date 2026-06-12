import Order from "../models/order.model.js";

import { stripePaymentIntent, retrieveStripePayment, confirmStripePayment } from "../helpers/stripe.js"

const placeOrder = async (req, res) => {
    try {
        const { items, totalCost, shippingAddress } = req.body
        const userId = req.user._id

        // Create Stripe payment

        const payment = await stripePaymentIntent(totalCost)

        // Create order in database
        const newOrder = new Order({
            User: userId,
            items,
            totalCost,
            shippingAddress,
            stripeId: payment.id
        })

    } catch (error) {
        console.error("Error placing order :", error)
        res.status(500).json({ message: "Failed to place order" })
    }
}

const fetchUserOrders = async (req, res) => { 
    try {
        const userId = req.user._id
        const orders = await Order.find({ User: userId }).sort({ createdAt: -1 }) ///   sort by most recent orders first    
        res.json(orders)    
    }
    catch (error) {
        console.error("Error fetching user orders:", error)
        res.status(500).json({ message: "Failed to fetch orders" })
    }
}

const adminFetchAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 })    
    }
    catch (error) {
        console.error("Error fetching all orders:", error)
        res.status(500).json({ message: "Failed to fetch orders" })
    }
}

const orderStatusUpdate = async (req, res) => {
    try {
        const { orderId } = req.params
        const { status } = req.body   //// dropdown menu in admin panel to select new status

        const order = await Order.findByIdAndUpdate(orderId, { orderStatus: status, "deliveryDate.updatedAt": Date.now() }, { new: true }) 
        if(!order){
            return res.json({ message: "Order not found" })
        } else {
            res.json({ message: "Order status updated successfully", order })
        }
    } catch (error) {
        console.error("Error updating order status:", error)
        res.status(500).json({ message: "Failed to update order status" })
    }
}

//// when you checkout order place   - POST 
const deleteOrder = async (req, res ) => {
   
     const Orders = await Order.find()
     const length   = Orders.length
   
     try{
          if(length==0){
             return res.json({
                 display:"no product"
             })
          }
          {
           res.json({
             display:`we have ${length} products in our array`,
             products:products
           })
          }
     }
   
    catch (err) {
        return res.json({
            error: err.message
        })
    }
}


export {
    placeOrder,
    fetchUserOrders,
    adminFetchAllOrders,
    orderStatusUpdate,
    deleteOrder
}