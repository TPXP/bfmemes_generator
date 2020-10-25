import {isAndroidWebview} from "@/lib/user-agent";
import {uploadImage} from "@/lib/imgur";

export function readBlobAsDataURL (blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onerror = reject;
    fileReader.onloadend = function(){
      resolve(fileReader.result);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    fileReader.readAsDataURL(blob);
  });
}

export async function downloadImage(name, data) {
  const a = document.createElement('a');
  a.download = name;

  /**
   * Workaround for in-app browsers like Messenger or Facebook, for which blob URIs don't work:
   * We upload the image to Imgur (yup, you read that properly) and open the image in another tab
   * Note: blob URIs seems to work on some Webview browsers, like DuckDuckGo privacy browser, but opening the downloaded
   * image fails when pressing the notification. Let's just stick with our pessimistic but safe approach for now
   */
  if(isAndroidWebview()) {
    // FIXME Add a progress bar for the upload? - Requires the switch to XMLHttpRequest or axios
    const upload = await uploadImage(data);
    /**
     * We're still generating a download link, except it's targeting the Imgur URL
     * This way, the Android Download manager does not get mad (it won't download data URLs, but is fine with http URLs)
     * Also, for whatever reason, Imgur redirects us to the Imgur page of the image when opening the png version,
     * so we'll use the webp one (which they just generated on their own)
     */
    a.href = upload.link.replace(/[.]png$/, '.webp');
    a.download = name.replace(/[.]png$/, '.webp'); // For honor, even if it doesn't work
    /**
     * The download attribute only works for same-origin URLs, which isn't the case here
     * (see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-download)
     * The best we can do is open the Imgur URL in a new tab. The user can then save the image (or share it)
     * by long-pressing it.
     */
    a.rel = "noreferrer";
    a.target = "_blank"; // We must remove the referrer since Imgur would redirect to the image page otherwise
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    /**
     * We don't remove the image from Imgur's servers, since we want to let the user download it or share it
     * by long-pressing it, or opening the URL in another browser (when opened in FB's crappy integrated browser)
     * The user can take its time before doing this, and is not in our page anymore so we have no control and can't
     * known when he's done (actually, he might even share the Imgur URL!)
     */
    return;
  }
  // Else, just use a blob URI
  a.href = await readBlobAsDataURL(data);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}