const Joi=require('joi')

const orderSchema=Joi.object({
    product_name:Joi.string().required().messages({
        'string.empty':'product name is req',
        'any.required':'product name req'
    }),
    quantity:Joi.number().integer().min(1).required().messages({
        'number.base':'Quantity must be a num',
        'number.integer':'Quantity must be a int',
        'number.min':'Quantity must be a atleast 1',
        'any.required':'Quantity is rq'
    }),
     price:Joi.number().positive().required().messages({
        'number.base':'price must be a num',
        'number.positive':'price must be a positive'
    }),
     customerId:Joi.string().uuid().required().messages({
        'string.uuid':'customerId must be a valid UUId',
        'any.required':'customerId is rq'
    })
    
})

const validateOrder=(order)=>{
    return orderSchema.validate(order,{abortEarly:false})
}
module.exports=validateOrder