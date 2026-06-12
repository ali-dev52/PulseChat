
import { FaGhost } from "react-icons/fa";
const P404 = () => {
  return (
    <div className="min-h-screen">
      <div className='bg-emerald-500 text-center text-5xl font-serif p-5'>
        Page Not Found
      </div>
      <p className='text-center mt-32 text-4xl'>
        The Page you are looking for is not exist
      </p>
      {<FaGhost className="mt-36 text-9xl ml-[700px] text-rose-900 hover:text-red-600 active:text-blue-800 animate-bounce " />}
    </div>
  )
}

export default P404
