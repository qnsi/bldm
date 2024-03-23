import ExpoModulesCore
import UIKit
import WebKit

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class ExpoPdfViewer: ExpoView {
    let webView = WKWebView()
    private var label: UILabel!

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
            label = UILabel()
        label.frame = self.bounds // Adjust the frame as needed
        label.text = "Hello World"
        label.textAlignment = .center
        label.autoresizingMask = [.flexibleWidth, .flexibleHeight] // For auto-resizing (optional)
        
        // Add the label to your view
        self.addSubview(label)

    // addSubview(webView)
    //
    // let url =  URL(string:"https://docs.expo.dev/modules/")!
    // let urlRequest = URLRequest(url:url)
    // webView.load(urlRequest)
  }

  override func layoutSubviews() {
    webView.frame = bounds
  }
    // private var label: UILabel!
    //
    // override init(frame: CGRect) {
    //     super.init(frame: frame)
    //     setupLabel()
    // }
    // 
    // required init?(coder: NSCoder) {
    //     super.init(frame: frame)
    //     setupLabel()
    // }
    // 
    // private func setupLabel() {
    //     // Initialize the UILabel
    //     label = UILabel()
    //     label.frame = self.bounds // Adjust the frame as needed
    //     label.text = "Hello World"
    //     label.textAlignment = .center
    //     label.autoresizingMask = [.flexibleWidth, .flexibleHeight] // For auto-resizing (optional)
    //     
    //     // Add the label to your view
    //     self.addSubview(label)
    // }
}

