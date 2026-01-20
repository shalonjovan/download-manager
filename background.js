// let isRe=false;

const reDownloads=new Set();

function getPath(oldpath){
  let parts =oldpath.split("/");
  let filename =parts.pop();
  let newpath="ReDownloads/"+filename;
  return newpath;
}

browser.downloads.onCreated.addListener(async (download) => {
    // if(isRe){
    //     return;
    // }
    if(download.url.startsWith("blob:")){
      return;
    }

    if(reDownloads.has(download.id)){
      reDownloads.delete(download.id);
      return;
    }

    console.log("download stopped:",download);

    try{
      await browser.downloads.cancel(download.id);
      await browser.downloads.erase({id: download.id});

      // isRe=true;

      let newid =await browser.downloads.download({
        url: download.url,
        filename: getPath(download.filename),
        conflictAction: "uniquify",
        saveAs: false,
      });

      reDownloads.add(newid);

      console.log("re download started baby");
    }catch(e){
      console.error("error in re download",e);
    }
});

browser.downloads.onChanged.addListener(delta => {
  if(delta.state && (delta.state.current === "complete" || delta.state.current === "interrupted")){
    reDownloads.delete(delta.id);
  }
});
