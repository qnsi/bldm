import ExpoModulesCore

struct Pin {
    var x: Double
    var y: Double
}


public class ExpoPdfViewerModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ExpoPdfViewer')` in JavaScript.
    Name("ExpoPdfViewer")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants([
      "PI": Double.pi
    ])

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(ExpoPdfViewer.self) {
      Events("onAddPin", "onClickPin")
      // Defines a setter for the `name` prop.
      Prop("name") { (view: ExpoPdfViewer, prop: String) in
        view.updateLabelText(with: prop)
      }
      Prop("fileSource") { (view: ExpoPdfViewer, prop: String) in
        print("Updating file source: " + prop)
        view.updateFileSource(with: prop)
      }
      Prop("pins") { (view: ExpoPdfViewer, pins: [CGPoint]) in
        let pinDescriptions = pins.map { pin in
          return "(\(pin.x), \(pin.y))"
        }.joined(separator: ", ")
        print("pins prop changed: [\(pinDescriptions)]")
        view.updatePins(with: pins)
      }
    }
    //     // Now trigger the PDF update in the view
    //
    //     // val array = pins as? ReadableArray ?: null
    //     // println("convert: array: $array")
    //     val list = mutableListOf<Pin>()
    //
    //     for (pin in pins) {
    //       println("pin: pin: $pin")
    //       val item = pin as? Map<String, Number> // Safe cast to Map
    //       if (item != null) {
    //         val x = item["x"]
    //         val y = item["y"]
    //         if (x != null && y != null) {
    //           list.add(Pin(x, y))
    //           println("Pin coordinates: x = ${x.toDouble()}, y = ${y.toDouble()}")
    //           // Perform your operations with x and y here
    //         }
    //       }
    //     }
    //     val convertedPins = list
    //
    //     println("is convert safjdk ")
    //     println("convertedPins : $convertedPins")
    //     view.updatePins(list)
    //   }
    //   Events("addPin", "clickPin")
    // }
  }
}
