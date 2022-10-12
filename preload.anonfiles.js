const { ipcRenderer } = require("electron");

window.onload = () => {
    window.document.title = "Upload your file to Anonfiles and POCOChat will automatically send it to chat!"
    waitForElementToDisplay("#upload-preview > div > div.input-group.upload-copy-url > input", 
    function() {
        ipcRenderer.send("anonfiles-url-autosubmit", window.document.querySelector("#upload-preview > div > div.input-group.upload-copy-url > input").value);
        window.close();
    },1000);
}

function waitForElementToDisplay(selector, callback, checkFrequencyInMs, timeoutInMs) {
    var startTimeInMs = Date.now();
    (function loopSearch() {
      if (window.document.querySelector(selector) != null) {
        callback();
        return;
      }
      else {
        setTimeout(function () {
          if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs)
            return;
          loopSearch();
        }, checkFrequencyInMs);
      }
    })();
}