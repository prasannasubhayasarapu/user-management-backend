const supabase=require('../utils/supabaseClient')
const validateCustomer =require('../validations/customerValidation')
const registerCustomer=async(req,res)=>{
    const{error,value}=validateCustomer(req.body)
    if(error){
        return res.status(400).json({error:error.details[0].message})
    }
    try{
        const{data,error:dbError}=await supabase.from('customers').insert([
            {
                full_name:value.full_name,
                email:value.email,
                phone:value.phone
            }
        ])
        .select()
        if(dbError){
            return res.status(409).json({error:'Email already registered'})
        }
        return res.status(201).json({
            message:'Customer registered succssfully',
            customer:data[0]
        })
    }
catch(err){
    res.status(500).json({error:err.message})
}
}

module.exports={registerCustomer}