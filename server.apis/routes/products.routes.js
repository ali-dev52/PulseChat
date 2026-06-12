// install
import express from 'express'
import * as pc from '../controllers/products.controllers.js';
// router call kar lia
const products = express.Router()
// route create kar lia
products.route("/")
       .get(pc.getproducts)
       .post(pc.addproduct)
products.route("/:id")
       .get(pc.getproduct)
       .put(pc.updateproduct)
       .delete( pc.deleteproduct)


products.route("/cat")
        .get(pc.getcaregories)
       .post(pc.addcategory)

// export 
export default products;
