// src/global.d.ts

export {}; // このファイルをモジュールとして扱うための記述

declare global {
  interface Window {
    adsbygoogle: {
      push: (config: object) => void;
    };
    google: {
      ima: {
        AdDisplayContainer: new (
          adContainer: HTMLElement,
          videoElement: HTMLMediaElement
        ) => { initialize: () => void };
        AdsLoader: new (adDisplayContainer: GoogleIMA.AdDisplayContainer) => {
          addEventListener: (
            type: string,
            listener: (e: GoogleIMA.AdsManagerLoadedEvent) => void,
            capture?: boolean
          ) => void;
          requestAds: (adsRequest: GoogleIMA.AdsRequest) => void;
        };
        AdsManagerLoadedEvent: {
          Type: {
            ADS_MANAGER_LOADED: string;
          };
        };
        AdsRequest: new () => GoogleIMA.AdsRequest;
        ViewMode: {
          NORMAL: string;
        };
      };
    };
  }}

declare namespace GoogleIMA {
  export interface AdsRequest {
    adTagUrl: string;
    linearAdSlotWidth: number;
    linearAdSlotHeight: number;
    nonLinearAdSlotWidth: number;
    nonLinearAdSlotHeight: number;
  }

  export interface AdsManager {
    init: (width: number, height: number, viewMode: string) => void;
    start: () => void;
  }

  export interface AdsManagerLoadedEvent {
    getAdsManager: (videoElement: HTMLMediaElement | null) => AdsManager;
  }
}
