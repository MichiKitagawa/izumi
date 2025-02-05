// src/components/VideoPlayerWithAds.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Typography } from '@mui/material';

interface VideoPlayerWithAdsProps {
  videoUrl: string; // presigned URL を含む動画のURL
}

const VideoPlayerWithAds: React.FC<VideoPlayerWithAdsProps> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [adsRequested, setAdsRequested] = useState(false);

  const requestAds = () => {
    if (adsRequested) return;
    if (
      window.google &&
      window.google.ima &&
      videoRef.current &&
      adContainerRef.current
    ) {
      const adDisplayContainer = new window.google.ima.AdDisplayContainer(
        adContainerRef.current,
        videoRef.current
      );
      // ユーザー操作後に初期化
      adDisplayContainer.initialize();

      const adsLoader = new window.google.ima.AdsLoader(adDisplayContainer);
      adsLoader.addEventListener(
        window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        (e: GoogleIMA.AdsManagerLoadedEvent) => {
          console.log('AdsManagerLoadedEvent received:', e);
          const adsManager = e.getAdsManager(videoRef.current);
          try {
            adsManager.init(640, 360, window.google.ima.ViewMode.NORMAL);
            adsManager.start();
            setAdsLoaded(true);
            console.log('Ads Manager started successfully.');
          } catch (adError) {
            console.error('Ads Manager error:', adError);
          }
        },
        false
      );

      const adsRequest = new window.google.ima.AdsRequest();
      adsRequest.adTagUrl =
        'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpost&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&cmsid=496&vid=short_onecue&correlator=';
      adsRequest.linearAdSlotWidth = 640;
      adsRequest.linearAdSlotHeight = 360;
      adsRequest.nonLinearAdSlotWidth = 640;
      adsRequest.nonLinearAdSlotHeight = 150;

      console.log('Ads Requesting URL:', adsRequest.adTagUrl);
      try {
        adsLoader.requestAds(adsRequest);
        setAdsRequested(true);
        console.log('Ads request sent successfully.');
      } catch (error) {
        console.error('Failed to request ads:', error);
      }
    } else {
      console.warn('Google IMA SDK not available or required elements missing.');
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    const onPlay = () => {
      console.log('Video play event triggered.');
      requestAds();
    };
    videoElement.addEventListener('play', onPlay);
    return () => {
      videoElement.removeEventListener('play', onPlay);
    };
  }, [adsRequested]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '640px' }}>
      <div
        ref={adContainerRef}
        style={{
          position: 'absolute',
          zIndex: 10,
          width: '640px',
          height: '360px',
          pointerEvents: 'none',
        }}
      ></div>
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        style={{ width: '640px', height: '360px' }}
      >
        Your browser does not support the video tag.
      </video>
      {!adsLoaded && adsRequested && (
        <Typography variant="body1" style={{ marginTop: '10px' }}>
          広告読み込み中...
        </Typography>
      )}
    </div>
  );
};

export default VideoPlayerWithAds;
