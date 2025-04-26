import React from "react";
import { useForm } from "@inertiajs/react";

const QrisAdmin = ({ admin }) => {
  const { data, setData, post, processing, errors } = useForm({
    qris_otomatis: null,
    qris_otomatis_status: admin?.qris_otomatis_status || false,
    qris_dana: null,
    qris_dana_status: admin?.qris_dana_status || false,
    qris_shopeepay: null,
    qris_shopeepay_status: admin?.qris_shopeepay_status || false,
    qris_gopay: null,
    qris_gopay_status: admin?.qris_gopay_status || false,
    qris_ovo: null,
    qris_ovo_status: admin?.qris_ovo_status || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    post(route("admin.updateQris"), {
      data: formData,
      forceFormData: true,
      onError: (errors) => console.error(errors),
    });
  };

  const renderPreview = (label, path) => (
    <div className="mt-4">
      <label className="block font-medium">{label} Preview:</label>
      <img
        src={path ? `/storage/${path}` : "/storage/logo.webp"}
        alt={label}
        className="w-48 mt-2"
      />
    </div>
  );

  const renderUploadField = (name, label) => (
    <div>
      <label className="block font-medium">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setData(name, e.target.files[0])}
        className="border rounded px-3 py-2 w-full"
      />
      {errors[name] && <div className="text-red-500 text-sm">{errors[name]}</div>}
    </div>
  );

  const renderCheckbox = (name, label) => (
    <div>
      <label className="block font-medium">{label}</label>
      <input
        type="checkbox"
        checked={data[name]}
        onChange={(e) => setData(name, e.target.checked)}
      />
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">QRIS Settings</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        {renderUploadField("qris_otomatis", "QRIS otomatis")}
        {renderCheckbox("qris_otomatis_status", "QRIS otomatis Aktif")}

        {renderUploadField("qris_dana", "QRIS Dana")}
        {renderCheckbox("qris_dana_status", "QRIS Dana Aktif")}

        {renderUploadField("qris_shopeepay", "QRIS ShopeePay")}
        {renderCheckbox("qris_shopeepay_status", "ShopeePay Aktif")}

        {renderUploadField("qris_gopay", "QRIS GoPay")}
        {renderCheckbox("qris_gopay_status", "GoPay Aktif")}

        {renderUploadField("qris_ovo", "QRIS OVO")}
        {renderCheckbox("qris_ovo_status", "OVO Aktif")}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={processing}
        >
          {processing ? "Updating..." : "Save Changes"}
        </button>
      </form>

      {renderPreview("QRIS Otomatis", admin?.qris_otomatis)}
      {renderPreview("QRIS Dana", admin?.qris_dana)}
      {renderPreview("ShopeePay", admin?.qris_shopeepay)}
      {renderPreview("GoPay", admin?.qris_gopay)}
      {renderPreview("OVO", admin?.qris_ovo)}
    </div>
  );
};

export default QrisAdmin;
