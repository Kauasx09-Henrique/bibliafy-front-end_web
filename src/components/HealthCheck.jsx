import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Maintenance from '../pages/Maintenance';

export default function HealthCheck({ children }) {
    const [status, setStatus] = useState('loading');
    useEffect(() => {
        const checkApi = async () => {
            try {
                await api.get('/api/bible/versions', { timeout: 5000 });
                setStatus('ok');
            } catch (error) {
                console.error("API Check Failed:", error);

                if (!error.response || error.response.status >= 500) {
                    setStatus('error');
                } else {
                    setStatus('ok');
                }
            }
        };

        checkApi();
    }, []);

    if (status === 'loading') {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                background: '#050505',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
            }}>
                Carregando sistema...
            </div>
        );
    }

    if (status === 'error') {
        return <Maintenance />;
    }

    return <>{children}</>;
}