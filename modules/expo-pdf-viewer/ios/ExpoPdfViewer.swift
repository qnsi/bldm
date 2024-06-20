import ExpoModulesCore
import UIKit
import PDFKit

class MyPDFView: PDFView, UIEditMenuInteractionDelegate {
    private var customMenu: UIMenu?
    private var interaction: UIEditMenuInteraction?
    private var canShowMenu = true
    
    private var configuration: UIEditMenuConfiguration? {
        if let selection = currentSelection,
           let currentPage = currentPage {
            let bounds = selection.bounds(for: currentPage)
            let point = convert(CGPoint(x: bounds.midX, y: bounds.maxY), from: currentPage)
            let configuration = UIEditMenuConfiguration(identifier: "MSMenu", sourcePoint: point)
            return configuration
        }
        return nil
    }
    
    init() {
        super.init(frame: .zero)
        autoScales = true
        setValue(true, forKey: "forcesTopAlignment")
        let interaction = UIEditMenuInteraction(delegate: self)
        self.interaction = interaction
        addInteraction(interaction)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func buildMenu(with builder: UIMenuBuilder) {
        if canShowMenu, let configuration = self.configuration {
            canShowMenu = false
            customMenu = builder.menu(for: .standardEdit)
            DispatchQueue.main.async { [weak self] in
                self?.showMenu(for: configuration)
            }
        }
    }
    
    private func showMenu(for configuration: UIEditMenuConfiguration) {
        interaction?.presentEditMenu(with: configuration)
        canShowMenu = true
    }
    
    func editMenuInteraction(_ interaction: UIEditMenuInteraction, menuFor configuration: UIEditMenuConfiguration, suggestedActions: [UIMenuElement]) -> UIMenu? {
        customMenu
    }
    // oLD
    override func canPerformAction(_ action: Selector, withSender sender: Any?) -> Bool {
        self.currentSelection = nil
        self.clearSelection()

        return false
    }

    func modAddGestureRecognizer(_ gestureRecognizer: UIGestureRecognizer) {
        super.addGestureRecognizer(gestureRecognizer)
    }

    override func addGestureRecognizer(_ gestureRecognizer: UIGestureRecognizer) {
        if gestureRecognizer is UILongPressGestureRecognizer {
            gestureRecognizer.isEnabled = false
        }

        super.addGestureRecognizer(gestureRecognizer)
    }

    func allSubViewsOf<T: UIView>(type: T.Type) -> [T] {
        var all: [T] = []
        func getSubview(view: UIView) {
            if let aView = view as? T {
                all.append(aView)
            }
            guard view.subviews.count > 0 else { return }
            view.subviews.forEach{ getSubview(view: $0) }
        }
        getSubview(view: self)
        return all
    }

}


// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class ExpoPdfViewer: ExpoView, UIGestureRecognizerDelegate {
    private var label: UILabel!
    private var fileUrlString: String = ""
    private var pdfView = MyPDFView()
    var statePins: [Pin] = []
    private var renderedPageWidth: CGFloat = 0
    private var renderedPageHeight: CGFloat = 0
    let onAddPin = EventDispatcher()
    let onClickPin = EventDispatcher()

    func recursivelyDisableSelection(view: UIView) {
        
        // Get all recognizers for the PDFView's subviews. Here we are ignoring the recognizers for the PDFView itself, since we know from testing that not the reason for the mess.
        for rec in view.subviews.compactMap({$0.gestureRecognizers}).flatMap({$0}) {
            // UITapAndAHalfRecognizer is for a gesture like "tap first, then tap again and drag", this gesture also enable's text selection
            if rec is UILongPressGestureRecognizer || type(of: rec).description() == "UITapAndAHalfRecognizer" {
                rec.isEnabled = false
            }
        }
        
        // For all subviews, if they do have subview in itself, disable the above 2 gestures as well.
        for view in view.subviews {
            if !view.subviews.isEmpty {
                recursivelyDisableSelection(view: view)
            }
        }
    }

    func distanceBetween(_ pin1: Pin, _ pin2: Pin) -> CGFloat {
        let dx = pin1.x - pin2.x
        let dy = pin1.y - pin2.y
        return sqrt(dx * dx + dy * dy)
    }

    func distanceBetweenPoints(_ point1: CGPoint, _ point2: CGPoint) -> CGFloat {
        let dx = point1.x - point2.x
            let dy = point1.y - point2.y
            return sqrt(dx * dx + dy * dy)
    }

    func clusterPins(pins: [Pin], maxDistance: CGFloat) -> [[Pin]] {
        var clusters: [[Pin]] = []
            var visited = Set<NSNumber>()

            for pin in pins {
                if !visited.contains(pin.id) {
                    var cluster: [Pin] = []
                        var queue: [Pin] = [pin]
                        visited.insert(pin.id)

                        while !queue.isEmpty {
                            let current = queue.removeFirst()
                                cluster.append(current)

                                for otherPin in pins {
                                    if !visited.contains(otherPin.id) && distanceBetween(current, otherPin) < maxDistance {
                                        queue.append(otherPin)
                                            visited.insert(otherPin.id)
                                    }
                                }
                        }
                    clusters.append(cluster)
                }
            }
        return clusters
    }

    func calculateCentroid(of cluster: [Pin]) -> CGPoint {
        var sumX: CGFloat = 0
        var sumY: CGFloat = 0
        
        for pin in cluster {
            sumX += pin.x
            sumY += pin.y
        }
        
        let count = CGFloat(cluster.count)
        return CGPoint(x: sumX / count, y: sumY / count)
    }

    func findCenterMostPin(of cluster: [Pin]) -> Pin? {
        guard !cluster.isEmpty else { return nil }

        let centroid = calculateCentroid(of: cluster)
            var centerMostPin = cluster[0]
            var minimumDistance = distanceBetweenPoints(CGPoint(x: centerMostPin.x, y: centerMostPin.y), centroid)

            for pin in cluster {
                let pinPoint = CGPoint(x: pin.x, y: pin.y)
                    let distance = distanceBetweenPoints(pinPoint, centroid)
                    if distance < minimumDistance {
                        centerMostPin = pin
                            minimumDistance = distance
                    }
            }

        return centerMostPin
    }


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

    // clean Text Selection
    // let allSubviews = pdfView.allSubViewsOf(type: UIView.self)
    // for gestureRec in allSubviews.compactMap({ $0.gestureRecognizers }).flatMap({ $0 }) {
    //     if gestureRec is UILongPressGestureRecognizer {
    //         gestureRec.isEnabled = false
    //     }
    // }

    print("fileUrlString")
    print(fileUrlString)
    if let url = URL(string: fileUrlString) {
        print("Got url")
        print(url)
        if let document = PDFDocument(url: url) {
            print("Got document")
            print(document)
            pdfView.document = document
            recursivelyDisableSelection(view: pdfView)
            NotificationCenter.default.addObserver(self, selector: #selector(pageChanged), name: .PDFViewVisiblePagesChanged, object: nil)
        }
    }
  }

  @objc func pageChanged() {
    recursivelyDisableSelection(view: pdfView)
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
            var clickedPins: [Pin] = []
                
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
                    if distance < 20 {
                        print("Triggering onClickPin")
                        print("typeof(onClickPin)", type(of: self.onClickPin))
                        clickedPins.append(pin)
                        // self.onClickPin(["data": ["x": pin.x, "y": pin.y]])
                    }
                }
                
                
                // Here, you can handle the tap as needed
                print("Single tap at page coordinates: \(locationOnPage)")
                // Example: Add annotation or perform other actions
                let mappedClickedPins = clickedPins.map { ["x": $0.x, "y": $0.y] }
                self.onClickPin(["data": mappedClickedPins])
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
            let clusters = clusterPins(pins: pins, maxDistance: 20)
            print("clusters: length")
            print(clusters.count)

            for cluster in clusters {
                if cluster.count > 1 {
                    let centralPin = findCenterMostPin(of: cluster)
                    guard let centralPin = centralPin else { return }

                    print("centralPin x , y ")
                    print(centralPin.x, centralPin.y)
                    print("cluster.count")
                    print(cluster.count)
                    let originalX = (centralPin.x / 1000) * renderedPageWidth
                    let originalY = renderedPageHeight - ((centralPin.y / 1000) * renderedPageHeight)
                    let textBounds = CGRect(x: originalX-6, y: originalY-7, width: 20, height: 20)
                    let textAnnotation = PDFAnnotation(bounds: textBounds, forType: .freeText, withProperties: nil)
                    textAnnotation.contents = String(cluster.count)
                    textAnnotation.font = UIFont.boldSystemFont(ofSize: 16)
                    textAnnotation.color = .clear
                    textAnnotation.interiorColor = .clear
                    textAnnotation.fontColor = .black

                    // Add the annotation to the PDF page
                    pdfPage.addAnnotation(textAnnotation)
                }
                
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
            pdfView.modAddGestureRecognizer(longPressRecognizer)
            
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

