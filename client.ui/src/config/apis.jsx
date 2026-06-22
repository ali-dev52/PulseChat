  
 const apis = {

           
          "prod" : `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/products`,
          "auth" : `${import.meta.env.VITE_API_URL}/users`,
          "authc" : `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/cusers`,
          "pic"  : `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}`,
           "conv" :`${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/conversations`
         

 }

 export default apis;