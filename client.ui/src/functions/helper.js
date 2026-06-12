


export const discountPriceCalc =  (onSale, discount, price) => {
         let discountPrice 
         if(onSale){
                  discountPrice =   price -   price * discount/100
         }
         return discountPrice
}