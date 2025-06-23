import React, { useEffect } from 'react';

interface AdSenseProps {
  slot: 'header' | 'sidebar' | 'footer' | 'article';
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSense({ slot, responsive = true }: AdSenseProps) {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  
  const slotIds = {
    header: import.meta.env.VITE_ADSENSE_SLOT_HEADER,
    sidebar: import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR,
    footer: import.meta.env.VITE_ADSENSE_SLOT_FOOTER,
    article: import.meta.env.VITE_ADSENSE_SLOT_ARTICLE
  };

  useEffect(() => {
    if (clientId && slotIds[slot]) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.log('AdSense error:', err);
      }
    }
  }, [clientId, slot]);

  if (!clientId || !slotIds[slot]) {
    return (
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
        <p className="text-sm">Advertisement Space</p>
        <p className="text-xs mt-1">Configure AdSense in environment variables</p>
      </div>
    );
  }

  const getAdStyle = () => {
    switch (slot) {
      case 'header':
        return { width: '100%', height: '90px' };
      case 'sidebar':
        return { width: '300px', height: '250px' };
      case 'footer':
        return { width: '100%', height: '90px' };
      case 'article':
        return { width: '100%', height: '280px' };
      default:
        return { width: '100%', height: '250px' };
    }
  };

  return (
    <div className={`ad-container ${slot}-ad my-4`}>
      <ins
        className="adsbygoogle"
        style={{
          display: responsive ? 'block' : 'inline-block',
          ...getAdStyle()
        }}
        data-ad-client={clientId}
        data-ad-slot={slotIds[slot]}
        data-ad-format={responsive ? 'auto' : undefined}
        data-full-width-responsive={responsive ? 'true' : undefined}
      />
    </div>
  );
}