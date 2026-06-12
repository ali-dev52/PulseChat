// install
import express from 'express'
import * as od from '../controllers/orderController.js';

const orders = express.Router()

orders.route("/")
       .get(od.adminFetchAllOrders)
       .post(od.placeOrder)

orders.route("/:id")
       .get(od.fetchUserOrders)
       .put(od.orderStatusUpdate)
       .delete(od.deleteOrder)

// export 
export default orders;
