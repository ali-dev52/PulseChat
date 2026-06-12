
import { errortoast, successtoast } from '../../toastify/toastify.js'
import Loader from '../../layouts/Loader.jsx'
import { useParams } from 'react-router-dom'
import { useEffect,useState } from 'react'
import apis from '../../config/apis'
import axios from 'axios'

const Activateaccount = () => {

  const {token} = useParams()
  const [loader, setloader] = useState(false)

  useEffect(() => {
        createaccount()
  },[token])

  const createaccount = async () => {
    try{

      setloader(true)
      const {data} = await axios.post(`${apis.auth}/signup`,{token})
      const {error,success} = data
      

      if(error){
        setTimeout(() => {
           location.href='/login'
        },2000)
         errortoast(error)
      }
      if(success){
        setTimeout(() => {
           location.href='/login'
        },2000)
        successtoast(success)
      }
    }
    catch(err){
      console.log(err.message)
    }
  }
  return loader && <Loader />
}

export default Activateaccount
