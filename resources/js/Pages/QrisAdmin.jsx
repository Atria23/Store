import React from "react";
import { useForm } from "@inertiajs/react";

const QrisAdmin = ({ admin }) => {
  const { data, setData, post, processing, errors } = useForm({
    qris: null,
    qris_status: admin?.qris_status || false,
    qris_manual: null,
    qris_manual_status: admin?.qris_manual_status || false,
  });

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // This will give you the base64 string
      reader.onerror = reject;
      reader.readAsDataURL(file); // Reads file as base64
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert file to base64 if files are selected
    const qrisBase64 = data.qris ? await convertToBase64(data.qris) : null;
    const qrisManualBase64 = data.qris_manual ? await convertToBase64(data.qris_manual) : null;

    // Create FormData with base64 strings
    const formData = new FormData();
    formData.append("qris", qrisBase64 || data.qris); // If no file, use the existing data
    formData.append("qris_status", data.qris_status);
    formData.append("qris_manual", qrisManualBase64 || data.qris_manual);
    formData.append("qris_manual_status", data.qris_manual_status);

    // Send form data to backend
    post(route("admin.updateQris"), {
      data: formData,
      onError: (errors) => console.error(errors),
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">QRIS Settings</h1>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="space-y-4"
      >
        {/* QRIS Gambar */}
        <div>
          <label className="block font-medium">QRIS</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setData("qris", e.target.files[0])}
            className="border rounded px-3 py-2 w-full"
          />
          {errors.qris && (
            <div className="text-red-500 text-sm">{errors.qris}</div>
          )}
        </div>

        {/* QRIS Status */}
        <div>
          <label className="block font-medium">QRIS Status</label>
          <input
            type="checkbox"
            checked={data.qris_status}
            onChange={(e) => setData("qris_status", e.target.checked)}
          />
        </div>

        {/* QRIS Manual Gambar */}
        <div>
          <label className="block font-medium">QRIS Manual</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setData("qris_manual", e.target.files[0])}
            className="border rounded px-3 py-2 w-full"
          />
          {errors.qris_manual && (
            <div className="text-red-500 text-sm">{errors.qris_manual}</div>
          )}
        </div>

        {/* QRIS Manual Status */}
        <div>
          <label className="block font-medium">QRIS Manual Status</label>
          <input
            type="checkbox"
            checked={data.qris_manual_status}
            onChange={(e) => setData("qris_manual_status", e.target.checked)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={processing}
        >
          {processing ? "Updating..." : "Save Changes"}
        </button>
      </form>
      
      {admin.qris && (
    <div>
        <label>QRIS File:</label>
        <img src={`/storage/${admin.qris}`} alt="QRIS" />
    </div>
)}
{admin.qris_manual && (
    <div>
        <label>QRIS Manual File:</label>
        <img src={`/storage/${admin.qris_manual}`} alt="QRIS Manual" />
    </div>
)}


    </div>
  );
};

export default QrisAdmin;
