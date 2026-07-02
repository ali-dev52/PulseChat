import { useState, useEffect } from "react";
import { getInitials, avatarColor } from "../../utils/chat";
import { X, MessageSquare, Clock, Calendar, Edit2, Check, User, MapPin, Phone, Camera, ShieldBan, Save } from "lucide-react";
import { useAuth } from "../../context/auth";
import api from "../../services/api";
import { successtoast, errortoast } from "../../toastify/toastify";
import { useNavigate, useLocation } from "react-router-dom";

const Profile = () => {
  const [Auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const targetUser = location.state?.user || Auth?.User;
  const isMe = String(Auth?.User?._id) === String(targetUser?._id);
  const user = targetUser;

  const [bg, fg] = avatarColor(user?._id || "");
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
  
  // Track new image selection specifically for base64 before saving
  const [newImagePreview, setNewImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || "",
        city: user.city || "",
        phonenumber: user.phonenumber || "",
        full_name: user.full_name || "",
        profilepicture: user.profilepicture || ""
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!isMe) return;
    setSaving(true);
    try {
      let finalImageUrl = formData.profilepicture;
      
      // If there's a new image selected locally, upload it first
      if (newImagePreview && newImagePreview !== formData.profilepicture) {
        try {
          const { data: uploadData } = await api.post("/messages/upload-image", { image: newImagePreview });
          if (uploadData.Location) {
            finalImageUrl = uploadData.Location;
          }
        } catch (uploadError) {
          errortoast("Failed to upload profile picture");
          setSaving(false);
          return;
        }
      }

      const updatedFormData = { ...formData, profilepicture: finalImageUrl };

      const { data } = await api.put("/users/profile", updatedFormData);
      if (data.success && data.success.user) {
        // Update auth context with new user data
        setAuth((prev) => ({
          ...prev,
          User: { ...prev.User, ...data.success.user }
        }));
        // Update local storage
        localStorage.setItem("user", JSON.stringify({ ...Auth.User, ...data.success.user }));
        successtoast(data.success.message || "Profile updated successfully");
        setFormData(updatedFormData);
        setNewImagePreview(null);
        setEditMode(false);
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

  const handleImageSelect = (e) => {
    if (!isMe) return;
    const file = e.target.files[0];
    if (file) {
      // Create a local preview immediately for UX
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlockUser = async () => {
    try {
      const { data } = await api.post(`/auth/block/${user._id}`);
      if (data.success) {
        successtoast(data.success.message);
        navigate("/");
      }
    } catch (err) {
      errortoast("Failed to block user");
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 dark:bg-[#0b141a] text-slate-900 dark:text-slate-100 p-4 md:p-8 custom-scrollbar relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary-500/20 to-transparent pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your personal information and preferences.</p>
          </div>
          
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          ) : (
            <button
              onClick={() => {
                setEditMode(false);
                setNewImagePreview(null);
              }}
              className="flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm backdrop-blur-xl">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 md:gap-10">
            
            <div className="relative group shrink-0">
              <div
                className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-5xl md:text-6xl font-bold shadow-xl ring-4 ring-white dark:ring-slate-950 overflow-hidden"
                style={{ background: bg, color: fg }}
              >
                {(newImagePreview || formData.profilepicture) ? (
                  <img src={newImagePreview || formData.profilepicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.full_name)
                )}
                
                {editMode && (
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-xs font-bold tracking-wider uppercase">Change Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                  </label>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col text-center sm:text-left mt-2 sm:mt-0 w-full">
              {editMode ? (
                <div className="space-y-4 w-full">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full text-lg font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                      placeholder="Write something about yourself..."
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold tracking-tight mb-1">{user?.full_name || 'Unknown User'}</h2>
                  <p className="text-primary-500 font-medium mb-4">{user?.email}</p>
                  
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">About</h3>
                    <p className="text-sm leading-relaxed">{user?.bio || "Hey there! I am using PulseChat."}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-8"></div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">City / Location</p>
                  {editMode ? (
                     <input
                       type="text"
                       value={formData.city}
                       onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                       className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                       placeholder="Enter your city"
                     />
                  ) : (
                    <p className="font-semibold text-lg truncate">{user?.city || "Not set"}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                  {editMode ? (
                     <input
                       type="text"
                       value={formData.phonenumber}
                       onChange={(e) => setFormData({ ...formData, phonenumber: e.target.value })}
                       className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                       placeholder="Enter phone number"
                     />
                  ) : (
                    <p className="font-semibold text-lg truncate">{user?.phonenumber || "Not set"}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Member Since</p>
                  <p className="font-semibold text-lg">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Account Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                    <span className="font-semibold text-lg">Active</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          {editMode && (
            <div className="mt-10 flex justify-end">
               <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/30 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-5 h-5" /> Save Changes
                    </>
                  )}
                </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
