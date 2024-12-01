import React from 'react';

export default function Dashboard({ admin }) {
    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p>Welcome, {admin.name}!</p>
        </div>
    );
}
