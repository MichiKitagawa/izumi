// src/components/AudioPlayerWithAds.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';

interface AudioPlayerWithAdsProps {
  audioUrl: string;
}

const AudioPlayerWithAds: React.FC<AudioPlayerWithAdsProps> = ({ audioUrl }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [adsRequested, setAdsRequested] = useState(false);

  const requestAds = () => {
    if (adsRequested) return;
    if (
      window.google &&
      window.google.ima &&
      audioRef.current &&
      adContainerRef.current
    ) {
      const adDisplayContainer = new window.google.ima.AdDisplayContainer(
        adContainerRef.current,
        audioRef.current
      );
      adDisplayContainer.initialize();

      const adsLoader = new window.google.ima.AdsLoader(adDisplayContainer);
      adsLoader.addEventListener(
        window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        (e: GoogleIMA.AdsManagerLoadedEvent) => {
          console.log("Audio AdsManagerLoadedEvent received:", e);
          const adsManager = e.getAdsManager(audioRef.current);
          try {
            adsManager.init(1, 1, window.google.ima.ViewMode.NORMAL);
            adsManager.start();
            setAdsLoaded(true);
            console.log("Audio Ads Manager started successfully.");
          } catch (adError) {
            console.error("Audio Ads Manager error:", adError);
          }
        },
        false
      );

      const adsRequest = new window.google.ima.AdsRequest();
      adsRequest.adTagUrl =
        'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&url=[referrer_url]&correlator=';
      adsRequest.linearAdSlotWidth = 1;
      adsRequest.linearAdSlotHeight = 1;

      console.log("Audio Ads Requesting URL:", adsRequest.adTagUrl);
      try {
        adsLoader.requestAds(adsRequest);
        setAdsRequested(true);
        console.log("Audio ads request sent successfully.");
      } catch (error) {
        console.error("Failed to request audio ads:", error);
      }
    } else {
      console.warn("Google IMA SDK not available for Audio or required elements missing.");
    }
  };

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    const onPlay = () => {
      console.log("Audio play event triggered.");
      requestAds();
    };
    audioElement.addEventListener("play", onPlay);
    return () => {
      audioElement.removeEventListener("play", onPlay);
    };
  }, [adsRequested]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={adContainerRef}
        style={{
          position: 'absolute',
          zIndex: 10,
          width: '1px',
          height: '1px',
          pointerEvents: 'none',
        }}
      ></div>
      <Card style={{ margin: '20px 0' }} role="region" aria-label="Audio Advertisement">
        <CardMedia
          component="audio"
          ref={audioRef}
          src={audioUrl}
          controls
          autoPlay
        />
        <CardContent>
          {!adsLoaded && adsRequested && (
            <Typography variant="body2" color="textSecondary">
              広告読み込み中...
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioPlayerWithAds;
