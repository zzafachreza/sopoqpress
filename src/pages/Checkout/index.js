import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {colors, fonts} from '../../utils';
import {MyButton, MyHeader, MyInput, MyRadio} from '../../components';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import {apiURL, getData, webURL} from '../../utils/localStorage';
import axios from 'axios';
import {useToast} from 'react-native-toast-notifications';

export default function Checkout({navigation, route}) {
  const {product} = route.params;
  const [user, setUser] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('bank');
  const [selectedBank, setSelectedBank] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber] = useState(
    `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
  );

  const banks = ['BCA', 'BRI', 'BNI', 'Mandiri'];
  const eWallets = ['OVO', 'DANA', 'ShopeePay', 'Gopay'];
  const totalPrice = product.harga * quantity;

  useEffect(() => {
    getData('user').then(u => setUser(u));
  }, []);

  const toast = useToast();

  const saveTransactionToStorage = async () => {
    try {
      let kirim = {
        fid_buku: product.id_buku,
        jumlah: quantity,
        total: totalPrice,
        pembayaran: selectedBank,
        fid_customer: user.id_customer,
        bukti_transaksi: paymentProof,
      };

      axios.post(apiURL + 'insert_transaksi', kirim).then(res => {
        console.log(res.data);
        if (res.data.status == 200) {
          toast.show(res.data.message, {
            type: 'success',
          });
          setOrderConfirmed(true);
          // navigation.replace('MainApp');
        }
      });
      console.log('Berhasil menyimpan transaksi', kirim); // <-- Tambahkan ini
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const selectImageSource = () => {
    Alert.alert('Upload Bukti Transfer', 'Pilih sumber gambar', [
      {text: 'Gallery', onPress: () => handleImageSelection('library')},
      {text: 'Batal', style: 'cancel'},
    ]);
  };

  const handleImageSelection = source => {
    const imagePicker = source === 'camera' ? launchCamera : launchImageLibrary;

    imagePicker(
      {
        includeBase64: true,
        mediaType: 'photo',
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets) {
          console.log(response.assets[0]);
          setPaymentProof(
            `data:${response.assets[0].type};base64, ${response.assets[0].base64}`,
          );
        }
      },
    );
  };

  const confirmPayment = async () => {
    if (!paymentProof) {
      Alert.alert('Error', 'Harap upload bukti transfer terlebih dahulu');
      return;
    }

    try {
      await saveTransactionToStorage();
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan transaksi');
      console.error(error);
    }
  };

  if (orderConfirmed) {
    return (
      <View style={styles.container}>
        <MyHeader
          title="Konfirmasi Pesanan"
          onPress={() => navigation.goBack()}
        />
        <View style={styles.confirmationContainer}>
          <Icon
            name="checkmark-circle"
            size={80}
            color="#4BB543"
            style={styles.successIcon}
          />
          <Text style={styles.confirmationTitle}>
            Pembayaran Sedang Diverifikasi
          </Text>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>Produk: {product.judul}</Text>
            <Text style={styles.summaryText}>Jumlah: {quantity}</Text>
            <Text style={styles.summaryText}>
              Total: Rp {totalPrice.toLocaleString()}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <MyButton
              title="Kembali ke Beranda"
              type="outline"
              onPress={() => navigation.replace('MainApp')}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MyHeader title="Checkout" onPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Ringkasan Pesanan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan Pesanan</Text>
          <View style={styles.productContainer}>
            <FastImage
              source={{
                uri: webURL + product.cover,
              }}
              style={styles.productImage}
              resizeMode="contain"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.judul}</Text>
              <Text style={styles.productPrice}>
                Rp {new Intl.NumberFormat().format(product.harga)}
              </Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Icon name="remove-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                  <Icon name="add-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Pembayaran:</Text>
            <Text style={styles.totalPrice}>
              Rp {totalPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Metode Pembayaran */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
          <View style={styles.paymentOptions}>
            <MyRadio
              label="Transfer Bank"
              selected={selectedPayment === 'bank'}
              onPress={() => setSelectedPayment('bank')}
            />
            {selectedPayment === 'bank' && (
              <View style={styles.bankOptions}>
                {banks.map(bank => (
                  <TouchableOpacity
                    key={bank}
                    style={[
                      styles.bankOption,
                      selectedBank === bank && styles.selectedBank,
                    ]}
                    onPress={() => setSelectedBank(bank)}>
                    <Text
                      style={
                        selectedBank === bank
                          ? styles.selectedBankText
                          : styles.bankText
                      }>
                      {bank}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <MyRadio
              label="E-Wallet"
              selected={selectedPayment === 'ewallet'}
              onPress={() => setSelectedPayment('ewallet')}
            />
            {selectedPayment === 'ewallet' && (
              <View style={styles.bankOptions}>
                {eWallets.map(wallet => (
                  <TouchableOpacity
                    key={wallet}
                    style={[
                      styles.bankOption,
                      selectedBank === wallet && styles.selectedBank,
                    ]}
                    onPress={() => setSelectedBank(wallet)}>
                    <Text
                      style={
                        selectedBank === wallet
                          ? styles.selectedBankText
                          : styles.bankText
                      }>
                      {wallet}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Upload Bukti Transfer */}
        {selectedBank !== '' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload Bukti Transfer</Text>
            {paymentProof ? (
              <View>
                <Image source={{uri: paymentProof}} style={styles.proofImage} />
                <MyButton
                  title="Ganti Bukti"
                  type="outline"
                  onPress={selectImageSource}
                  style={styles.changeProofButton}
                />
              </View>
            ) : (
              <MyButton
                title="Upload Bukti Transfer"
                type="outline"
                icon="camera"
                onPress={selectImageSource}
                style={styles.uploadButton}
              />
            )}
            <Text style={styles.noteText}>
              Pastikan bukti transfer jelas terbaca dan sesuai dengan nominal
              pembayaran
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Tombol Konfirmasi */}
      {selectedBank !== '' && paymentProof && (
        <View style={styles.footer}>
          <MyButton
            title="Konfirmasi Pembayaran"
            onPress={confirmPayment}
            style={styles.confirmButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fonts.secondary[700],
    fontSize: 18,
    color: colors.dark,
    marginBottom: 15,
  },
  productContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontFamily: fonts.secondary[600],
    fontSize: 16,
    color: colors.dark,
    marginBottom: 5,
  },
  productPrice: {
    fontFamily: fonts.secondary[600],
    fontSize: 14,
    color: colors.primary,
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontFamily: fonts.secondary[600],
    fontSize: 16,
    marginHorizontal: 15,
    color: colors.dark,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontFamily: fonts.secondary[600],
    fontSize: 16,
    color: colors.dark,
  },
  totalPrice: {
    fontFamily: fonts.secondary[700],
    fontSize: 18,
    color: colors.primary,
  },
  paymentOptions: {
    marginLeft: 10,
  },
  bankOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 30,
    marginBottom: 15,
    marginTop: 10,
  },
  bankOption: {
    padding: 12,
    margin: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  selectedBank: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  bankText: {
    fontFamily: fonts.secondary[500],
    fontSize: 14,
    color: colors.dark,
  },
  selectedBankText: {
    fontFamily: fonts.secondary[600],
    fontSize: 14,
    color: colors.white,
  },
  proofContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadButton: {
    marginBottom: 15,
  },
  changeProofButton: {
    width: 200,
  },
  noteText: {
    fontFamily: fonts.secondary[400],
    fontSize: 12,
    color: colors.gray,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmButton: {
    width: '100%',
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  successIcon: {
    marginBottom: 20,
  },
  confirmationTitle: {
    fontFamily: fonts.secondary[700],
    fontSize: 22,
    color: colors.dark,
    textAlign: 'center',
    marginBottom: 10,
  },
  orderNumber: {
    fontFamily: fonts.secondary[600],
    fontSize: 16,
    color: colors.primary,
    marginBottom: 30,
  },
  summaryContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  summaryText: {
    fontFamily: fonts.secondary[600],
    fontSize: 16,
    color: colors.dark,
    marginBottom: 8,
  },
  actionButtons: {
    width: '100%',
  },
  homeButton: {
    marginBottom: 15,
  },
  helpButton: {
    backgroundColor: colors.primary,
  },
});
