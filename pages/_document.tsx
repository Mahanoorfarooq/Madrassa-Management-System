import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ur" dir="rtl">
        <Head>
          <meta charSet="utf-8" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600&display=swap"
          />
          {/* PWA: Manifest and Meta */}
          <link rel="manifest" href="/manifest.webmanifest" />
          <meta name="application-name" content="جامعہ مینجمنٹ سسٹم" />
          <meta name="theme-color" content="#f16700" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="apple-mobile-web-app-title" content="جامعہ" />
          <link rel="apple-touch-icon" href="/logo.png" />
          <link rel="icon" href="/logo.png" />
        </Head>
        <body className="font-urdu bg-lightBg">
          <title>جامعہ مینجمنٹ سسٹم</title>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
