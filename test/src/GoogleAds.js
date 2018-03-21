// Copyright 2013 Google Inc. All Rights Reserved.
// You may study, modify, and use this example for any purpose.
// Note that this example is provided "as is", WITHOUT WARRANTY
// of any kind either expressed or implied.

var adsManager;
var adsLoader;
var adDisplayContainer;
var intervalTimer;
var videoContent;
var adContainer;

function init(videoPlayer, divContainer) {
  videoContent = videoPlayer;
  adContainer = divContainer;
  setUpIMA();
}

function setUpIMA() {
  // Create the ad display container.
  createAdDisplayContainer();
  // Create ads loader.
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  // Listen and respond to ads loaded and error events.
  adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false);
  adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false);

  // An event listener to tell the SDK that our content video
  // is completed so the SDK can play any post-roll ads.
  var contentEndedListener = function() {adsLoader.contentComplete();};
  videoContent.onended = contentEndedListener;

  // Request video ads.
  var adsRequest = new google.ima.AdsRequest();
  // adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
  //     'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
  //     'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
  //     'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';
  // adsRequest.adTagUrl = 'https://googleads.g.doubleclick.net/pagead/ads?ad_type=video_text_image&client=ca-games-pub-6345584129312173&description_url=http%3A%2F%2Fwww.4399.com&channel=0000002478&videoad_start_delay=30000&hl=zh_CN&max_ad_duration=30000';
  adsRequest.adTagUrl = 'http://googleads.g.doubleclick.net/pagead/ads?ad_type=video_text_image&client=ca-games-pub-6345584129312173&description_url=http%3A%2F%2Fwww.4399.com&channel=0000002478&videoad_start_delay=30000&hl=zh_CN&max_ad_duration=30000';

  adsRequest.forceNonLinearFullSlot = true;
  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.

  var width = document.getElementById("GameCanvas").width;
  var height = document.getElementById("GameCanvas").height;

  adsRequest.linearAdSlotWidth = width;
  adsRequest.linearAdSlotHeight = height;

  adsRequest.nonLinearAdSlotWidth = width;
  adsRequest.nonLinearAdSlotHeight = height;

  adsLoader.requestAds(adsRequest);
}

function createAdDisplayContainer() {
  // We assume the adContainer is the DOM id of the element that will house
  // the ads.
  adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoContent);
}

function playAds() {
  // Initialize the container. Must be done via a user action on mobile devices.
  videoContent.load();
  adDisplayContainer.initialize();

  try {
    var width = document.getElementById("GameCanvas").width;
    var height = document.getElementById("GameCanvas").height;
    // var width = 320;
    // if(cc.sys.isMobile){
    //   width = document.getElementById("GameCanvas").width;
    // }else{
    //   width = document.getElementById("GameCanvas").width / 2.763;
    //   if(width < 655){
    //     width = 655;
    //   }
    // }
    // var height = document.getElementById("GameCanvas").height;

    // Initialize the ads manager. Ad rules playlist will start at this time.
    adsManager.init(width, height, google.ima.ViewMode.NORMAL);

    //广告容器位置相关设置(浏览器窗口变化,广告容器始终居中)
    // if(cc.sys.isMobile){
    //   adContainer.style.left = "0px";
    //   adContainer.style.top = "0px";
    // }else{
      var temp = (document.body.clientWidth - width) / 2;
      adContainer.style.left = temp + "px";
    // }

    // Call play to start showing the ad. Single video and overlay ads will
    // start at this time; the call will be ignored for ad rules.
    adsManager.start();
  } catch (adError) {
    // An error may be thrown if there was a problem with the VAST response.
    console.log("错误,关闭广告容器");
    GlobalEvent.emit("AdError");
  }
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  // Get the ads manager.
  var adsRenderingSettings = new google.ima.AdsRenderingSettings();
  adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  // videoContent should be set to the content video element.
  adsManager = adsManagerLoadedEvent.getAdsManager(
      videoContent, adsRenderingSettings);

  // Add listeners to the required events.
  adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      onAdEvent);

  // Listen to any additional events, if necessary.
  
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CLICK,
      onAdEvent);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.SKIPPED,
      onAdEvent);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.USER_CLOSE,
      onAdEvent);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.LOADED,
      onAdEvent);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.STARTED,
      onAdEvent);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.COMPLETE,
      onAdEvent);
}

function onAdEvent(adEvent) {
  // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
  // don't have ad object associated.
  var ad = adEvent.getAd();
  switch (adEvent.type) {
    case google.ima.AdEvent.Type.CLICK:
      console.log("点击广告");
      break;
    case google.ima.AdEvent.Type.SKIPPED:
      console.log("跳过广告");
      break;
    case google.ima.AdEvent.Type.USER_CLOSE:
      console.log("用户关闭广告");
      GlobalEvent.emit("AdsOver");
      break;
    case google.ima.AdEvent.Type.LOADED:
      // This is the first event sent for an ad - it is possible to
      // determine whether the ad is a video ad or an overlay.
      if (!ad.isLinear()) {
        // Position AdDisplayContainer correctly for overlay.
        // Use ad.width and ad.height.
        videoContent.play();
      }
      break;
    case google.ima.AdEvent.Type.STARTED:
      // This event indicates the ad has started - the video player
      // can adjust the UI, for example display a pause button and
      // remaining time.
      if (ad.isLinear()) {
        // For a linear ad, a timer can be started to poll for
        // the remaining time.
        intervalTimer = setInterval(
            function() {
              var remainingTime = adsManager.getRemainingTime();
            },
            300); // every 300ms
      }
      break;
    case google.ima.AdEvent.Type.COMPLETE:
      // This event indicates the ad has finished - the video player
      // can perform appropriate UI actions, such as removing the timer for
      // remaining time detection.
      if (ad.isLinear()) {
        clearInterval(intervalTimer);
      }
      break;
  }
}

function onAdError(adErrorEvent) {
  // Handle the error logging.
  console.log("错误了: " + adErrorEvent.getError());
  GlobalEvent.emit("AdError");
  if(adsManager){
    adsManager.destroy();
  }
}

function onContentPauseRequested() {
  videoContent.pause();
  // This function is where you should setup UI for showing ads (e.g.
  // display ad timer countdown, disable seeking etc.)
  // setupUIForAds();
}

function onContentResumeRequested() {
  videoContent.play();
  // This function is where you should ensure that your UI is ready
  // to play content. It is the responsibility of the Publisher to
  // implement this function when necessary.
  // setupUIForContent();

}

// Wire UI element references and UI event listeners.
// init();
