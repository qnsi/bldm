package expo.modules.pdfviewer

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

data class Pin(val x: Number, val y: Number)

class ExpoPdfViewerModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a
    // string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for
    // clarity.
    // The module will be accessible from `requireNativeModule('ExpoPdfViewer')` in JavaScript.
    Name("ExpoPdfViewer")

    // Defines event names that the module can send to JavaScript.
    // Events("addPin", "removePin")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    // Function("addPin") { pin: Point -> this@ExpoPdfViewerModule.sendEvent("addPin", pin) }

    // Enables the module to be used as a native view. Definition components that are accepted as
    // part of
    // the view definition: Prop, Events.
    View(ExpoPdfViewer::class) {
      // Defines a setter for the `name` prop.
      Prop("name") { view: ExpoPdfViewer, prop: String ->
        println("Android native module should work")
      }
      Prop("fileSource") { view: ExpoPdfViewer, fileSource: String ->
        println("fileSource prop changed: $fileSource")
        // Now trigger the PDF update in the view
        view.updatePdf(fileSource)
      }
      Prop("pins") { view: ExpoPdfViewer, pins: List<Any> ->
        println("pins prop changed: $pins")
        // Now trigger the PDF update in the view

        // val array = pins as? ReadableArray ?: null
        // println("convert: array: $array")
        val list = mutableListOf<Pin>()

        for (pin in pins) {
          println("pin: pin: $pin")
          val item = pin as? Map<String, Number> // Safe cast to Map
          if (item != null) {
            val x = item["x"]
            val y = item["y"]
            if (x != null && y != null) {
              list.add(Pin(x, y))
              println("Pin coordinates: x = ${x.toDouble()}, y = ${y.toDouble()}")
              // Perform your operations with x and y here
            }
          }
        }
        val convertedPins = list

        println("is convert safjdk ")
        println("convertedPins : $convertedPins")
        view.updatePins(list)
      }
      Events("onAddPin", "onClickPin")
    }
  }
}
