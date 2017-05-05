/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * Mini Mobile Device Lab (iOS Client)
 * https://github.com/GoogleChrome/MiniMobileDeviceLab
 * ViewController.m
 *
 **/

#import "ViewController.h"
#import <Firebase/Firebase.h>

static const CGFloat kLabelHeight = 14.0f;
static const CGFloat kMargin = 10.0f;
static const CGFloat kSpacer = 2.0f;
static const CGFloat kLabelFontSize = 10.0f;
static const CGFloat kAddressFontSize = 14.0f;
static const CGFloat kAddressHeight = 22.0f;


@interface ViewController() <WKNavigationDelegate>

- (IBAction)butBack:(id)sender;
@property (weak, nonatomic) IBOutlet UIBarButtonItem *butBack;

- (IBAction)butStop:(id)sender;
@property (weak, nonatomic) IBOutlet UIBarButtonItem *butStop;

- (IBAction)butReload:(id)sender;
@property (weak, nonatomic) IBOutlet UIBarButtonItem *butReload;

- (IBAction)butForward:(id)sender;
@property (weak, nonatomic) IBOutlet UIBarButtonItem *butForward;

@property (strong, nonatomic) UILabel *pageTitle;
@property (strong, nonatomic) UITextField *addressField;
@property (strong, nonatomic) NSString *strURL;

- (void)loadRequestFromString:(NSString*)urlString;
- (void)loadRequestFromAddressField:(id)addressField;

- (void)updateButtons;
- (void)informError:(NSError*)error;
- (void)initFirebase;
- (void)connectFirebase;
- (void)disconnectFirebase;

@end

@implementation ViewController

- (void)initFirebase {
    NSLog(@"initFirebase");
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *fbAppName = [defaults stringForKey:@"fbAppName"];
    if (!fbAppName) {
        fbAppName = [NSString stringWithFormat:@"goog-mtv-device-lab"];
    }

    NSString *fbURL = [NSString stringWithFormat:@"https://%@.firebaseio.com/url", fbAppName];
    NSLog(@"%@", fbURL.uppercaseString);

    self.myRootRef = [[Firebase alloc] initWithUrl:fbURL];
    [self.myRootRef authAnonymouslyWithCompletionBlock:^(NSError *error, FAuthData *authData) {
        if (error) {
            [self informError:error];
        } else {
            NSLog(@"Firebase authentication completed.");
            
            [self.myRootRef observeEventType:FEventTypeValue withBlock:^(FDataSnapshot *snapshot) {
                @try {
                    self.strURL = snapshot.value;
                    NSLog(@"** New URL: %@", self.strURL);
                    [self loadRequestFromString:self.strURL];
                }
                @catch (NSException *ex) {
                    NSLog(@"%@", ex.reason);
                }
            }];
        }
    }];
}


- (void)connectFirebase {
    NSLog(@"connectFirebase");
}

- (void)disconnectFirebase {
    NSLog(@"disconnectFirebase");
    [self.myRootRef removeAllObservers];
}

- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    if ([error code] == NSURLErrorCancelled) {
        NSLog(@"didFailNavigation: (minor) %@", error.description);
        return;
    }
    NSLog(@"didiFailNavigation: (MAJOR) %@", error.description);
    [UIApplication sharedApplication].networkActivityIndicatorVisible = NO;
    [[NSURLCache sharedURLCache] removeAllCachedResponses];
    [self updateButtons];
    [self informError:error];
}

- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    if ([error code] == NSURLErrorCancelled) {
        NSLog(@"didFailProvisionalNavigation: (minor) %@", error.description);
        return;
    }
    NSLog(@"didFailProvisionalNavigation: (MAJOR) %@", error.description);
    [UIApplication sharedApplication].networkActivityIndicatorVisible = NO;
    [[NSURLCache sharedURLCache] removeAllCachedResponses];
    [self updateButtons];
    [self informError:error];
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    NSLog(@"didFinishNavigation");
    [UIApplication sharedApplication].networkActivityIndicatorVisible = NO;
    [self updateButtons];
    self.pageTitle.text = _wkWebView.title;
    self.addressField.text = [_wkWebView.URL absoluteString];
}

- (void)webView:(WKWebView *)webView didReceiveServerRedirectForProvisionalNavigation:(WKNavigation *)navigation {
    NSLog(@"didReceiveServerRedirectForProvisionalNavigation");
    self.addressField.text = [_wkWebView.URL absoluteString];
}

- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(WKNavigation *)navigation {
    NSLog(@"didStartProvisionalNavigation");
    self.addressField.text = [_wkWebView.URL absoluteString];
    [UIApplication sharedApplication].networkActivityIndicatorVisible = YES;
    [self updateButtons];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    NSLog(@"viewDidLoad");
    
    /* Create the page title label */
    UINavigationBar *navBar = self.navigationController.navigationBar;
    CGRect labelFrame = CGRectMake(kMargin, kSpacer, navBar.bounds.size.width - 2*kMargin, kLabelHeight);
    UILabel *label = [[UILabel alloc] initWithFrame:labelFrame];
    label.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    label.backgroundColor = [UIColor clearColor];
    label.font = [UIFont systemFontOfSize:kLabelFontSize];
    label.textAlignment = NSTextAlignmentCenter;
    [navBar addSubview:label];
    self.pageTitle = label;
    
    /* Create the address bar */
    CGRect addressFrame = CGRectMake(kMargin, kSpacer*2.0 + kLabelHeight, labelFrame.size.width, kAddressHeight);
    UITextField *address = [[UITextField alloc] initWithFrame:addressFrame];
    address.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    address.borderStyle = UITextBorderStyleRoundedRect;
    address.font = [UIFont systemFontOfSize:kAddressFontSize];
    address.keyboardType = UIKeyboardTypeURL;
    address.autocapitalizationType = UITextAutocapitalizationTypeNone;
    address.clearButtonMode = UITextFieldViewModeWhileEditing;
    [address addTarget:self action:@selector(loadRequestFromAddressField:)
      forControlEvents:UIControlEventEditingDidEndOnExit];
    [navBar addSubview:address];
    self.addressField = address;
    
    _wkWebView = [[WKWebView alloc] initWithFrame:self.view.frame];
    NSMutableString *readyBody = [[NSMutableString alloc]init];
    [readyBody appendString:@"<html><head>"];
    [readyBody appendString:@"<meta name='viewport' content='width=device-width,initial-scale=1'>"];
    [readyBody appendString:@"<style>body { font-family: Roboto, Helvetica; text-align: center; } "];
    [readyBody appendString:@"h1 { font-size: 55vw; } "];
    [readyBody appendString:@"</style><head><body><div>"];
    [readyBody appendString:@"<h1>:P</h1><div>"];
    [readyBody appendString:@"goog-mtv-device-lab"];
    [readyBody appendString:@"</div></div></body></html>"];
    [_wkWebView loadHTMLString:readyBody baseURL:nil];
    _wkWebView.navigationDelegate = self;
    [self.view addSubview:_wkWebView];
    NSString *myUA = @"Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13E238 Safari/601.1";
    _wkWebView.customUserAgent = myUA;
    
    @try {
        [self initFirebase];
    }
    @catch (NSException *ex) {
        NSLog(@"Firebase failed: %@", ex.reason);
    }
    
    UIApplication *thisApp = [UIApplication sharedApplication];
    thisApp.idleTimerDisabled = YES;
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
    NSLog(@"didReceiveMemoryWarning");
    [[NSURLCache sharedURLCache] removeAllCachedResponses];
}

- (void)loadRequestFromString:(NSString*)urlString {
    NSURL *url = [NSURL URLWithString:urlString];
    if (!url.scheme) {
        NSString *modifiedURL = [NSString stringWithFormat:@"http://%@", urlString];
        url = [NSURL URLWithString:modifiedURL];
    }
    NSURLRequestCachePolicy cachePol = NSURLRequestReloadIgnoringCacheData;
    NSTimeInterval reqTimeout = 60;
    NSURLRequest *urlRequest = [NSURLRequest requestWithURL:url cachePolicy:cachePol timeoutInterval:reqTimeout];
    [_wkWebView loadRequest:urlRequest];
}

- (void)loadRequestFromAddressField:(id)addressField {
    NSString *urlString = [addressField text];
    [self loadRequestFromString:urlString];
}

- (void)informError:(NSError *)error {
    NSLog(@"informError: %@", error.description);
    NSMutableString *readyBody = [[NSMutableString alloc]init];
    [readyBody appendString:@"<html><head>"];
    [readyBody appendString:@"<meta name='viewport' content='width=device-width,initial-scale=1'>"];
    [readyBody appendString:@"<style>body { font-family: Roboto, Helvetica; text-align: center; } "];
    [readyBody appendString:@"h1 { font-size: 55vw; } "];
    [readyBody appendString:@"</style><head><body><div>"];
    [readyBody appendString:@"<h1>:(</h1>"];
    [readyBody appendFormat:@"<code>%@</code>", error.localizedDescription];
    [readyBody appendFormat:@"<p><a href='%@'>%@</a></p>", self.strURL, self.strURL];
    [readyBody appendString:@"</div></body></html>"];
    [self.wkWebView loadHTMLString:readyBody baseURL:nil];
}

- (void)updateButtons {
    self.butForward.enabled = _wkWebView.canGoForward;
    self.butBack.enabled = _wkWebView.canGoBack;
    self.butStop.enabled = _wkWebView.loading;
}

- (IBAction)butBack:(id)sender {
    NSLog(@"butBack");
    [_wkWebView goBack];
}

- (IBAction)butStop:(id)sender {
    NSLog(@"butStop");
    [_wkWebView stopLoading];
}

- (IBAction)butReload:(id)sender {
    NSLog(@"butReload");
    [_wkWebView reload];
}

- (IBAction)butForward:(id)sender {
    NSLog(@"butForward");
    [_wkWebView goForward];
}

@end
