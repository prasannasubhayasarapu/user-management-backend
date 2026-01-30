const supabase=require('../utils/supabaseClient')
const validateCustomer=require('../validations/orderValidation')

const createOrder=async(req,res)=>{
    const{error,value}=validateOrder(req.body)
    if(error){
        return res.status(400).json({error:error.details[0]})
    }
    try{
        const{data:customer,error:customerError}=await supabase
        .from('customers')
        .select('id')
        .eq('id',value.customerId)
        .single()
        
        if(customerError||!customer){
            return res.status(404).json({error:'customer not found'})
        }

        const {data,error:dbError}=await supabase.from('orders').insert([
            {
                product_name:value.product_name,
                quantity:value.quantity,
                price:value.price,
                customerId:value.customerId
            }
        ])
        
        if(dbError){
            return res.status(500).json({error:dbError.message})
        }

        res.status(201).json({
            message:'order created successfully',
            order:data[0]
        })
    }
    catch(err){
        res.status(500).json({error:err.message})
    }
}
const getCustomerOrders=async(req,res)=>
{
    const {customerId}=req.params
    if(!customerId){
        return res.status(400).json({error:'customer ID is required'})
    }
    try{
        const{data,error}=await supabase.from('orders').select('*').eq('customer_id',customerId)

        if(error){
            return res.status(500).json({error:error.message})
        }
        res.status(200).json({orders:data})
    
    }
    catch(err){
        res.status(500).json({error:err.message})
    }
}


const updateOrder=async (req,res)=>{
    const{orderId}=req.params
    const{quantity,price,order_status}=req.body

    if(orderId){
        return res.status(400).json({error:'order ID id req'})
    }

    try{
        const {data:existingOrder,error:fetchError}=await supabase.from('orders').select("id").eq('id',orderId).single()

        if(fetchError||!existingOrder){
            return res.status(404).json({error:'order not found'})
        }
        const updateData={}
        if(quantity !== undefined) updateData.quantity=quantity
        if(price !== undefined) updateData.price=price
        if(order_status!==undefined) updateData.order_status=order_status

        const{data,error}=await supabase.from('orders').update(updateData).eq("id",orderId).select()

        if(error){
            return res.status(500).json({error:error.message})
        }

        res.status(200)({
            message:'order updated successfully',
            order:data[0]
        })

    }catch(err){
        res.status(500).json({error:err.message})
    }
}

const  deleteOrder=async (rq,res)=>{
    const {orderId}=req.params
    if(!orderId){
        return res.status(400).json({error:'order ID is required'})
    }

    try{
        const{
            data,error}=await supabase.from('orders').delete().eq('id',orderId).select()

            if(error){
                return res.status(500).json({error:error.message})

            }
            if(data.length===0){
                return res.status(404).json({error:
                    'order not found'
                })
            }
            res.status(200).json({message:'order deleted successfully'})
        
    }catch(err){
        res.status(500).json({error:err.message})
    }
}

module.exports={
    createOrder,
    getCustomerOrders,updateOrder,deleteOrder
}