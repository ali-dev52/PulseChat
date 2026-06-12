import React, { useState } from "react";
import axios from "axios";
import apis from "../../config/apis";

const UploadImage = ({ setFormData }) => {
  const [ads, setAds] = useState({
    photos: [],
    uploading: false,
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAds({ ...ads, uploading: true }); 

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      try {
        const image = reader.result;
        const { data } = await axios.post(
          "http://localhost:4321/api/v1/upload-image",
          { image }
        );
        const imageUrl = data.Location;
        // Update parent formData
        setFormData((prev) => ({
          ...prev,
          image: imageUrl,
        }));

        // Update local state
        setAds((prev) => ({
          ...prev,
          photos: [data, ...prev.photos],
          uploading: false,
        }));
      } catch (err) {
        console.log("Upload Error:", err);
        setAds({ ...ads, uploading: false });
        alert("Upload failed, try again!");
      }
    };
  };

  const deleteImageUpload = async (file) => {
    const ask = window.confirm("Delete this image?");
    if (!ask) return;

    setAds({ ...ads, uploading: true });

    try {
      const { data } = await axios.post(
        "http://localhost:7070/api/v1/delete-image",
        file
      );

      if (data?.ok) {
        setAds((prev) => ({
          ...prev,
          photos: prev.photos.filter((p) => p.Key !== file.Key),
          uploading: false,
        }));
        // Clear parent formData image if deleted
        setFormData((prev) => ({
          ...prev,
          image: "",
        }));
      }
    } catch (err) {
      console.log("Delete Error:", err);
      setAds({ ...ads, uploading: false });
      alert("Delete failed, try again!");
    }
  };

  return (
    <div className="relative w-full h-64 border-2 border-dashed border-gray-400 rounded-2xl flex items-center justify-center bg-gray-50 overflow-hidden">
      {ads.photos && ads.photos.length > 0 ? (
        <div className="relative w-full h-full">
          <img
            src={ads.photos[0]?.Location}
            alt="Uploaded"
            className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          />

          <button
            onClick={() => deleteImageUpload(ads.photos[0])}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
          >
            Delete
          </button>
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center justify-center">
          <span className="text-red-500 text-lg mb-2">
            {ads.uploading ? "Uploading..." : "Upload Photo"}
          </span>
          <input
            type="file"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </label>
      )}

      {ads.uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white font-semibold">
          Processing...
        </div>
      )}
    </div>
  );
};

export default UploadImage;
