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
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.io.File
import java.io.IOException

class CircleView @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) :
        SubsamplingScaleImageView(context, attrs) {
    private var strokeWidth: Int = 0
    private val sCenter = PointF()
    private val vCenter = PointF()
    private val paint = Paint()
    val circlePoints = mutableListOf<PointF>()

    init {
        initialise()
    }

    private fun initialise() {
        val density = resources.displayMetrics.densityDpi.toFloat()
        strokeWidth = (density / 60f).toInt()
    }

    override fun onDraw(canvas: Canvas) {
        println("onDraw, canvas: $canvas")
        super.onDraw(canvas)

        // Don't draw the circle before the image is ready to avoid it moving around during setup.
        if (!isReady) {
            return
        }

        sCenter.set(getSWidth() / 2f, getSHeight() / 2f)
        println("sCenter: $sCenter")
        sourceToViewCoord(sCenter, vCenter)
        val radius = (scale * getSWidth()) * 0.02f

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

    fun removeCirclePoint(sPin: PointF) {
        circlePoints.remove(sPin)
        invalidate() // Trigger a redraw
    }
}

class ExpoPdfViewer(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    val addPin by EventDispatcher()
    val clickPin by EventDispatcher()
    fun updatePins(pins: List<Pin>?) {
        println("updatePins triggered. Pins: $pins")
        val imageView = this.getChildAt(0) as CircleView
        imageView.circlePoints.clear()

        if (pins == null) {
            return
        }
        for (pin in pins) {
            imageView.addCirclePoint(PointF(pin.x.toFloat(), pin.y.toFloat()))
        }
    }

    fun updatePdf(fileSource: String) {
        println("updatePdf triggered. Filesource: $fileSource")
        val filePath = fileSource.replace("file://", "")
        // Clear existing views (e.g., remove old PDF image)
        val totalViews = this.childCount
        println("Total views before removal: $totalViews")
        this.removeAllViews()
        val totalViewsAfter = this.childCount
        println("Total views after removal: $totalViewsAfter")

        // Render new PDF
        val pdfPageBitmap = renderPage(context, filePath, 0)
        println("pdfPageBitmap: $pdfPageBitmap")
        println("pdfPageBitmap.width: ${pdfPageBitmap?.width}")
        pdfPageBitmap?.let {
            // val imageView = ImageView(context).apply {
            //     setImageBitmap(it)
            // }
            val imageView =
                    CircleView(context).apply {
                        resetScaleAndCenter()
                        setImage(ImageSource.cachedBitmap(it))
                    }

        imageView.circlePoints.clear()
            // imageView.invalidate()

            val gestureDetector =
                    GestureDetector(
                            context,
                            object : GestureDetector.SimpleOnGestureListener() {
                                override fun onLongPress(e: MotionEvent) {
                                    super.onLongPress(e)
                                    println("onLongPress triggered")
                                    e?.let { event ->
                                        val sCoord = imageView.viewToSourceCoord(event.x, event.y)
                                        sCoord?.let { coord -> drawOnImage(imageView, coord) }
                                    }
                                }

                                override fun onSingleTapConfirmed(e: MotionEvent): Boolean {
                                    println("onSingleTapConfirmed triggered")
                                    println("imageView circlePoints: ${imageView.circlePoints}")
                                    e?.let { event ->
                                        val sCoord = imageView.viewToSourceCoord(event.x, event.y)
                                        if (sCoord == null) {
                                            return true
                                        }
                                        for (point in imageView.circlePoints) {
                                            val distance =
                                                    Math.sqrt(
                                                            Math.pow(
                                                                    (sCoord.x - point.x).toDouble(),
                                                                    2.0
                                                            ) +
                                                                    Math.pow(
                                                                            (sCoord.y - point.y)
                                                                                    .toDouble(),
                                                                            2.0
                                                                    )
                                                    )
                                            println("distance: $distance")
                                            if (distance < 40) {
                                                Toast.makeText(
                                                                context,
                                                                "Circle clicked",
                                                                Toast.LENGTH_SHORT
                                                        )
                                                        .show()
                                                // imageView.removeCirclePoint(point)
                                                clickPin(
                                                        mapOf(
                                                                "data" to
                                                                        mapOf(
                                                                                "x" to
                                                                                        point.x
                                                                                                .toDouble(),
                                                                                "y" to
                                                                                        point.y
                                                                                                .toDouble()
                                                                        )
                                                        )
                                                )
                                                return true
                                            }
                                        }
                                    }
                                    return true
                                }

                                // override fun onDown(e: MotionEvent): Boolean {
                                //     // super.onDown(e)
                                //     println("onDown triggered")
                                //     return true // Necessary to receive gestures
                                // }
                            }
                    )

            imageView.setOnTouchListener { _, event -> gestureDetector.onTouchEvent(event) }

            println("this.addView, imageView: $imageView")
            this.addView(imageView)
            println("this.addView, this: $this")
            val addViewChildCount = this.childCount
            println("this.addView Total views after addition: $addViewChildCount")
        }
    }

    fun drawOnImage(imageView: CircleView, coord: PointF) {
        addPin(mapOf("data" to mapOf("x" to coord.x.toDouble(), "y" to coord.y.toDouble())))
    }

    private fun renderPage(context: Context, filePath: String, pageIndex: Int): Bitmap? {
        val file = File(filePath)
        val metrics = context.resources.displayMetrics
        val screenWidth = metrics.widthPixels
        val screenHeight = metrics.heightPixels

        return try {
            // Kotlin's use function automatically manages the closing of resources
            ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY).use {
                    fileDescriptor ->
                PdfRenderer(fileDescriptor).use { pdfRenderer ->
                    if (pageIndex < 0 || pageIndex >= pdfRenderer.pageCount) {
                        return@use null
                    }

                    return pdfRenderer.openPage(pageIndex).use { page ->
                        val scale = screenWidth.toFloat() / page.width
                        val scaledHeight = (page.height * scale).toInt()

                        val pdfPageBitmap = Bitmap.createBitmap(screenWidth, scaledHeight, Bitmap.Config.ARGB_8888)
                        page.render(pdfPageBitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)

                        val finalBitmap = Bitmap.createBitmap(screenWidth, screenHeight, Bitmap.Config.ARGB_8888)
                        val canvas = Canvas(finalBitmap)
                        canvas.drawColor(Color.TRANSPARENT)
                        canvas.drawBitmap(pdfPageBitmap, 0f, ((screenHeight - scaledHeight) / 2).toFloat(), null)

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
