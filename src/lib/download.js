export async function downloadImage(name, data) {
  const a = document.createElement('a'), now = new Date;
  a.download = name;
  return new Promise((resolve, reject) => {
    // Use the FileReader to get the blob as a data URI
    const fileReader = new FileReader();
    fileReader.onerror = reject;
    fileReader.onloadend = function(){
      a.href = fileReader.result;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      resolve();
    }
    fileReader.readAsDataURL(data);
  });
}