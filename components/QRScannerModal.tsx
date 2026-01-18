import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess?: (data: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.cameraContainer}>
          <View style={styles.placeholder}>
            <Icon name="qr-code-outline" size={80} color="#e30613" />
            <Text style={styles.placeholderText}>
              Skaner QR będzie dostępny wkrótce
            </Text>
          </View>
        </View>

        <View style={styles.bottomControlsContainer}>
          <View style={styles.bottomControls}>
            <Text style={styles.instructionText}>
              Funkcja w przygotowaniu
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
});

export default QRScannerModal;
