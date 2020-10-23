export function isAndroidWebview() {
  try {
    let userAgent = navigator.userAgent, features, engine, platform;
    // Inspired by https://en.wikipedia.org/wiki/User_agent#Format_for_human-operated_web_browsers
    if(!userAgent.startsWith('Mozilla/'))
      return false;
    // Strip the Mozilla/5.0 part
    [, userAgent] = /^Mozilla[/][0-9]+[.][0-9]+ (.+)$/.exec(userAgent);
    // System and browser information
    if(!userAgent.startsWith('('))
      return false;
    [, platform, userAgent] = /^[(]([^()]+)[)] (.+)$/.exec(userAgent);
    if(!platform.includes('Android'))
      return false;
    // https://developer.chrome.com/multidevice/user-agent - WebView UA in Lollipop and Above
    if(platform.split('; ').includes('wv'))
      return true;
    [, engine, features, userAgent] = /^([^/]+[/][0-9]+[.][0-9]+) [(]([^()]+)[)] (.+)$/.exec(userAgent);
    // Chrome is based on Webkit
    if(!engine.startsWith('AppleWebKit/'))
      return false;
    // The chrome browser does _not_ start with Version/...
    return /^Version[/][0-9.]{3,} Chrome[/][0-9.]{5,} Mobile /.test(userAgent);
  } catch (e) {
    console.warn(e);
    return false;
  }
}