// small UI nicety
console.log('E-Shop loaded');

// remove alerts after a few seconds
setTimeout(() => {
  document.querySelectorAll('.alert').forEach(a => a.style.display = 'none');
}, 6000);
