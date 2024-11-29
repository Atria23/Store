// import React, { useState } from "react";
// import { useForm } from "@inertiajs/react";

// const Transactions = () => {
//     const { data, setData, post, errors, reset } = useForm({
//         username: "dafkjld",
//         buyer_sku_code: "xld10",
//         customer_no: "087800001230",
//         ref_id: "test1",
//         sign: "493803498",
//         testing: true,
//     });

//     const [response, setResponse] = useState(null);

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         post(route("transactions.send"), {
//             onSuccess: (response) => {
//                 setResponse(response.props.flash.success);
//                 reset(); // Reset form
//             },
//             onError: (error) => {
//                 console.error(error);
//             },
//         });
//     };

//     return (
//         <div className="p-6 max-w-lg mx-auto">
//             <h1 className="text-xl font-bold mb-4">API Digiflazz Transaction</h1>
//             <form onSubmit={handleSubmit} className="space-y-4">
//                 <input
//                     type="text"
//                     value={data.username}
//                     onChange={(e) => setData("username", e.target.value)}
//                     placeholder="Username"
//                     className="w-full p-2 border rounded"
//                 />
//                 <input
//                     type="text"
//                     value={data.buyer_sku_code}
//                     onChange={(e) => setData("buyer_sku_code", e.target.value)}
//                     placeholder="Buyer SKU Code"
//                     className="w-full p-2 border rounded"
//                 />
//                 <input
//                     type="text"
//                     value={data.customer_no}
//                     onChange={(e) => setData("customer_no", e.target.value)}
//                     placeholder="Customer No"
//                     className="w-full p-2 border rounded"
//                 />
//                 <input
//                     type="text"
//                     value={data.ref_id}
//                     onChange={(e) => setData("ref_id", e.target.value)}
//                     placeholder="Ref ID"
//                     className="w-full p-2 border rounded"
//                 />
//                 <input
//                     type="text"
//                     value={data.sign}
//                     onChange={(e) => setData("sign", e.target.value)}
//                     placeholder="Sign"
//                     className="w-full p-2 border rounded"
//                 />
//                 <button
//                     type="submit"
//                     className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                 >
//                     Submit
//                 </button>
//             </form>

//             {response && (
//                 <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
//                     <pre>{JSON.stringify(response, null, 2)}</pre>
//                 </div>
//             )}

//             {errors && (
//                 <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
//                     <ul>
//                         {Object.keys(errors).map((key) => (
//                             <li key={key}>{errors[key]}</li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Transactions;

















import React, { useState } from "react";
import { useForm } from "@inertiajs/react";

const Transactions = () => {
    const { data, setData, post, errors, reset } = useForm({
        username: "yitaxig4J76D",
        buyer_sku_code: "xld10",
        customer_no: "087800001230",
        ref_id: "test1",
        sign: "56c4ae86abf6d8857541555dce848326",
        testing: true,
    });

    const [response, setResponse] = useState(null); // State untuk menyimpan respons dari server
    const [loading, setLoading] = useState(false); // State untuk loading

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true); // Aktifkan loading saat pengiriman data

        post(route("transactions.send"), {
            onSuccess: (serverResponse) => {
                console.log("Response received:", serverResponse);

                // Pastikan respons memiliki format yang sesuai
                setResponse(serverResponse?.props?.flash?.success || {});
                reset(); // Reset form setelah sukses
                setLoading(false); // Matikan loading
            },
            onError: (error) => {
                console.error("Error occurred:", error);
                setResponse(null); // Reset respons jika terjadi error
                setLoading(false); // Matikan loading
            },
        });
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-xl font-bold mb-4">API Digiflazz Transaction</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={data.username}
                    onChange={(e) => setData("username", e.target.value)}
                    placeholder="Username"
                    className="w-full p-2 border rounded"
                />
                {errors.username && (
                    <p className="text-red-500 text-sm">{errors.username}</p>
                )}

                <input
                    type="text"
                    value={data.buyer_sku_code}
                    onChange={(e) => setData("buyer_sku_code", e.target.value)}
                    placeholder="Buyer SKU Code"
                    className="w-full p-2 border rounded"
                />
                {errors.buyer_sku_code && (
                    <p className="text-red-500 text-sm">{errors.buyer_sku_code}</p>
                )}

                <input
                    type="text"
                    value={data.customer_no}
                    onChange={(e) => setData("customer_no", e.target.value)}
                    placeholder="Customer No"
                    className="w-full p-2 border rounded"
                />
                {errors.customer_no && (
                    <p className="text-red-500 text-sm">{errors.customer_no}</p>
                )}

                <input
                    type="text"
                    value={data.ref_id}
                    onChange={(e) => setData("ref_id", e.target.value)}
                    placeholder="Ref ID"
                    className="w-full p-2 border rounded"
                />
                {errors.ref_id && (
                    <p className="text-red-500 text-sm">{errors.ref_id}</p>
                )}

                <input
                    type="text"
                    value={data.sign}
                    onChange={(e) => setData("sign", e.target.value)}
                    placeholder="Sign"
                    className="w-full p-2 border rounded"
                />
                {errors.sign && (
                    <p className="text-red-500 text-sm">{errors.sign}</p>
                )}

                <button
                    type="submit"
                    className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"}`}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Submit"}
                </button>
            </form>

            {response && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
                    <h2 className="font-bold">Response:</h2>
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}

            {!response && !loading && (
                <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded">
                    <p>Menunggu respons API...</p>
                </div>
            )}

            {errors && (
                <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
                    <h2 className="font-bold">Errors:</h2>
                    <ul>
                        {Object.keys(errors).map((key) => (
                            <li key={key}>{errors[key]}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Transactions;
