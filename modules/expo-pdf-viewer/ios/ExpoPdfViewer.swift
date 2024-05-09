import ExpoModulesCore
import UIKit
import PDFKit

// class CustomPDFView: PDFView {
//     override func addGestureRecognizer(_ gestureRecognizer: UIGestureRecognizer) {
//         if gestureRecognizer is UILongPressGestureRecognizer {
//             // Prevent adding the default long press gesture recognizer
//             // Optionally, you can also tweak the recognizer's properties here if you don't want to completely disable it
//             gestureRecognizer.isEnabled = false
//         }
//         super.addGestureRecognizer(gestureRecognizer)
//     }
// }

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class ExpoPdfViewer: ExpoView, UIGestureRecognizerDelegate {
    private var label: UILabel!
    private var fileUrlString: String = ""
    private var pdfView = PDFView()
    private var statePins: [CGPoint] = []
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

    // Add a long press gesture recognizer to the PDFView
    // print("Adding long press gesture recognizer")
    //     let longPressRecognizer = UILongPressGestureRecognizer(target: self, action: #selector(handleLongPress(_:)))
    //     pdfView.addGestureRecognizer(longPressRecognizer)

    // clipsToBounds = true
    //         label = UILabel()
    //     label.frame = self.bounds // Adjust the frame as needed
    //     label.text = "Hello World"
    //     label.textAlignment = .center
    //     label.autoresizingMask = [.flexibleWidth, .flexibleHeight] // For auto-resizing (optional)
    //     
    //     // Add the label to your view
    //     self.addSubview(label)
  }

  @objc func handleLongPress(_ gestureRecognizer: UILongPressGestureRecognizer) {
        print("handleLongPress triggered")
        if gestureRecognizer.state == .began {
            let location = gestureRecognizer.location(in: gestureRecognizer.view)
            guard let page = pdfView.page(for: location, nearest: true) else { return }
            let locationOnPage = pdfView.convert(location, to: page)
            self.onAddPin(["data": ["x": locationOnPage.x, "y": locationOnPage.y]])
            // addAnnotation(at: location)
         }
    }
    
    @objc func handleSingleTap(_ gestureRecognizer: UITapGestureRecognizer) {
        print("handleSingleTap triggered")
        if gestureRecognizer.state == .ended {
            let locationInView = gestureRecognizer.location(in: gestureRecognizer.view)
            
            // Convert the view coordinates into page coordinates
            if let page = pdfView.page(for: locationInView, nearest: true) {
            let locationInPage = pdfView.convert(locationInView, to: page)
                
                for pin in statePins {
                    print("pin.x", pin.x)
                    print("pin.y", pin.y)
                    let distance = sqrt(
                        pow(Double(locationInPage.x - pin.x), 2.0) +
                        pow(Double(locationInPage.y - pin.y), 2.0)
                    )
                    print("distance: ", distance)
                    if distance < 40 {
                        print("Triggering onClickPin")
                        print("typeof(onClickPin)", type(of: self.onClickPin))
                        self.onClickPin(["data": ["x": pin.x, "y": pin.y]])
                    }
                }
                
                
                // Here, you can handle the tap as needed
                print("Single tap at page coordinates: \(locationInPage)")
                // Example: Add annotation or perform other actions
            }
        }
    }
    
    func updateLabelText(with text: String) {
        //       label.text = text
    }

    func updatePins(with pins: [CGPoint]) {
        // Clean previous circles
        self.statePins = pins
        if (pdfView.document != nil) {
            guard let pdfPage = pdfView.currentPage else { return }
            pdfPage.annotations.forEach { pdfPage.removeAnnotation($0) }
            print("updatePins triggered")
            print("Pins: \(pins)")
            for pin in pins {
                let circleBounds = CGRect(x: pin.x-10, y: pin.y-10, width: 20, height: 20)
                let circleAnnotation = PDFAnnotation(bounds: circleBounds, forType: .circle, withProperties: nil)
                
                circleAnnotation.color = .red
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

