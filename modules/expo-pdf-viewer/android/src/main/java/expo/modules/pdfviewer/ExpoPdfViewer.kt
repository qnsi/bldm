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

import com.davemorrissey.labs.subscaleview.ImageSource;
import com.davemorrissey.labs.subscaleview.SubsamplingScaleImageView;



class ExpoPdfViewer(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    fun updatePdf(fileSource: String) {
      println("updatePdf triggered. Filesource: $fileSource")
      val filePath = fileSource.replace("file://", "")
        // Clear existing views (e.g., remove old PDF image)
        this.removeAllViews()

        // Render new PDF
        val pdfPageBitmap = renderPage(context, filePath, 0)
        println("pdfPageBitmap: $pdfPageBitmap")
        pdfPageBitmap?.let {
            // val imageView = ImageView(context).apply {
            //     setImageBitmap(it)
            // }
            val imageView = SubsamplingScaleImageView(context).apply {
                resetScaleAndCenter()
                setImage(ImageSource.cachedBitmap(it))
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
}
