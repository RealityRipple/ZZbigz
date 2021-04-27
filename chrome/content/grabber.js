var zzbigz_grabber = {
 LoadListener: function()
 {
  window.removeEventListener('load', zzbigz_grabber.LoadListener, false);
  gBrowser.addTabsProgressListener(zzbigz_grabber.ProgressListener, Components.interfaces.nsIWebProgress.NOTIFY_PROGRESS);
  let observerService = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(zzbigz_grabber.ResponseObserver, 'http-on-examine-response', false);
  zzbigz_network.session = null;
  let cookieManager = Components.classes['@mozilla.org/cookiemanager;1'].getService(Components.interfaces.nsICookieManager2);
  let eCookies = cookieManager.getCookiesFromHost('zbigz.com', {});
  while (eCookies.hasMoreElements())
  {
   let cookie = eCookies.getNext().QueryInterface(Components.interfaces.nsICookie2); 
   if(cookie.name !== 'session')
    continue;
   zzbigz_network.session = cookie.value;
  }
 },
 ProgressListener:
 {
  QueryInterface: function(aIID)
  {
   if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
       aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
       aIID.equals(Components.interfaces.nsISupports))
    return this;
   throw Components.results.NS_NOINTERFACE;
  },
  onLocationChange: async function(aBrowser, aProgress, aRequest, aURI, aFlags) {},
  onStateChange: function() {},
  onProgressChange: function() {},
  onStatusChange: function() {},
  onSecurityChange: function() {},
  onLinkIconAvailable: function() {}
 },
 ResponseObserver:
 {
  observe: function(aSubject, aTopic, aData)
  {
   if(aTopic === 'http-on-examine-response')
   {
    if(aSubject.contentType === 'application/x-bittorrent')
    {
     let newListener = new zzbigz_grabber.TracingListener();
     aSubject.QueryInterface(Components.interfaces.nsITraceableChannel);
     newListener.originalListener = aSubject.setNewListener(newListener);
     return;
    }
    try
    {
     if(aSubject.contentDispositionFilename !== null)
     {
      let sFile = aSubject.contentDispositionFilename;
      if(typeof sFile !== 'undefined' && sFile.substr(sFile.length - 8).toLowerCase() === '.torrent')
      {
       let newListener = new zzbigz_grabber.TracingListener();
       aSubject.QueryInterface(Components.interfaces.nsITraceableChannel);
       newListener.originalListener = aSubject.setNewListener(newListener);
       return;
      }
     }
    }
    catch(ex) {}
    /*
    if(aSubject.hasOwnProperty('name'))
    {
     if(aSubject.name.substr(aSubject.name.length - 8).toLowerCase() === '.torrent')
     {
      let newListener = new zzbigz_grabber.TracingListener();
      aSubject.QueryInterface(Components.interfaces.nsITraceableChannel);
      newListener.originalListener = aSubject.setNewListener(newListener);
      return;
     }
    }
    */
   }
  },
  QueryInterface : function (aIID)
  {
   if (aIID.equals(Components.interfaces.nsIObserver) || aIID.equals(Components.interfaces.nsISupports))
    return this;
   throw Components.results.NS_NOINTERFACE;
  }
 },
 TracingListener: function()
 {
  this.originalListener = null;
  this.receivedData = [];
 }
};
zzbigz_grabber.TracingListener.prototype = {
 onDataAvailable: function(request, context, inputStream, offset, count)
 {
  try
  {
   let binaryInputStream = Components.classes['@mozilla.org/binaryinputstream;1'].getService(Components.interfaces.nsIBinaryInputStream);
   binaryInputStream.setInputStream(inputStream);
   let data = binaryInputStream.readBytes(count);
   this.receivedData.push(data);
  }
  catch(ex) {}
 },
 onStartRequest: function(request, context)
 {
 },
 onStopRequest: function(request, context, statusCode)
 {
  let sName = null;
  try
  {
   if(request.contentDispositionFilename !== null)
    sName = request.contentDispositionFilename;
  }
  catch(ex) {}
  let responseSource = this.receivedData.join('');
  zzbigz_api.loadTorrent(sName, responseSource);
 },
 QueryInterface: function (aIID)
 {
  if (aIID.equals(Components.interfaces.nsIStreamListener) || aIID.equals(Components.interfaces.nsISupports))
   return this;
  throw Components.results.NS_NOINTERFACE;
 }
};
window.addEventListener('load', zzbigz_grabber.LoadListener, false);
