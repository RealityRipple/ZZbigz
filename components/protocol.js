const ZZSCHEME = 'magnet';
const ZZPROT_HANDLER_CONTRACTID = '@mozilla.org/network/protocol;1?name=' + ZZSCHEME;
const ZZPROT_HANDLER_CID = Components.ID('{473CEB7D-74E0-5DDC-BE40-13F7EFD6FE43}');
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');
function MagnetProtocol() {}
MagnetProtocol.prototype = {
 _getBrowser: function()
 {
  return Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow('navigator:browser');
 },
 QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsISupports, Components.interfaces.nsIObserver, Components.interfaces.nsIFactory, Components.interfaces.nsIProtocolHandler]),
 classDescription: 'MAGNET URI handler for ZZbigz',
 contractID: ZZPROT_HANDLER_CONTRACTID,
 classID: ZZPROT_HANDLER_CID,
 createInstance: function(outer, iid)
 {
  if (outer)
   return Components.results.NS_ERROR_NO_AGGREGATION;
  return this.QueryInterface(iid);
 },
 observe: function(subject, topic, data)
 {
 },
 scheme: ZZSCHEME,
 defaultPort: 80,
 protocolFlags: Components.interfaces.nsIProtocolHandler.URI_NORELATIVE | Components.interfaces.nsIProtocolHandler.URI_NOAUTH | Components.interfaces.nsIProtocolHandler.URI_FORBIDS_AUTOMATIC_DOCUMENT_REPLACEMENT | Components.interfaces.nsIProtocolHandler.URI_LOADABLE_BY_ANYONE | Components.interfaces.nsIProtocolHandler.URI_DOES_NOT_RETURN_DATA,
 allowPort: function(port, scheme)
 {
  return true;
 },
 newURI: function(spec, charset, baseURI)
 {
  let uri = Components.classes['@mozilla.org/network/simple-uri;1'].createInstance(Components.interfaces.nsIURI);
  uri.spec = spec;
  return uri;
 },
 newChannel : function(input_uri)
 {
  let ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
  return ios.newChannel('javascript:null', null, null);
 },
 newChannel2 : async function(input_uri, loadinfo)
 {
  let brw = this._getBrowser();
  let added = await brw.zzbigz_api.loadMagnet(input_uri.spec);
  if (added)
   await brw.zzbigz_api.loadURL();
  let ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
  return ios.newChannel2('javascript:null', null, null, null, null, null, null, null);
 }
};
var components = [ MagnetProtocol ];
function NSGetModule(compMgr, fileSpec)
{
 return XPCOMUtils.generateModule(components);
}
if (XPCOMUtils.generateNSGetFactory)
 var NSGetFactory = XPCOMUtils.generateNSGetFactory(components);
