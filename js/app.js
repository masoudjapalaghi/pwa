if ("serviceWorker" in navigator) {
  console.log("support serviceWorker");
  navigator.serviceWorker
    .register("/sw.js")
    .then((register) => {
      console.log("registered service worker",register);
    })
    .catch((err) => {
      console.log("un registered", err);
    });
} else {
  console.log("Not support serviceWorker");
}
