package expo.modules.pdfviewer

import android.content.Context
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

//temp
import android.webkit.WebView
import android.webkit.WebViewClient

class ExpoPdfViewer(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  internal val webView = WebView(context).also {
    it.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    it.webViewClient = object : WebViewClient() {}
    addView(it)

    it.loadUrl("https://google.com")
  }

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
