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

export default function Checkout({navigation, route}) {
  const {product} = route.params;
  const [user, setUser] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('bank');
  const [selectedBank, setSelectedBank] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber] = useState(
    `BOOK-${Math.floor(100000 + Math.random() * 900000)}`,
  );

  const banks = ['BCA', 'BRI', 'BNI', 'Mandiri'];
  const eWallets = ['OVO', 'DANA', 'ShopeePay', 'Gopay'];
  const basePrice = product.harga * quantity;
  const shippingCost = basePrice >= 100000 ? 0 : 15000; // Gratis ongkir di atas 100k
  const totalPrice = basePrice + shippingCost;

  useEffect(() => {
    getData('user').then(u => {
      setUser(u);
      // Set default customer data from user profile
      if (u) {
        setCustomerName(u.nama || '');
        setCustomerPhone(u.telepon || '');
        setCustomerAddress(u.alamat || '');
      }
    });
  }, []);

  const saveTransactionToStorage = async () => {
    try {
      let kirim = {
        fid_buku: product.id_buku || product.id, // Support both API and dummy data
        judul_buku: product.judul_buku,
        jumlah_buku: quantity,
        nama_customer: customerName,
        telepon_customer: customerPhone,
        alamat_pengiriman: customerAddress,
        harga_buku: product.harga,
        ongkos_kirim: shippingCost,
        total: totalPrice,
        pembayaran: selectedBank,
        fid_customer: user.id_customer,
        bukti_transaksi: paymentProof,
        status_order: 'pending',
        tanggal_order: new Date().toISOString(),
      };

      // API endpoint untuk pembelian buku
      axios.post(apiURL + 'insert_order_buku', kirim).then(res => {
        console.log(res.data);
        setOrderConfirmed(true);
      });
      console.log('Berhasil menyimpan order buku', kirim);
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const selectImageSource = () => {
    Alert.alert('Upload Bukti Transfer', 'Pilih sumber gambar', [
      {text: 'Gallery', onPress: () => handleImageSelection('library')},
      {text: 'Kamera', onPress: () => handleImageSelection('camera')},
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
    if (!customerName.trim()) {
      Alert.alert('Error', 'Harap isi nama lengkap');
      return;
    }
    if (!customerPhone.trim()) {
      Alert.alert('Error', 'Harap isi nomor telepon');
      return;
    }
    if (!customerAddress.trim()) {
      Alert.alert('Error', 'Harap isi alamat pengiriman');
      return;
    }
    if (!paymentProof) {
      Alert.alert('Error', 'Harap upload bukti transfer terlebih dahulu');
      return;
    }
    if (quantity > product.stok) {
      Alert.alert('Error', `Stok tidak mencukupi. Stok tersedia: ${product.stok} buku`);
      return;
    }

    try {
      await saveTransactionToStorage();
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan pesanan');
      console.error(error);
    }
  };

  const openWhatsApp = () => {
    const message = `Halo, saya memiliki pertanyaan tentang pesanan buku "${product.judul_buku}" dengan nomor pesanan #${orderNumber}`;
    Linking.openURL(
      `whatsapp://send?phone=6281234567890&text=${encodeURIComponent(message)}`,
    );
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
            Pesanan Sedang Diverifikasi
          </Text>
          <Text style={styles.orderNumber}>Nomor Pesanan: #{orderNumber}</Text>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>Buku: {product.judul_buku}</Text>
            <Text style={styles.summaryText}>Penulis: {product.penulis}</Text>
            <Text style={styles.summaryText}>Jumlah: {quantity} buku</Text>
            <Text style={styles.summaryText}>Nama: {customerName}</Text>
            <Text style={styles.summaryText}>Alamat: {customerAddress}</Text>
            <Text style={styles.summaryText}>
              Subtotal: Rp {basePrice.toLocaleString()}
            </Text>
            {shippingCost > 0 && (
              <Text style={styles.summaryText}>
                Ongkir: Rp {shippingCost.toLocaleString()}
              </Text>
            )}
            <Text style={[styles.summaryText, styles.totalText]}>
              Total: Rp {totalPrice.toLocaleString()}
            </Text>
          </View>
          <Text style={styles.noteText}>
            Pesanan akan diproses dalam 1-2 hari kerja setelah pembayaran dikonfirmasi
          </Text>
          <View style={styles.actionButtons}>
            <MyButton
              title="Kembali ke Beranda"
              type="outline"
              onPress={() => navigation.navigate('Home')}
              style={styles.homeButton}
            />
            <MyButton
              title="Hubungi CS"
              onPress={openWhatsApp}
              style={styles.helpButton}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MyHeader title="Checkout Buku" onPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Detail Buku */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Buku</Text>
          <View style={styles.productContainer}>
            <FastImage
              source={{
                uri: product.cover_buku || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&q=80',
              }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.judul_buku}</Text>
              <Text style={styles.authorName}>oleh {product.penulis}</Text>
              <Text style={styles.productPrice}>
                Rp {new Intl.NumberFormat('id-ID').format(product.harga)}
              </Text>
              <Text style={styles.stockText}>
                Stok: {product.stok} buku tersedia
              </Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Icon name="remove-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity} buku</Text>
                <TouchableOpacity 
                  onPress={() => setQuantity(Math.min(product.stok, quantity + 1))}>
                  <Icon name="add-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Data Pembeli */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Pembeli</Text>
          <MyInput
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            value={customerName}
            onChangeText={setCustomerName}
            iconname="person"
          />
          <MyInput
            label="Nomor Telepon"
            placeholder="Masukkan nomor telepon"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            iconname="call"
            keyboardType="phone-pad"
          />
          <MyInput
            label="Alamat Pengiriman"
            placeholder="Masukkan alamat lengkap"
            value={customerAddress}
            onChangeText={setCustomerAddress}
            iconname="location"
            multiline
            textAlignVertical="top"
            style={styles.addressInput}
          />
        </View>

        {/* Informasi Pengiriman */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pengiriman</Text>
          <View style={styles.shippingInfo}>
            <View style={styles.shippingItem}>
              <Icon name="time" size={16} color={colors.primary} />
              <Text style={styles.shippingText}>Estimasi: 2-4 hari kerja</Text>
            </View>
            <View style={styles.shippingItem}>
              <Icon name="car" size={16} color={colors.primary} />
              <Text style={styles.shippingText}>
                {shippingCost === 0 ? 'Gratis ongkir (min. Rp 100.000)' : 'Ongkir: Rp 15.000'}
              </Text>
            </View>
            <View style={styles.shippingItem}>
              <Icon name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.shippingText}>Barang dijamin original</Text>
            </View>
          </View>
        </View>

        {/* Total Pembayaran */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {product.judul_buku} x {quantity}
            </Text>
            <Text style={styles.summaryValue}>
              Rp {basePrice.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ongkos Kirim</Text>
            <Text style={[styles.summaryValue, shippingCost === 0 && styles.freeShipping]}>
              {shippingCost === 0 ? 'GRATIS' : `Rp ${shippingCost.toLocaleString()}`}
            </Text>
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
              pembayaran sebesar Rp {totalPrice.toLocaleString()}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Tombol Konfirmasi */}
      {selectedBank !== '' && paymentProof && (
        <View style={styles.footer}>
          <MyButton
            title="Konfirmasi Pesanan"
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
    height: 100,
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
    marginBottom: 3,
  },
  authorName: {
    fontFamily: fonts.secondary[500],
    fontSize: 14,
    color: colors.gray,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  productPrice: {
    fontFamily: fonts.secondary[600],
    fontSize: 14,
    color: colors.primary,
    marginBottom: 5,
  },
  stockText: {
    fontFamily: fonts.secondary[400],
    fontSize: 12,
    color: '#27ae60',
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
  addressInput: {
    height: 80,
  },
  shippingInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  shippingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shippingText: {
    fontFamily: fonts.secondary[500],
    fontSize: 14,
    color: colors.dark,
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontFamily: fonts.secondary[500],
    fontSize: 14,
    color: colors.dark,
  },
  summaryValue: {
    fontFamily: fonts.secondary[600],
    fontSize: 14,
    color: colors.dark,
  },
  freeShipping: {
    color: '#27ae60',
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
    alignSelf: 'center',
  },
  noteText: {
    fontFamily: fonts.secondary[400],
    fontSize: 12,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 5,
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
    marginBottom: 20,
  },
  summaryText: {
    fontFamily: fonts.secondary[600],
    fontSize: 16,
    color: colors.dark,
    marginBottom: 8,
  },
  totalText: {
    fontFamily: fonts.secondary[700],
    fontSize: 18,
    color: colors.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 8,
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