const Joi=require('joi')
const { stringify } = require('postcss')
const customerSchema=Joi.object({
    full_name:Joi.string().required().messages({
'string.empty':'Full name is required',
'any.required':'Full nmame is required'

    }),

    email:Joi.string().email().required().messages({
        "string.email":"Email must be a valid email",
        'string.empty':'Email is req',
        'any.required' :'Email is req'
    }),
    phone:Joi.string().required().messages({
        "string.phone":"phone is req",
        'any.required' :'phone is req'
    })
})


const validateCustomer=(customer)=>{
    return customerSchema.validate(customer, { abortEarly: false })
}
module.exports=validateCustomer