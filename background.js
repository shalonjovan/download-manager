console.log("script started");
const EXT_ID = browser.runtime.id;

let rulesConf=null;

async function initRules() {
  const stored = await browser.storage.local.get("rules");

  if(!stored.rules){
    console.log("first time init");
    let url =browser.runtime.getURL("./rules.json");
    let res= await fetch(url);
    let defaults=await res.json();

    await browser.storage.local.set({
      rules:defaults
    });
    
  }else{
    rulesConf=stored.rules;
    console.log("loaded rules");
  }
  console.log("Active rules:", rulesConf);
}

initRules();

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

function getPath(download){

  if(!rulesConf){
    console.warn("no rules yet")
    return download.filename;
  }

  let {filename,ext}=getFileInfo(download.filename);
  let domain=getDomain(download.url);

  for (const rule of rulesConf.rules){

    let flag1=true;
    let flag2=true;

    const conditions =rule.conditions

    if(conditions.domains && domain ){
      if(conditions.domains.some(d => domain.includes(d))){
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
}

browser.downloads.onCreated.addListener(async (download) => {
   
    if(download.url.startsWith("blob:")){
      return;
    }

    if(download.byExtensionId === EXT_ID){
      console.log("download stopping skipped for:",download);
      return;
    }


    try{
      await browser.downloads.cancel(download.id);
      await browser.downloads.erase({id: download.id});

      let newid =await browser.downloads.download({
        url: download.url,
        filename: getPath(download),
        conflictAction: "uniquify",
        saveAs: false,
      });

      console.log("re download started baby");
    }catch(e){
      console.error("error in re download",e);
    }
});

browser.storage.onChanged.addListener((changes,area)=>{
  if (area==="local" && changes.rules){
    rulesConf=changes.rules.newValue;
    console.log("updated rules");
     console.log("Active rules:", rulesConf);
  }
 
});
