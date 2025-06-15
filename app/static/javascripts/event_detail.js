// JS per il messaggio flash

setTimeout(() => {
  const flash = document.querySelector('.flash');
  if (flash) {
    $(flash).fadeOut();
    //flash.style.display = "none";
  }
}, 8000);