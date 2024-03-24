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
            addAnnotation(at: location)
        }
    }
    
    func addAnnotation(at point: CGPoint) {
        print("addAnnotation triggered")
        guard let page = pdfView.page(for: point, nearest: true) else { return }
        let locationOnPage = pdfView.convert(point, to: page)

        // Example: Adding a text annotation. You can customize this part as needed.
        let annotation = PDFAnnotation(bounds: CGRect(x: locationOnPage.x, y: locationOnPage.y, width: 200, height: 50), forType: .text, withProperties: nil)
        annotation.contents = "Your annotation text here"
        page.addAnnotation(annotation)
    }

  func updateLabelText(with text: String) {
  //       label.text = text
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

            print(pdfView.gestureRecognizers)

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

