var zzbigz_login = {
 _timer: Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer),
 init: function()
 {
  zzbigz_login._timer.init(zzbigz_login.tickEvent, 1000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
 },
 tickEvent:
 {
  observe: function(subject, topic, data)
  {
   zzbigz_login._timer.cancel();
   let fraLogin = document.getElementById('fraLogin');
   let sTitle = fraLogin.contentDocument.title;
   if(sTitle === 'Zbigz.com - Online torrent downloader. Download torrent online.')
    sTitle = 'Log in to Zbigz';
   if(document.title !== sTitle)
    document.title = sTitle;
   if(fraLogin.contentDocument.URL === 'https://zbigz.com/myfiles')
   {
    window.close();
    return;
   }
   zzbigz_login._timer.init(zzbigz_login.tickEvent, 250, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
  }
 }
};