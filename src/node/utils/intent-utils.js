const buildGenericBrowserIntent = (url) => {
  const FLAG_ACTIVITY_NEW_TASK = 0x10000000;

  const intent = {
    'wait': false,
    'action': 'android.intent.action.VIEW',
    'flags': [FLAG_ACTIVITY_NEW_TASK],
    'data': url,
  };

  return intent;
};

const buildChromeIntent = (url) => {
  const intent = buildGenericBrowserIntent(url);

  // Enforce specific browser
  intent.component = 'com.android.chrome/com.google.android.apps.chrome.Main';

  // NOTE: The extras prevent new tabs being opened
  intent.extras = [
    {
      'key': 'com.android.browser.application_id',
      'type': 'string',
      'value': 'com.android.chrome',
    },
  ];

  return intent;
};

module.exports = {
  buildChromeIntent,
  buildGenericBrowserIntent,
};
