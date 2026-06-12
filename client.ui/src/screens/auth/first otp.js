

import { errortoast, successtoast, warningtoast } from "../../toastify/toastify";
import { Link, useNavigate } from "react-router-dom";
import apis from "../../config/apis";
import { useState } from "react";
import axios from 'axios'

const OTP = () => {

  const [user, setuser] = useState({
       otp:""
  })

  const changehandler = (e) => {
      const name = e.target.name
      const value = e.target.value
      setuser({...user,[name]:value})
  }
  
  const otphandler = async (e) => {
      e.preventDefault()
      const {data} = await axios.post(`${apis.auth}/otp`,user)
      // const {error,warning,success,id} = data
      if(data.error){
        errortoast(data.error)
      }
      if(data.warning){
        warningtoast(data.warning)
      }
      if(data.success){
        setTimeout(() => {
          location.href=`/resetpassword/${data.success.id}`
        }, 2000);
        successtoast(data.success.message)
      }

  }
  const navigate = useNavigate();
  const submitHandler = () => {
    navigate("/resetpassword");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl hover:scale-110 transition duration-500 hover:shadow-blue-600 hover:shadow-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Enter OTP</h2>
        <p className="text-gray-500 text-lg mb-4 text-center">
          Enter the OTP sent to your email or phone
        </p>

        <form onSubmit={otphandler} >

          {/* otp */}
          <div>
            <input
            type="text"
            name = "otp"
            value={user.otp}
            onChange={changehandler}
            placeholder="Enter OTP"
            className="w-full p-3 mb-4 rounded border border-gray-300 hover:outline-none hover:ring-2 hover:ring-rose-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          </div>
          
          <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded font-semibold hover:opacity-90 transition">
            <Link >Verify OTP</Link>
          </button>
        </form>

      </div>
    </div>
  );
};

export default OTP;
