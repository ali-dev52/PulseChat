

const Loader = () => {
  return (
<div className=" text-xl  bg-gray-200 min-h-screen">
  <div className="flex justify-center items-center h-screen">
    <div className="relative flex justify-center -translate-y-28  items-center">
      {/* Ring 1 */}
      <div className="absolute w-[190px] h-[190px] rounded-full border border-transparent border-b-[8px] border-b-[rgb(240,42,230)] animate-rotate1" />
      {/* Ring 2 */}
      <div className="absolute w-[190px] h-[190px] rounded-full border border-transparent border-b-[8px] border-b-[rgb(240,19,67)] animate-rotate2" />
      {/* Ring 3 */}
      <div className="absolute w-[190px] h-[190px] rounded-full border border-transparent border-b-[8px] border-b-[rgb(3,170,170)] animate-rotate3" />
      {/* Ring 4 */}
      <div className="absolute w-[190px] h-[190px] rounded-full border border-transparent border-b-[8px] border-b-[rgb(207,135,1)] animate-rotate4" />
      <h3 className="text-[rgb(82,79,79)]">loading</h3>
    </div>
  </div>
  <style dangerouslySetInnerHTML={{__html: "\n@keyframes rotate1 {\n  from { transform: rotateX(50deg) rotateZ(110deg); }\n  to { transform: rotateX(50deg) rotateZ(470deg); }\n}\n@keyframes rotate2 {\n  from { transform: rotateX(20deg) rotateY(50deg) rotateZ(20deg); }\n  to { transform: rotateX(20deg) rotateY(50deg) rotateZ(380deg); }\n}\n@keyframes rotate3 {\n  from { transform: rotateX(40deg) rotateY(130deg) rotateZ(450deg); }\n  to { transform: rotateX(40deg) rotateY(130deg) rotateZ(90deg); }\n}\n@keyframes rotate4 {\n  from { transform: rotateX(70deg) rotateZ(270deg); }\n  to { transform: rotateX(70deg) rotateZ(630deg); }\n}\n\n.animate-rotate1 { animation: rotate1 2s linear infinite; }\n.animate-rotate2 { animation: rotate2 2s linear infinite; }\n.animate-rotate3 { animation: rotate3 2s linear infinite; }\n.animate-rotate4 { animation: rotate4 2s linear infinite; }\n" }} />
</div>

  );
};

export default Loader;
