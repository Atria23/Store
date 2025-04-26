import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

export default function LoadingScreen() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const start = () => setLoading(true);
        const finish = () => setLoading(false);

        router.on('start', start);
        router.on('finish', finish);
        router.on('error', finish);

        return () => {
            router.off('start', start);
            router.off('finish', finish);
            router.off('error', finish);
        };
    }, []);

    if (!loading) return null;

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] pointer-events-none">
    <div className="h-6 w-6 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin opacity-80 shadow-md backdrop-blur-sm" />
</div>

    );
}
