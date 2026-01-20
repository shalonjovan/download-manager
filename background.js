let isRe=false;

function getPath(oldpath){
  let parts =oldpath.split("/");
  let filename =parts.pop();
  let newpath="ReDownloads/"+parts.join("/")+"/"+filename;
  return newpath;
}

browser.downloads.onCreated.addListener(async (download) => {
    if(isRe){
        return;
    }

    console.log("download stopped:",download);

    try{
      await browser.downloads.cancel(download.id);
      await browser.downloads.erase({id: download.id});

      isRe=true;

      await browser.downloads.download({
        url: download.url,
        filename: getPath(download.filename),
        conflictAction: "uniquify",
        saveAs: false,
      });

      console.log("re download started baby");
    }catch(e){
      console.error("error in re download",e);
    }finally{
      isRe=false;
    }
});