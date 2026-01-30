const express=require("express")
const router=express.Router()
const customerController =require('../controllers/orderController')
const orderController =require('../controllers/orderControllers')

router.post('/register-customer',customerController.registerCustomer)
router.post('/register-customer',customerController.registerCustomer)
router.get('/get-my-orders/:customerId',orderController.createOrder)
router.put('/update-order/:orderId',orderController.updateOrder)
router.delete('/delete-order/:orderId',orderController.deleteOrder)

module.exports=router;