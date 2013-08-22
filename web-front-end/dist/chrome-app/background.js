chrome.app.runtime.onLaunched.addListener(function() {
  console.log('Device Lab: onLaunched())');
  chrome.app.window.create('index.html', {
    'bounds': {
      'width': 600,
      'height': 800
    }
  });
});