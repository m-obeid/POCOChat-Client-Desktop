// Electron preload for stuff

window.onload = () => {
    window.document.querySelector(".upper-navbar").setAttribute("style", "-webkit-app-region: drag"); // enable dragging
}