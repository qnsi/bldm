package expo.modules.pdfviewer

//  PDF
// WEBVIEW
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.PointF
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import android.util.AttributeSet
import android.view.GestureDetector
import android.view.MotionEvent
import android.widget.Toast
import com.davemorrissey.labs.subscaleview.ImageSource
import com.davemorrissey.labs.subscaleview.SubsamplingScaleImageView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import java.io.File
import java.io.IOException

class CircleView @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) :
        SubsamplingScaleImageView(context, attrs) {
    private var strokeWidth: Int = 0
    private val sCenter = PointF()
    private val vCenter = PointF()
    private val paint = Paint()
    private val circlePoints = mutableListOf<PointF>()

    init {
        initialise()
    }

    private fun initialise() {
        val density = resources.displayMetrics.densityDpi.toFloat()
        strokeWidth = (density / 60f).toInt()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        // Don't draw the circle before the image is ready to avoid it moving around during setup.
        if (!isReady) {
            return
        }

        sCenter.set(getSWidth() / 2f, getSHeight() / 2f)
        sourceToViewCoord(sCenter, vCenter)
        val radius = (scale * getSWidth()) * 0.025f

        // paint.apply {
        //     isAntiAlias = true
        //     style = Paint.Style.STROKE
        //     strokeCap = Paint.Cap.ROUND
        //     strokeWidth = this@CircleView.strokeWidth * 2f
        //     color = android.graphics.Color.BLACK
        // }
        // canvas.drawCircle(vCenter.x, vCenter.y, radius, paint)

        for (point in circlePoints) {
            val viewCoord = sourceToViewCoord(point) ?: continue
            paint.strokeWidth = strokeWidth.toFloat()
            paint.color = android.graphics.Color.argb(255, 51, 181, 229)
            canvas.drawCircle(viewCoord.x, viewCoord.y, radius, paint)
        }
    }

    fun addCirclePoint(sPin: PointF) {
        circlePoints.add(sPin)
        invalidate() // Trigger a redraw
    }
}

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
            val imageView =
                    CircleView(context).apply {
                        resetScaleAndCenter()
                        setImage(ImageSource.cachedBitmap(it))
                    }

            val gestureDetector =
                    GestureDetector(
                            context,
                            object : GestureDetector.SimpleOnGestureListener() {
                                override fun onLongPress(e: MotionEvent) {
                                    super.onLongPress(e)
                                    Toast.makeText(context, "Long press", Toast.LENGTH_SHORT).show()
                                    println("onLongPress triggered")
                                    e?.let { event ->
                                        val sCoord = imageView.viewToSourceCoord(event.x, event.y)
                                        println("sCoord: $sCoord")
                                        sCoord?.let { coord -> drawOnImage(imageView, coord) }
                                    }
                                }

                                // override fun onDown(e: MotionEvent): Boolean {
                                //     // super.onDown(e)
                                //     println("onDown triggered")
                                //     return true // Necessary to receive gestures
                                // }
                            }
                    )

            imageView.setOnTouchListener { _, event -> gestureDetector.onTouchEvent(event) }

            this.addView(imageView)
        }
    }

    fun drawOnImage(imageView: CircleView, coord: PointF) {
        imageView.addCirclePoint(coord)
    }

    private fun renderPage(context: Context, filePath: String, pageIndex: Int): Bitmap? {
        val file = File(filePath)
        val metrics = context.resources.displayMetrics
        val screenWidth = metrics.widthPixels
        val screenHeight = metrics.heightPixels

        try {
            // Kotlin's use function automatically manages the closing of resources
            ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY).use {
                    fileDescriptor ->
                PdfRenderer(fileDescriptor).use { pdfRenderer ->
                    if (pageIndex < 0 || pageIndex >= pdfRenderer.pageCount) {
                        // Return null if the page index is invalid
                        return null
                    }

                    val page = pdfRenderer.openPage(pageIndex)
                    page.use {
                        val scale = screenWidth.toFloat() / page.width
                        val scaledHeight = (page.height * scale).toInt()

                        // Render the PDF page bitmap
                        val pdfPageBitmap =
                                Bitmap.createBitmap(
                                        screenWidth,
                                        scaledHeight,
                                        Bitmap.Config.ARGB_8888
                                )
                        page.render(
                                pdfPageBitmap,
                                null,
                                null,
                                PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY
                        )

                        // Calculate the positions for the PDF bitmap in the final bitmap
                        val topPadding = (screenHeight - scaledHeight) / 2
                        val bottomPadding = screenHeight - scaledHeight - topPadding

                        // Create the final bitmap with transparent background
                        val finalBitmap =
                                Bitmap.createBitmap(
                                        screenWidth,
                                        screenHeight,
                                        Bitmap.Config.ARGB_8888
                                )

                        // Draw the PDF page bitmap onto the final bitmap
                        val canvas = Canvas(finalBitmap)
                        canvas.drawColor(Color.TRANSPARENT) // Ensure background is transparent
                        canvas.drawBitmap(pdfPageBitmap, 0f, topPadding.toFloat(), null)

                        return finalBitmap // This is your final bitmap with transparent padding
                    }
                }
            }
        } catch (e: IOException) {
            e.printStackTrace()
            return null
        }
    }
}
