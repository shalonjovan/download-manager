console.log("loaded")
// import rulesConf from "./rules.json"

let rulesConf=null;
async function loadRules(){
  try{
    let url =browser.runtime.getURL("./rules.json");
    let res=await fetch(url);
    rulesConf=await res.json();
    console.log("impoted");
  }catch(e){
    console.log("didnt work",e);
  }
}

loadRules();
// console.log("imported")

// let isRe=false;
let test =5;
const reDownloads=new Set();

function getFileInfo(path){
  let parts =path.split("/");
  let filename =parts.pop();
  
  let d_index=filename.lastIndexOf(".");

  let ext=""

  if(d_index!==-1){
    ext =filename.slice(d_index+1).toLowerCase();
  }else{
    ext =""
  }
  return {filename,ext}
}

function getDomain(url){
  try{
    return new URL(url).hostname;
  }catch{
    return "";
  }
}

// function getPath(download){
//   let parts =download.filename.split("/");
//   let filename =parts.pop();
//   let newpath="ReDownloads/"+filename;
//   return newpath;
// }

function getPath(download){
  let {filename,ext}=getFileInfo(download.filename);
  let domain=getDomain(download.url);

  for (const rule of rulesConf.rules){

    let flag1=true;
    let flag2=true;

    const conditions =rule.conditions

    if(conditions.domains && domain ){
      if(conditions.domains.some(d => domain.endsWith(d))){
        flag1=true;
      }else{
        flag1=false;
      }
    }
    
    if(conditions.extensions && ext ){
      if(conditions.extensions.includes(ext)){
        flag2=true;
      }else{
        flag2=false;
      }
    }

    if(flag1 && flag2){
      return rule.path+"/"+filename;
    }

  }
  return rulesConf.default.path+"/"+filename;
  // return "hello/"+filename;
  
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
        filename: getPath(download),
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
