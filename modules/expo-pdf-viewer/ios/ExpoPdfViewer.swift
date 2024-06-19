import ExpoModulesCore
import UIKit
import PDFKit


// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class ExpoPdfViewer: ExpoView, UIGestureRecognizerDelegate {
    private var label: UILabel!
    private var fileUrlString: String = ""
    private var pdfView = PDFView()
    var statePins: [Pin] = []
    private var renderedPageWidth: CGFloat = 0
    private var renderedPageHeight: CGFloat = 0
    let onAddPin = EventDispatcher()
    let onClickPin = EventDispatcher()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    pdfView.translatesAutoresizingMaskIntoConstraints = false
    self.addSubview(pdfView)



// Constraints for the pdfView to fill the entire view
    pdfView.leadingAnchor.constraint(equalTo: self.safeAreaLayoutGuide.leadingAnchor).isActive = true
    pdfView.trailingAnchor.constraint(equalTo: self.safeAreaLayoutGuide.trailingAnchor).isActive = true
    pdfView.topAnchor.constraint(equalTo: self.safeAreaLayoutGuide.topAnchor).isActive = true
    pdfView.bottomAnchor.constraint(equalTo: self.safeAreaLayoutGuide.bottomAnchor).isActive = true

    // allow bigger zoom
    pdfView.maxScaleFactor = 10.0;

    print("fileUrlString")
    print(fileUrlString)
    if let url = URL(string: fileUrlString) {
        print("Got url")
        print(url)
        if let document = PDFDocument(url: url) {
            print("Got document")
            print(document)
            pdfView.document = document
        }
    }
  }

  @objc func handleLongPress(_ gestureRecognizer: UILongPressGestureRecognizer) {
        print("handleLongPress triggered")
        if gestureRecognizer.state == .began {
            let location = gestureRecognizer.location(in: gestureRecognizer.view)
            guard let page = pdfView.page(for: location, nearest: true) else { return }
            // let mappedX = (location.x / pdfView.frame.width) * 1000
            // let mappedY = (location.y / pdfView.frame.height) * 1000
            print("long pressed on : renderedPageHeight: ", renderedPageHeight)
            print("long pressed on : renderedPageWidth: ", renderedPageWidth)
            let locationOnPage = pdfView.convert(location, to: page)
            let mappedX = (locationOnPage.x / renderedPageWidth) * 1000
            let mappedY = 1000 - ((locationOnPage.y / renderedPageHeight) * 1000)
            print("long pressed on : x: ", locationOnPage.x, " y: ", locationOnPage.y)
            print("long pressed on : mappedX: ", mappedX)
            print("long pressed on : mappedY: ", mappedY)
            self.onAddPin(["data": ["x": mappedX, "y": mappedY]])
            // addAnnotation(at: location)
         }
    }
    
    @objc func handleSingleTap(_ gestureRecognizer: UITapGestureRecognizer) {
        print("handleSingleTap triggered")
        if gestureRecognizer.state == .ended {
            let locationInView = gestureRecognizer.location(in: gestureRecognizer.view)
            
            // Convert the view coordinates into page coordinates
            if let page = pdfView.page(for: locationInView, nearest: true) {
            let locationOnPage = pdfView.convert(locationInView, to: page)
            let mappedX = (locationOnPage.x / renderedPageWidth) * 1000
            let mappedY = 1000 - ((locationOnPage.y / renderedPageHeight) * 1000)
                
                for pin in statePins {
                    if pin.id == 0 {
                        continue
                    }
                    print("pin.x", pin.x)
                    print("pin.y", pin.y)
                    let distance = sqrt(
                        pow(Double(mappedX - pin.x), 2.0) +
                        pow(Double(mappedY - pin.y), 2.0)
                    )
                    print("distance: ", distance)
                    if distance < 40 {
                        print("Triggering onClickPin")
                        print("typeof(onClickPin)", type(of: self.onClickPin))
                        self.onClickPin(["data": ["x": pin.x, "y": pin.y]])
                    }
                }
                
                
                // Here, you can handle the tap as needed
                print("Single tap at page coordinates: \(locationOnPage)")
                // Example: Add annotation or perform other actions
            }
        }
    }
    
    func updateLabelText(with text: String) {
        //       label.text = text
    }

    func updatePins(with pins: [Pin]) {
        // Clean previous circles
        if (pdfView.document != nil) {
            guard let pdfPage = pdfView.currentPage else { return }
            pdfPage.annotations.forEach { pdfPage.removeAnnotation($0) }
            print("updatePins triggered")
            print("Pins: \(pins)")
            for pin in pins {

                let originalX = (pin.x / 1000) * renderedPageWidth
                let originalY = renderedPageHeight - ((pin.y / 1000) * renderedPageHeight)

                let circleBounds = CGRect(x: originalX-10, y: originalY-10, width: 20, height: 20)
                let circleAnnotation = PDFAnnotation(bounds: circleBounds, forType: .circle, withProperties: nil)


                var layerColor: UIColor
                var opacity: CGFloat = 1
                if (pin.isDone) {
                    opacity = 0.5
                }
                switch pin.layer_id {
                    case 0:
                        layerColor = hexStringToUIColor(hex: "#ff5f5b")
                    case 1:
                        layerColor = hexStringToUIColor(hex: "#ffa13d")
                    case 2:
                        layerColor = hexStringToUIColor(hex: "#ffdd4f")
                    case 3:
                        layerColor = hexStringToUIColor(hex: "#aff026")
                    case 4:
                        layerColor = hexStringToUIColor(hex: "#3effd2")
                    case 5:
                        layerColor = hexStringToUIColor(hex: "#738dfd")
                    case 6:
                        layerColor = hexStringToUIColor(hex: "#414dfd")
                    case 7:
                        layerColor = hexStringToUIColor(hex: "#953cb9")
                    case 8:
                        layerColor = hexStringToUIColor(hex: "#a92c7a")
                    case 9:
                        layerColor = hexStringToUIColor(hex: "#dbdbdb")
                    default: 
                        layerColor = hexStringToUIColor(hex: "#dbdbdb")
                }

                layerColor = layerColor.withAlphaComponent(opacity)
                
                circleAnnotation.color = layerColor
                circleAnnotation.interiorColor = layerColor
                circleAnnotation.border = PDFBorder()
                circleAnnotation.border?.lineWidth = 2
                
                pdfPage.addAnnotation(circleAnnotation)
            }
        }
    }
  func updateFileSource(with text: String) {
      print("updateFileSource triggered")
        fileUrlString = text
        guard let url = URL(string: text) else {
            print("Invalid URL string.")
            return
        }
        if let document = PDFDocument(url: url) {
            print("Setting document correctly")
            pdfView.document = document

            if let page = pdfView.document?.page(at: 0) {
                // renderedPageWidth = page.bounds(for: pdfView.displayBox).width
                // renderedPageHeight = page.bounds(for: pdfView.displayBox).height
                let pageBounds = page.bounds(for: pdfView.displayBox)
                    renderedPageWidth = pageBounds.width
                    renderedPageHeight = pageBounds.height            

                renderedPageWidth = page.bounds(for: .mediaBox).width
                renderedPageHeight = page.bounds(for: .mediaBox).height
            }

            print("Adding long press gesture recognizer")
            let longPressRecognizer = UILongPressGestureRecognizer(target: self, action: #selector(handleLongPress(_:)))
            longPressRecognizer.delegate = self
            pdfView.addGestureRecognizer(longPressRecognizer)
            
            print("Adding singleTap gesture recognizer")
            let tapRecognizer = UITapGestureRecognizer(target: self, action: #selector(handleSingleTap(_:)))
            tapRecognizer.delegate = self
            pdfView.addGestureRecognizer(tapRecognizer)

            print("Testing addPin event dispatching")
            print("Testing addPin Event dispatchered finished")

            updatePins(with: statePins)

        } else {
            print("Could not load document.")
        }
    }

    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        return true // Allow your custom recognizer to work simultaneously with others
    }

  // override func layoutSubviews() {
  //       super.layoutSubviews()
  //       label.frame = bounds
  //   }
    }

    func hexStringToUIColor (hex:String) -> UIColor {
    var cString:String = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()

    if (cString.hasPrefix("#")) {
        cString.remove(at: cString.startIndex)
    }

    if ((cString.count) != 6) {
        return UIColor.gray
    }

    var rgbValue:UInt64 = 0
    Scanner(string: cString).scanHexInt64(&rgbValue)

    return UIColor(
        red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
        green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
        blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
        alpha: CGFloat(1.0)
    )
}

