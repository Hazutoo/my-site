  var currentYear = new Date().getFullYear();
  document.getElementById("currentYear").innerHTML = currentYear;

document.getElementById('hamburger').addEventListener('click', function(event) {
    event.stopPropagation();
    const menu = document.getElementById('menu');
    if (menu.style.left === '-250px') {
        menu.style.left = '0px';
    } else {
        menu.style.left = '-250px';
    }
});

document.addEventListener('click', function(event) {
    const menu = document.getElementById('menu');
    if (menu.style.left === '0px') {
        menu.style.left = '-250px';
    }
});

document.getElementById('menu').addEventListener('click', function(event) {
    event.stopPropagation();
});
