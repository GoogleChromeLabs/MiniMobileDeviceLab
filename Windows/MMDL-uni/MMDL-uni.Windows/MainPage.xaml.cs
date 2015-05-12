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

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=234238

namespace MMDL_uni
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            this.InitializeComponent();
            wvListener.ScriptNotify += wvListener_ScriptNotify;
            DisplayRequest dRequest = new DisplayRequest();
            dRequest.RequestActive();
        }

        async void wvListener_ScriptNotify(object sender, NotifyEventArgs e)
        {
            String newURL = e.Value;
            Debug.WriteLine("[wvListener_ScriptNotify] " + newURL);
            // TODO: Determine if we can launch IE, and still remain alive.
            if (false)
            {
                // Open the specified URL in IE, but keep listening!
            }
            else
            {
                // We couldn't open IE, so stay here and use the built in browser
                wvMain.Navigate(new Uri(newURL));
            }

        }
    }
}
