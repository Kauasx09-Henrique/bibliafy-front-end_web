import React, { useState } from 'react';
import { WifiOff, RefreshCw, ServerCrash } from 'lucide-react';
import './Maintenance.css'; // Certifique-se de importar o CSS onde colocou as animações

export default function Maintenance() {
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = () => {
        setIsRetrying(true);
        // Simula um delay para o usuário ver a animação de "tentando"
        setTimeout(() => {
            window.location.reload();
        }, 800);
    };

    return (
        <div className="maintenance-bg" style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            padding: '20px',
            textAlign: 'center',
            overflow: 'hidden'
        }}>
            {/* Card Principal com efeito Glass */}
            <div className="animate-float" style={{
                backgroundColor: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '40px',
                borderRadius: '32px',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                position: 'relative'
            }}>
                
                {/* Ícone com Efeito de Radar */}
                <div style={{ position: 'relative', marginBottom: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {/* Ondas do Radar */}
                    <div className="radar-circle radar-delay-1" style={{ width: '80px', height: '80px', position: 'absolute' }}></div>
                    <div className="radar-circle radar-delay-2" style={{ width: '80px', height: '80px', position: 'absolute' }}></div>
                    
                    {/* Círculo Central */}
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        padding: '24px',
                        borderRadius: '50%',
                        position: 'relative',
                        zIndex: 2,
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
                    }}>
                        <WifiOff size={42} color="#ef4444" strokeWidth={2.5} />
                    </div>
                </div>

                <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    marginBottom: '12px',
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '-0.5px'
                }}>
                    Conexão Perdida
                </h1>

                <p style={{
                    color: '#9ca3af',
                    marginBottom: '32px',
                    lineHeight: '1.6',
                    fontSize: '0.95rem',
                    maxWidth: '300px'
                }}>
                    Parece que perdemos o contato com o servidor. Verifique sua internet ou tente novamente em instantes.
                </p>

                <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        backgroundColor: '#fff',
                        color: '#000',
                        border: 'none',
                        padding: '14px 32px',
                        borderRadius: '16px',
                        fontWeight: '600',
                        cursor: isRetrying ? 'wait' : 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '1rem',
                        width: '100%',
                        opacity: isRetrying ? 0.8 : 1,
                        transform: isRetrying ? 'scale(0.98)' : 'scale(1)',
                        boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)'
                    }}
                    onMouseOver={(e) => !isRetrying && (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseOut={(e) => !isRetrying && (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <RefreshCw size={20} className={isRetrying ? "spin-icon" : ""} />
                    {isRetrying ? "Reconectando..." : "Tentar Novamente"}
                </button>

                {/* Rodapé Pequeno */}
                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.4 }}>
                    <ServerCrash size={14} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Erro de Servidor / Rede</span>
                </div>
            </div>
        </div>
    );
}