document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("toggle_id");
    const input = document.getElementById("input_id");
    input.checked = true;
    chrome.storage.local.get("input_checked", function(data) {
      if(typeof data.input_checked == "undefined") {
        input.checked = true;
      } else {
        input.checked = data.input_checked;
      }
    });

    button.addEventListener("click", () => {
      if(!input.checked){
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { type: "attach" });
        });
        input.checked = true;
      }
      else{
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { type: "deattach" });
        });
        input.checked = false;
      }
      chrome.storage.local.set({input_checked: input.checked});
      
    });
  });
  
