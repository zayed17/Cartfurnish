
var loader = document.getElementById('preloader');
window.addEventListener("load", function() {
  // Add the 'fade-out' class to trigger the fade-out effect
  loader.classList.add('fade-out');

  // After the transition duration, set display to 'none'
  setTimeout(function() {
    loader.style.display = "none";
  }, 500); // 500 milliseconds (same as the transition duration)
});
