import { useForm } from '@inertiajs/react';

const Dashboard = ({ user }) => {
    const { post } = useForm();

    const handleLogout = () => {
        post('/logout'); // Kirim permintaan logout
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
                <p className="mb-4">Welcome, {user.name}!</p>

                <div className="mt-4">
                    <button 
                        onClick={handleLogout} 
                        className="w-full bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
