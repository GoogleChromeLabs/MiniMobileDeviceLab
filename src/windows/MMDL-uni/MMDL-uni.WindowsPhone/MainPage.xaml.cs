/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * Mini Mobile Device Lab (Windows App)
 * https://github.com/GoogleChrome/MiniMobileDeviceLab
 *
 **/
 
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
using System.Diagnostics;
using Windows.System.Display;
using Windows.Phone.UI.Input;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=234238

namespace MMDL_uni
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        private DisplayRequest dRequest;
        public MainPage()
        {
            this.InitializeComponent();

            this.NavigationCacheMode = NavigationCacheMode.Required;
            wvListener.ScriptNotify += wvListener_ScriptNotify;
            Debug.WriteLine("[MainPage]");
        }

        async void wvListener_ScriptNotify(object sender, NotifyEventArgs e)
        {
            String newURL = e.Value;
            if (newURL.IndexOf("URL:") == 0)
            {
                Debug.WriteLine("[wvListener_ScriptNotify] " + newURL);
                wvMain.Navigate(new Uri(newURL.Substring(4)));
            }

            if (dRequest != null) {
                dRequest.RequestActive();
            } else {
                dRequest = new DisplayRequest();
                dRequest.RequestActive();
            }
        }

        /// <summary>
        /// Invoked when this page is about to be displayed in a Frame.
        /// </summary>
        /// <param name="e">Event data that describes how this page was reached.
        /// This parameter is typically used to configure the page.</param>
        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            // TODO: Prepare page for display here.

            // TODO: If your application contains multiple pages, ensure that you are
            // handling the hardware Back button by registering for the
            // Windows.Phone.UI.Input.HardwareButtons.BackPressed event.
            // If you are using the NavigationHelper provided by some templates,
            // this event is handled for you.
            Debug.WriteLine("[OnNavigatedTo]");
            HardwareButtons.BackPressed += this.MainPage_BackPressed;
        }

         private void MainPage_BackPressed(object sender, BackPressedEventArgs e)
         {
             Debug.WriteLine("[MainPage_BackPressed]");
             if (wvMain.CanGoBack) 
             {
                 wvMain.GoBack();
                 e.Handled = true;
             }
         }
    }
}
