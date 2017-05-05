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
using System.ComponentModel;


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
            wvListener.ScriptNotify += wvListener_ScriptNotify;
        }

        async void wvListener_ScriptNotify(object sender, NotifyEventArgs e)
        {
            String newURL = e.Value;
            if (newURL.IndexOf("UA:") == 0)
            {
                return;
            }

            newURL = newURL.Substring(4);
            Debug.WriteLine("[wvListener_ScriptNotify] " + newURL);
            wvMain.Navigate(new Uri(newURL));

            if (dRequest != null) {
                dRequest.RequestActive();
            } else {
                dRequest = new DisplayRequest();
                dRequest.RequestActive();
            }
        }
    }
}
