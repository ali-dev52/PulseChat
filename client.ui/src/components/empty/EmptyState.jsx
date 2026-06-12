const EmptyState = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center h-full text-white">
    <h2 className="text-xl mb-4">No Conversations Yet</h2>
    <button onClick={onStart} className="bg-blue-500 px-4 py-2 rounded">
      Start Chat
    </button>
  </div>
);

export default EmptyState;