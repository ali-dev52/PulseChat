import { useState } from "react";
import { getInitials, avatarColor } from "../../utils/chat";
import { X, MessageSquare, Clock, Calendar, Edit2, Check, User, MapPin, Phone } from "lucide-react";
import { useAuth } from "../../context/auth";
import api from "../../services/api";
import { successtoast, errortoast } from "../../toastify/toastify";
import ModalWrapper from "../shared/ModalWrapper";
import AnimatedReveal from "../shared/AnimatedReveal";
import { Camera, ShieldBan } from "lucide-react";

const ProfileModal = ({ user, onClose }) => {
  const [Auth, setAuth] = useAuth();
  const [bg, fg] = avatarColor(user?._id || "");

  const isMe = String(Auth?.User?._id) === String(user?._id);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [formData, setFormData] = useState({
    bio: user?.bio || "",
    city: user?.city || "",
    phonenumber: user?.phonenumber || "",
    full_name: user?.full_name || "",
    profilepicture: user?.profilepicture || ""
  });

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", formData);
      if (data.success && data.success.user) {
        // Update auth context with new user data
        setAuth((prev) => ({
          ...prev,
          User: { ...prev.User, ...data.success.user }
        }));
        // Update local storage
        localStorage.setItem("user", JSON.stringify({ ...Auth.User, ...data.success.user }));
        successtoast(data.success.message || "Profile updated successfully");
        onClose(); // Exit the modal completely
      } else if (data.error) {
        errortoast(data.error);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
      errortoast(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        try {
          const { data } = await api.post("/messages/upload-image", { image: base64String });
          if (data.Location) {
            setFormData({ ...formData, profilepicture: data.Location });
          }
        } catch (error) {
          errortoast("Failed to upload image");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlockUser = async () => {
    try {
      const { data } = await api.post(`/auth/block/${user._id}`);
      if (data.success) {
        successtoast(data.success.message);
        onClose(); // Close modal on block
      }
    } catch (err) {
      errortoast("Failed to block user");
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      {/* Container: Full screen on mobile, modal on desktop */}
      <div
        className="relative w-full h-[100dvh] md:h-auto md:w-[400px] md:max-h-[90vh] flex flex-col rounded-none md:rounded-3xl transform shadow-2xl bg-white dark:bg-slate-900 md:border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
          <div className="flex flex-col w-full h-full">
            
            {/* Native App Header */}
            <div className="shrink-0 z-20 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 md:border-none">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h1 className="text-lg font-bold tracking-wide text-slate-900 dark:text-white">Profile</h1>
              
              {isMe && !editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50"
                  title="Edit Profile"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-10 h-10" /> // Spacer for alignment
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-8 md:px-8 relative">
              {/* Premium Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />

              {/* Profile Avatar Section */}
              <div className="relative flex flex-col items-center gap-4 text-center mt-6">
                <div
                  className="w-28 h-28 md:w-24 md:h-24 rounded-full flex items-center justify-center text-5xl md:text-4xl font-bold shadow-xl ring-4 ring-white dark:ring-slate-900 transition-all duration-300 hover:scale-105 relative z-10 overflow-hidden group"
                  style={{ background: bg, color: fg }}
                >
                  {formData.profilepicture ? (
                    <img src={formData.profilepicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.full_name)
                  )}
                  
                  {editMode && (
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold tracking-wider uppercase">Change</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}

                  {!editMode && user?.isOnline && (
                    <span className="absolute bottom-1 right-1 w-6 h-6 md:w-5 md:h-5 rounded-full bg-green-500 border-4 border-white dark:border-slate-900" />
                  )}
                </div>

                <div className="w-full relative z-10">
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                      placeholder="Your Name"
                    />
                  ) : (
                    <h2 className="text-3xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {user?.full_name || 'User'}
                    </h2>
                  )}
                  <p className="text-sm mt-1 text-slate-500 dark:text-slate-400 font-medium">
                    {user?.email || 'No email'}
                  </p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4 pt-8 mt-2 border-t border-slate-100 dark:border-slate-800/50">

                {/* Bio Section */}
                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 shadow-sm">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-500" />
                    About
                  </span>
                  {editMode ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white resize-none"
                      placeholder="Write something about yourself..."
                      rows={3}
                    />
                  ) : (
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-200 leading-relaxed">
                      {user?.bio || "Hey there! I am using PulseChat."}
                    </span>
                  )}
                </div>

                {/* Location & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 shadow-sm">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      City
                    </span>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                        placeholder="City"
                      />
                    ) : (
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">
                        {user?.city || "Not set"}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 shadow-sm">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-green-500" />
                      Phone
                    </span>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.phonenumber}
                        onChange={(e) => setFormData({ ...formData, phonenumber: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                        placeholder="Phone"
                      />
                    ) : (
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">
                        {user?.phonenumber || "Not set"}
                      </span>
                    )}
                  </div>
                </div>

                {!editMode && (
                  <>
                    {/* Status */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 shadow-sm">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shadow-sm ${user?.isOnline ? 'bg-green-500' : 'bg-slate-400 dark:bg-slate-500'}`} />
                        Status
                      </span>
                      <span className={`text-sm font-bold ${user?.isOnline ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {user?.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    {/* Member Since */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 shadow-sm">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        Joined
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-200">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 mt-4">
                {editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex-1 py-3.5 rounded-xl font-bold transition-all duration-200 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 py-3.5 rounded-xl font-bold transition-all duration-200 bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {saving ? "Saving..." : (
                        <>
                          <Check className="w-5 h-5" /> Save Profile
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    {!isMe && (
                      <div className="flex w-full gap-2">
                        <button
                          onClick={handleBlockUser}
                          className="w-14 py-4 rounded-xl font-bold transition-all duration-200 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center"
                          title="Block User"
                        >
                          <ShieldBan className="w-5 h-5" />
                        </button>
                        <button
                          onClick={onClose}
                          className="flex-1 py-4 rounded-xl font-bold transition-all duration-200 bg-primary-500 text-white hover:bg-primary-600 shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-5 h-5" />
                          Send Message
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
      </div>
    </ModalWrapper>
  );
};

export default ProfileModal;
