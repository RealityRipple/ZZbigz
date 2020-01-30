var zzbigz_api = {
 loadMagnet: async function(sURL)
 {
  let loggedIn = await zzbigz_api.zCheckLogin();
  if(!loggedIn)
   await zzbigz_api.zSendLogin();
  loggedIn = await zzbigz_api.zCheckLogin();
  if(!loggedIn)
   return false;
  let sName = sURL;
  if(sName.indexOf('&') !== -1)
   sName = sName.substring(0, sName.indexOf('&'));
  let svcPrompt = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
  if(svcPrompt.confirmEx(null, 'Download Torrent?', 'Do you wish to add the following torrent to your queue?\n\n' + sName, Components.interfaces.nsIPromptService.STD_YES_NO_BUTTONS, null, null, null, null, {}) === 1)
   return false;
  return await zzbigz_api.zAddMagnet(sURL);
 },
 loadTorrent: async function(sName, bData)
 {
  let loggedIn = await zzbigz_api.zCheckLogin();
  if(!loggedIn)
   await zzbigz_api.zSendLogin();
  loggedIn = await zzbigz_api.zCheckLogin();
  if(!loggedIn)
   return false;
  let svcPrompt = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
  if(sName === null)
  {
   if(svcPrompt.confirmEx(null, 'Download Torrent?', 'Do you wish to add this torrent to your queue?', Components.interfaces.nsIPromptService.STD_YES_NO_BUTTONS, null, null, null, null, {}) === 1)
    return false;
   sName = 'new.torrent';
  }
  else
  {
   if(svcPrompt.confirmEx(null, 'Download Torrent?', 'Do you wish to add the following torrent to your queue?\n\n' + sName, Components.interfaces.nsIPromptService.STD_YES_NO_BUTTONS, null, null, null, null, {}) === 1)
    return false;
  }
  return await zzbigz_api.zAddTorrent(sName, bData);
 },
 zCheckLogin: async function()
 {
  /*
  let sURL = 'https://api.zbigz.com/v1/stock/active';
  let jRet = await zzbigz_network.getMsgTo(sURL);
  */
  let jAccount = await zzbigz_api.zReadAccount();
  if(jAccount.hasOwnProperty('email'))
   return true;
  return false;
 },
 zSendLogin: async function()
 {
  window.openDialog('chrome://zzbigz/content/login.xul', 'zzbigz_login', 'chrome,dialog,resizable=no,width=350,height=540,alwaysRaised,modal');
 },
 zReadAccount: async function()
 {
  let sURL = 'https://api.zbigz.com/v1/account/info';
  let jRet = await zzbigz_network.postMsgTo(sURL, '', 'text/plain');
  return jRet;
 },
 zAddMagnet: async function(url)
 {
  let sURL = 'https://api.zbigz.com/v1/torrent/add';
  let jRet = await zzbigz_network.postMsgTo(sURL, 'url=' + encodeURIComponent(url), 'application/x-www-form-urlencoded');
  if(jRet.error !== 0 && jRet.error !== false)
  {
   let svcPrompt = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
   svcPrompt.alert(null, 'Error Adding Torrent', 'Unable to add your torrent:\n' + jRet.message);
   return false;
  }
  return true;
 },
 zAddTorrent: async function(filename, data)
 {
  let sBound = '---------------------------' + zzbigz_tools.rndStr(14);
  let sType = 'multipart/form-data; boundary=' + sBound;
  let sMsgHead = '--' + sBound + '\n' +
             'Content-Disposition: form-data; name="file"; filename="' + filename + '"\n' +
             'Content-Type: application/octet-stream\n\n';
  let sMsgFoot = '\n' +
                 '--' + sBound + '--\n';
  let iLen = sMsgHead.length + data.length + sMsgFoot.length;
  let bMsg = new ArrayBuffer(iLen);
  var sMsg = new Uint8Array(bMsg);
  let n = 0;
  for (var i = 0; i < sMsgHead.length; i++)
  {
   sMsg[n] = sMsgHead.charCodeAt(i) & 0xff;
   n++;
  }
  for (var i = 0; i < data.length; i++)
  {
   sMsg[n] = data.charCodeAt(i) & 0xff;
   n++;
  }
  for (var i = 0; i < sMsgFoot.length; i++)
  {
   sMsg[n] = sMsgFoot.charCodeAt(i) & 0xff;
   n++;
  }
  let sURL = 'https://api.zbigz.com/v1/torrent/add';
  let jRet = await zzbigz_network.postMsgTo(sURL, bMsg, sType);
  if(jRet.error !== 0 && jRet.error !== false)
  {
   let svcPrompt = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
   svcPrompt.alert(null, 'Error Adding Torrent', 'Unable to add your torrent:\n' + jRet.message);
   return false;
  }
  return true;
 }
};

var zzbigz_network = {
 session: null,
 readSession: function(setCookie)
 {
  if(typeof setCookie === 'undefined' || setCookie === null || setCookie === '')
   return;
  if(setCookie.indexOf(', ') !== -1)
  {
   let setCookies = setCookie.split(', ');
   for(let i = 0; i < setCookies.length; i++)
   {
    zzbigz_network.readSession(setCookies[i]);
   }
   return;
  }
  if(setCookie.substring(0, 8) !== 'session=')
   return;
  let sSession = setCookie.substring(8);
  sSession = sSession.substring(0, sSession.indexOf(';'));
  zzbigz_network.session = sSession;
 },
 sendPostTo: async function(addr, params, enc)
 {
  let timeout = 10000;
  let loadTime = 300000;
  return new Promise((resolve, reject) => {
   let xmlhttp;
   if(window.XMLHttpRequest)
    xmlhttp = new XMLHttpRequest();
   else
    xmlhttp = new window.ActiveXObject('Microsoft.XMLHTTP');
   xmlhttp.onreadystatechange = function()
   {
    if(xmlhttp.readyState !== 4)
     return;
    if(xmlhttp.status < 200 || xmlhttp.status > 299)
    {
     if(xmlhttp.status === 0)
      reject('Empty Response');
     else
      reject('HTTP Error ' + xmlhttp.status);
     return;
    }
    if(xmlhttp.responseText === '')
    {
     reject('Empty Response');
     return;
    }
    try
    {
     zzbigz_network.readSession(xmlhttp.getResponseHeader('set-cookie'));
     let respData = JSON.parse(xmlhttp.responseText);
     resolve(respData);
    }
    catch(ex)
    {
     reject(xmlhttp.responseText);
     return;
    }
   };
   xmlhttp.onprogress = function(e)
   {
    if(e.loaded !== 0 && e.loaded !== e.total)
    {
     if(xmlhttp.timeout === timeout)
      xmlhttp.timeout = loadTime;
    }
   };
   xmlhttp.ontimeout = function(err)
   {
    reject('Connection Timed Out');
   };
   xmlhttp.onerror= function(err)
   {
    reject('Connection Error');
   };
   xmlhttp.timeout = timeout;
   xmlhttp.open('POST', addr, true);
   xmlhttp.withCredentials = true;
   xmlhttp.setRequestHeader('Accept', 'application/json, application/xml, text/plain, text/html, *.*');
   xmlhttp.setRequestHeader('Content-Type', enc);
   if(zzbigz_network.session !== null)
    xmlhttp.setRequestHeader('Cookie', 'session=' + zzbigz_network.session);
   xmlhttp.send(params);
  });
 },
 postMsgTo: async function(addr, params, enc)
 {
  return new Promise((resolve, reject) => {
   let attempts = 3;
   const XHR = () => {
    if(attempts > 0)
    {
     attempts--;
     zzbigz_network.sendPostTo(addr, params, enc).then
      (
       (res) => { resolve(res); }
      ).catch
      (
       (e) => {
        if(e !== 'Empty Response')
        {
         reject(e);
         return;
        }
        setTimeout(() => { XHR(); }, 2500);
       }
      );
    }
   };
   XHR();
  });
 },
 sendGetTo: async function(addr)
 {
  let timeout = 10000;
  let loadTime = 300000;
  return new Promise((resolve, reject) => {
   let xmlhttp;
   if(window.XMLHttpRequest)
    xmlhttp = new XMLHttpRequest();
   else
    xmlhttp = new window.ActiveXObject('Microsoft.XMLHTTP');
   xmlhttp.onreadystatechange = function()
   {
    if(xmlhttp.readyState !== 4)
     return;
    if(xmlhttp.status < 200 || xmlhttp.status > 299)
    {
     if(xmlhttp.status === 0)
      reject('Empty Response');
     else
      reject('HTTP Error ' + xmlhttp.status);
     return;
    }
    if(xmlhttp.responseText === '')
    {
     reject('Empty Response');
     return;
    }
    try
    {
     zzbigz_network.readSession(xmlhttp.getResponseHeader('set-cookie'));
     let respData = JSON.parse(xmlhttp.responseText);
     resolve(respData);
    }
    catch(ex)
    {
     reject(xmlhttp.responseText);
     return;
    }
   };
   xmlhttp.onprogress = function(e)
   {
    if(e.loaded !== 0 && e.loaded !== e.total)
    {
     if(xmlhttp.timeout === timeout)
      xmlhttp.timeout = loadTime;
    }
   };
   xmlhttp.ontimeout = function(err)
   {
    reject('Connection Timed Out');
   };
   xmlhttp.onerror= function(err)
   {
    reject('Connection Error');
   };
   xmlhttp.timeout = timeout;
   xmlhttp.open('GET', addr, true);
   xmlhttp.withCredentials = true;
   xmlhttp.setRequestHeader('Accept', 'application/json, application/xml, text/plain, text/html, *.*');
   if(zzbigz_network.session !== null)
    xmlhttp.setRequestHeader('Cookie', 'session=' + zzbigz_network.session);
   xmlhttp.send();
  });
 },
 getMsgTo: async function(addr)
 {
  return new Promise((resolve, reject) => {
   let attempts = 3;
   const XHR = () => {
    if(attempts > 0)
    {
     attempts--;
     zzbigz_network.sendGetTo(addr).then
      (
       (res) => { resolve(res); }
      ).catch
      (
       (e) => {
        if(e !== 'Empty Response')
        {
         reject(e);
         return;
        }
        setTimeout(() => { XHR(); }, 2500);
       }
      );
    }
   };
   XHR();
  });
 }
};

var zzbigz_tools = {
 rndStr: function(len)
 {
  let arr = new Uint8Array(Math.ceil(len / 2));
  window.crypto.getRandomValues(arr);
  return zzbigz_tools.arrayBufferToHexString(arr).substring(0, len);
 },
 arrayBufferToHexString: function(arrayBuffer, signedHex = false)
 {
  let byteArray = new Uint8Array(arrayBuffer);
  let hexString = '';
  let nextHexByte;
  if(signedHex && byteArray[0] >= 0x80)
   hexString += '00';
  for(let i = 0; i < byteArray.byteLength; i++)
  {
   nextHexByte = byteArray[i].toString(16);
   if(nextHexByte.length < 2)
    nextHexByte = '0' + nextHexByte;
   hexString += nextHexByte;
  }
  return hexString;
 }
};