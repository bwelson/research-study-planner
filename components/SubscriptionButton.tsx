"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import PaystackButton to avoid SSR issues
const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => mod.PaystackButton),
  { ssr: false }
);

interface SubscriptionButtonProps {
  userEmail: string;
  onSuccess: () => void;
}

export default function SubscriptionButton({ userEmail, onSuccess }: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const config = {
    reference: new Date().getTime().toString(),
    email: userEmail,
    amount: 15000, // GH₵150 in pesewas (150 * 100)
    currency: 'GHS', // Ghana Cedis
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  };

  const handleSuccess = async (reference: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscription/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: reference.reference }),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Subscription verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const componentProps = {
    ...config,
    text: loading ? 'Processing...' : 'Upgrade - GH₵150/month',
    onSuccess: handleSuccess,
    onClose: () => console.log('Payment closed'),
  };

  return (
    <div style={{ width: '100%' }}>
      <style jsx global>{`
        .paystack-button {
          width: 100% !important;
          padding: 12px 24px !important;
          border-radius: 12px !important;
          border: none !important;
          background: ${loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'} !important;
          color: #ffffff !important;
          font-size: 15px !important;
          cursor: ${loading ? 'not-allowed' : 'pointer'} !important;
          font-weight: 600 !important;
          box-shadow: ${loading ? 'none' : '0 4px 14px rgba(102, 126, 234, 0.4)'} !important;
          transition: all 0.3s ease !important;
          text-align: center !important;
          font-family: inherit !important;
        }
        
        .paystack-button:hover {
          transform: ${loading ? 'none' : 'translateY(-2px)'} !important;
          box-shadow: ${loading ? 'none' : '0 6px 20px rgba(102, 126, 234, 0.5)'} !important;
        }
      `}</style>
      <PaystackButton
        {...componentProps}
        className="paystack-button"
      />
    </div>
  );
}