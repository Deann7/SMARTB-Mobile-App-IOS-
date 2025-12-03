import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const ChatbotScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>SMARTB AI Assistant</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          height: 100%;
          width: 100%;
          overflow: hidden;
          background-color: #f5f5f5;
        }
        body {
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        #chatbot-container {
          flex: 1;
          width: 100%;
          height: 80vh;
          position: relative;
        }
      </style>
    </head>
    <body>
      <div id="chatbot-container">
        <script src='https://cdn.jotfor.ms/agent/embedjs/019a39cd4ebf787eb91665b20832550a3ab6/embed.js'></script>
      </div>
      <script>
        // Notify React Native when the chatbot is loaded
        window.addEventListener('load', function() {
          setTimeout(function() {
            window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'loaded' }));
          }, 1000);
        });
        
        // Handle any errors
        window.addEventListener('error', function(e) {
          window.ReactNativeWebView?.postMessage(JSON.stringify({ 
            type: 'error', 
            message: e.message 
          }));
        });
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'loaded') {
        setLoading(false);
        setError(false);
      } else if (data.type === 'error') {
        setError(true);
        setLoading(false);
      }
    } catch (err) {
      console.log('Message parsing error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={handleMessage}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onHttpError={() => {
          setError(true);
          setLoading(false);
        }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          // Fallback if postMessage doesn't work
          setTimeout(() => setLoading(false), 2000);
        }}
        // Allow third-party cookies for JotForm
        thirdPartyCookiesEnabled={true}
        // Enable mixed content for better compatibility
        mixedContentMode="always"
        // Allow file access
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D5A4F" />
          <Text style={styles.loadingText}>Memuat AI Assistant...</Text>
        </View>
      )}
      
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️</Text>
          <Text style={styles.errorMessage}>
            Gagal memuat chatbot.{'\n'}
            Pastikan Anda terhubung ke internet.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2D5A4F',
    fontWeight: '500',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ChatbotScreen;
