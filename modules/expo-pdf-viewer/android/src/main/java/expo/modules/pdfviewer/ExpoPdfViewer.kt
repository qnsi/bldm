package expo.modules.pdfviewer

import android.content.Context
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

//  PDF
import android.graphics.Bitmap;
import android.graphics.pdf.PdfRenderer;
import android.os.ParcelFileDescriptor;
import android.widget.ImageView

import java.io.File;
import java.io.IOException;

//WEBVIEW

import android.webkit.WebView
import android.webkit.WebViewClient



class ExpoPdfViewer(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  // init {
  // val webView = WebView(context).also {
  //   it.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
  //   it.webViewClient = object : WebViewClient() {}
  //   addView(it)
  //   it.loadUrl("https://docs.expo.dev/modules/")
  //   }

        // val pdfFilePath = "/data/user/0/com.arturkesik.buildme/files/file.pdf" // Update this path as needed
        // val pdfPageBitmap = renderPage(context, pdfFilePath, 0)
        // println("pdfPageBitmap: $pdfPageBitmap")
        //
        // pdfPageBitmap?.let {
        //     val imageView = ImageView(context).apply {
        //         setImageBitmap(it)
        //     }
        //     // Assuming `this@ExpoPdfViewer` can accept children views.
        //     this.addView(imageView)
        // }
    // }

    fun updatePdf(fileSource: String) {
      println("updatePdf triggered. Filesource: $fileSource")
      val filePath = fileSource.replace("file://", "")
        // Clear existing views (e.g., remove old PDF image)
        this.removeAllViews()

        // Render new PDF
        val pdfPageBitmap = renderPage(context, filePath, 0)
        println("pdfPageBitmap: $pdfPageBitmap")
        pdfPageBitmap?.let {
            val imageView = ImageView(context).apply {
                setImageBitmap(it)
            }
            this.addView(imageView)
        }
    }

    private fun renderPage(context: Context, filePath: String, pageIndex: Int): Bitmap? {
        val file = File(filePath)
        try {
            // Kotlin's use function automatically manages the closing of resources
            ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY).use { fileDescriptor ->
                PdfRenderer(fileDescriptor).use { pdfRenderer ->
                    if (pageIndex < 0 || pageIndex >= pdfRenderer.pageCount) {
                        // Return null if the page index is invalid
                        return null
                    }

                    val page = pdfRenderer.openPage(pageIndex)
                    page.use {
                        // Create a bitmap where the PDF page will be rendered
                        val bitmap = Bitmap.createBitmap(page.width, page.height, Bitmap.Config.ARGB_8888)
                        // Render the page into the bitmap
                        page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                        return bitmap
                    }
                }
            }
        } catch (e: IOException) {
            e.printStackTrace()
            return null
        }
    }
  // internal val imageView = ImageView(context).apply {
  //   val pdfFilePath = "path_to_your_pdf_file"
  //   val pdfPageBitmap = PdfRendererHelper.renderPage(context, pdfFilePath, 0)
  //
  //   if (pdfPageBitmap != null) {
  //     this.setImageBitmap(pdfPageBitmap)
  //       // Assuming `this@ExpoPdfViewer` is a ViewGroup like LinearLayout where you can add views
  //     this@ExpoPdfViewer.addView(this)
  //   }
  // }
  //
  // fun renderPage(context: Context, filePath: String, pageIndex: Int): Bitmap? {
  //   val file = File(filePath)
  //     // Kotlin's use function automatically manages the closing of resources similar to Java's try-with-resources
  //     ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY).use { fileDescriptor ->
  //       PdfRenderer(fileDescriptor).use { pdfRenderer ->
  //         if (pageIndex < 0 || pageIndex >= pdfRenderer.pageCount) {
  //           // In Kotlin, null is explicitly returned if needed
  //           return null
  //         }
  //
  //         val page = pdfRenderer.openPage(pageIndex)
  //           // In Kotlin, use try with resources through the use function for auto-closable resources
  //           page.use {
  //             // Directly create a bitmap of the right size
  //             val bitmap = Bitmap.createBitmap(page.width, page.height, Bitmap.Config.ARGB_8888)
  //               // Render the page into the bitmap
  //               page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
  //               return bitmap
  //           }
  //       }
  //     }
  //   // Catch blocks are outside of the use blocks but can still prevent resource leaks
  // } catch (e: IOException) {
  //   e.printStackTrace()
  //     return null
  // }
}

// package expo.modules.webview
//
// import android.content.Context
// import android.webkit.WebView
// import android.webkit.WebViewClient
// import expo.modules.kotlin.AppContext
// import expo.modules.kotlin.views.ExpoView
//
// class ExpoWebView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
//   internal val webView = WebView(context).also {
//     it.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
//     it.webViewClient = object : WebViewClient() {}
//     addView(it)
//
//     it.loadUrl("https://docs.expo.dev/modules/")
//   }
// }
