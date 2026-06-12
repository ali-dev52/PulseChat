import { useState } from "react";
import { getInitials, avatarColor } from "../../utils/chat";
import { X, MessageSquare, Clock, Calendar, Edit2, Check, User, MapPin, Phone } from "lucide-react";
import { useAuth } from "../../context/auth";
import api from "../../services/api";
import { successtoast, errortoast } from "../../toastify/toastify";
import ModalWrapper from "../shared/ModalWrapper";
import AnimatedReveal from "../shared/AnimatedReveal";

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

  return (
    <ModalWrapper onClose={onClose}>
      {/* Modal Card */}
      <div
        className="relative w-full md:w-[400px] max-h-[90vh] overflow-y-auto custom-scrollbar rounded-t-3xl md:rounded-3xl p-6 md:p-8 transform shadow-2xl backdrop-blur-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
      >
        <AnimatedReveal animationKey={editMode ? 'edit' : 'view'}>
          <div className="space-y-6 w-full h-full">
            {/* Header Actions */}
            <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
              {isMe && !editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  title="Edit Profile"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar Section */}
            <div className="flex flex-col items-center gap-4 text-center mt-2">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg ring-4 ring-slate-50 dark:ring-slate-800 transition-all duration-300 hover:scale-105"
                style={{ background: bg, color: fg }}
              >
                {getInitials(user?.full_name)}
                {!editMode && user?.isOnline && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-4 border-white dark:border-slate-900" />
                )}
              </div>

              <div className="w-full">
                {editMode ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                    placeholder="Your Name"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {user?.full_name || 'User'}
                  </h2>
                )}
                <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
                  {user?.email || 'No email'}
                </p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800/50">

              {/* Bio Section */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  About
                </span>
                {editMode ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white resize-none"
                    placeholder="Write something about yourself..."
                    rows={3}
                  />
                ) : (
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {user?.bio || "Hey there! I am using ChatMe."}
                  </span>
                )}
              </div>

              {/* Location & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    City
                  </span>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                      placeholder="City"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user?.city || "Not set"}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Phone
                  </span>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.phonenumber}
                      onChange={(e) => setFormData({ ...formData, phonenumber: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                      placeholder="Phone"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user?.phonenumber || "Not set"}
                    </span>
                  )}
                </div>
              </div>

              {!editMode && (
                <>
                  {/* Status */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user?.isOnline ? 'bg-green-500' : 'bg-slate-400 dark:bg-slate-500'}`} />
                      Status
                    </span>
                    <span className={`text-sm font-semibold ${user?.isOnline ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {user?.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  {/* Member Since */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Joined
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 bg-primary-500 text-white hover:bg-primary-600 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {saving ? "Saving..." : (
                      <>
                        <Check className="w-4 h-4" /> Save
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Close
                  </button>
                  {!isMe && (
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/30 flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </AnimatedReveal>
      </div>
    </ModalWrapper>
  );
};

export default ProfileModal;
