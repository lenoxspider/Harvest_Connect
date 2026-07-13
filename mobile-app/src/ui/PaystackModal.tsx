import React from 'react';
import { Modal, StyleSheet, View, Text, Pressable, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

interface PaystackModalProps {
  visible: boolean;
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

const PUBLIC_KEY = 'pk_test_85d97c366e207833e25f760ce80b69054e3f8867';

export const PaystackModal: React.FC<PaystackModalProps> = ({
  visible,
  amount,
  email,
  onSuccess,
  onCancel,
}) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://js.paystack.co/v1/inline.js"></script>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #ffffff;
        }
        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3ecf8e;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="loader" id="loader"></div>
      <script>
        window.onload = function() {
          var handler = PaystackPop.setup({
            key: '${PUBLIC_KEY}',
            email: '${email}',
            amount: ${Math.round(amount * 100)},
            currency: 'GHS',
            callback: function(response) {
              var msg = { status: 'success', reference: response.reference };
              window.ReactNativeWebView.postMessage(JSON.stringify(msg));
            },
            onClose: function() {
              var msg = { status: 'cancelled' };
              window.ReactNativeWebView.postMessage(JSON.stringify(msg));
            }
          });
          handler.openIframe();
          document.getElementById('loader').style.display = 'none';
        };
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.status === 'success') {
        onSuccess(data.reference);
      } else {
        onCancel();
      }
    } catch {
      onCancel();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.closeBtn} onPress={onCancel}>
            <Text style={styles.closeBtnText}>← Cancel Payment</Text>
          </Pressable>
          <Text style={styles.title}>Secure Checkout</Text>
          <View style={{ width: 80 }} />
        </View>
        <WebView
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeBtn: {
    paddingVertical: 6,
  },
  closeBtnText: {
    color: '#E65100',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333333',
  },
});
