import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {colors, fonts, windowWidth} from '../../utils';
import {MyHeader} from '../../components';
import {ScrollView} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import {apiURL, webURL} from '../../utils/localStorage';
import axios from 'axios';
import RenderHtml from 'react-native-render-html';
import moment from 'moment';

export default function DetailTransaksi({route, navigation}) {
  // Get transaction data from route params
  const transaksi = route.params?.transaction || route.params;
  console.log(transaksi);

  const getStatusColor = status => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return colors.warning || '#FF9800';
      case 'Sedang Proses':
        return colors.success || '#2c6df8ff';
      case 'Sedang Pengiriman':
        return colors.success || '#634b9bff';
      case 'Selesai':
        return colors.success || '#4CAF50';
      case 'Batal':
        return colors.danger || '#F44336';
      default:
        return colors.secondary || '#757575';
    }
  };

  const getTypeColor = type => {
    switch (type) {
      case 'buku':
        return colors.primary;
      case 'bundling':
        return colors.success;
      case 'mandiri':
        return colors.warning;
      case 'kolaborasi':
        return colors.info;
      default:
        return colors.gray;
    }
  };

  const getTypeLabel = type => {
    switch (type) {
      case 'buku':
        return 'Pesanan Buku';
      case 'bundling':
        return 'Publikasi Paket Bundling';
      case 'mandiri':
        return 'Publikasi Paket Mandiri';
      case 'kolaborasi':
        return 'Publikasi Paket Kolaborasi';
      default:
        return type;
    }
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const openProofImage = () => {
    if (transaksi.bukti_transaksi) {
      const imageUrl = `${webURL || 'https://your-domain.com/'}${
        transaksi.bukti_transaksi
      }`;
      Linking.openURL(imageUrl).catch(() => {
        Alert.alert('Error', 'Tidak dapat membuka gambar');
      });
    }
  };

  // Render content based on transaction type
  const renderTransactionContent = () => {
    switch (transaksi.type) {
      case 'buku':
        return renderBookContent();
      case 'bundling':
        return renderBundlingContent();
      case 'mandiri':
        return renderMandiriContent();
      case 'kolaborasi':
        return renderKolaborasiContent();
      default:
        return renderBookContent(); // fallback to book content
    }
  };

  const renderBookContent = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Informasi Buku</Text>

      <View style={styles.bookInfo}>
        {transaksi.cover && (
          <FastImage
            source={{
              uri: `${webURL || 'https://your-domain.com/'}${transaksi.cover}`,
            }}
            style={styles.bookCover}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}

        <View style={styles.bookDetails}>
          <Text style={styles.bookTitle}>{transaksi.judul}</Text>
          <Text style={styles.bookAuthor}>Penulis: {transaksi.penulis}</Text>
          <Text style={styles.bookPublisher}>
            Penerbit: {transaksi.penerbit}
          </Text>
          <Text style={styles.bookCategory}>
            Kategori: {transaksi.kategori}
          </Text>
          <Text style={styles.bookYear}>Tahun: {transaksi.tahun}</Text>
          <Text style={styles.bookPages}>Halaman: {transaksi.halaman}</Text>
          <Text style={styles.bookType}>Tipe: {transaksi.tipe}</Text>
        </View>
      </View>

      {transaksi.deskripsi && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Deskripsi:</Text>
          <RenderHtml
            contentWidth={windowWidth - 60}
            source={{html: transaksi.deskripsi}}
            tagsStyles={{
              p: {color: colors.text || '#333', fontSize: 14},
            }}
          />
          {transaksi.tipe == 'Digital' && transaksi.status == 'Selesai' && (
            <TouchableOpacity
              onPress={() => Linking.openURL(transaksi.link_buku)}
              style={styles.ratingContainer}>
              <Text
                style={{
                  ...styles.bookType,
                  textAlign: 'center',
                }}>
                Download Buku Digital
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderBundlingContent = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Informasi Paket Bundling</Text>

      <View style={styles.packageInfo}>
        <View style={styles.packageIcon}>
          <Icon
            name="albums-outline"
            size={60}
            color={getTypeColor('bundling')}
          />
        </View>

        <View style={styles.packageDetails}>
          <Text style={styles.packageTitle}>Paket Publikasi Bundling</Text>
          <Text style={styles.packageDescription}>
            Paket lengkap untuk publikasi buku dengan berbagai layanan bundling
          </Text>

          <View style={styles.packageFeature}>
            <Icon
              name={
                transaksi.haki === 'Ya' ? 'checkmark-circle' : 'close-circle'
              }
              size={16}
              color={transaksi.haki === 'Ya' ? colors.success : colors.danger}
            />
            <Text style={styles.featureText}>
              HAKI: {transaksi.haki === 'Ya' ? 'Termasuk' : 'Tidak Termasuk'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderMandiriContent = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Informasi Paket Mandiri</Text>

      <View style={styles.packageInfo}>
        <View style={styles.packageIcon}>
          <Icon
            name="person-outline"
            size={60}
            color={getTypeColor('mandiri')}
          />
        </View>

        <View style={styles.packageDetails}>
          <Text style={styles.packageTitle}>Paket Publikasi Mandiri</Text>
          <Text style={styles.packageDescription}>
            Paket publikasi mandiri untuk penulis yang ingin menerbitkan karya
            sendiri
          </Text>

          <View style={styles.packageFeature}>
            <Icon
              name={
                transaksi.haki === 'Ya' ? 'checkmark-circle' : 'close-circle'
              }
              size={16}
              color={transaksi.haki === 'Ya' ? colors.success : colors.danger}
            />
            <Text style={styles.featureText}>
              HAKI: {transaksi.haki === 'Ya' ? 'Termasuk' : 'Tidak Termasuk'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderKolaborasiContent = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Informasi Paket Kolaborasi</Text>

      <View style={styles.packageInfo}>
        <View style={styles.packageIcon}>
          <Icon
            name="people-outline"
            size={60}
            color={getTypeColor('kolaborasi')}
          />
        </View>

        <View style={styles.packageDetails}>
          <Text style={styles.packageTitle}>Paket Publikasi Kolaborasi</Text>
          <Text style={styles.packageDescription}>
            Paket kolaborasi untuk publikasi buku bersama dengan penulis lain
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>{transaksi.nama_judul}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Penulis Ke- {transaksi.penulis}</Text>
          </View>

          <View style={styles.packageFeature}>
            <Icon name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.featureText}>Kolaborasi Multi Penulis</Text>
          </View>

          <View style={styles.packageFeature}>
            <Icon name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.featureText}>Editing Kolaboratif</Text>
          </View>

          <View style={styles.packageFeature}>
            <Icon name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.featureText}>Pembagian Royalti</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPurchaseDetails = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Detail Pembelian</Text>

      {transaksi.type === 'buku' ? (
        <>
          <View style={styles.row}>
            <Text style={styles.label}>Harga Satuan</Text>
            <Text style={styles.value}>{formatCurrency(transaksi.harga)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Jumlah</Text>
            <Text style={styles.value}>{transaksi.jumlah} buah</Text>
          </View>
        </>
      ) : (
        <View style={styles.row}>
          <Text style={styles.label}>Harga Paket</Text>
          <Text style={styles.value}>{formatCurrency(transaksi.total)}</Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(transaksi.total)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <MyHeader title="Detail Transaksi" onPress={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={styles.headerCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Kode Transaksi</Text>
            <Text style={styles.value}>{transaksi.kode}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Jenis Transaksi</Text>
            <View
              style={[
                styles.typeBadge,
                {backgroundColor: getTypeColor(transaksi.type)},
              ]}>
              <Text style={styles.typeBadgeText}>
                {getTypeLabel(transaksi.type)}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Tanggal</Text>
            <Text style={styles.value}>
              {moment(transaksi.tanggal).format('DD MMMM YYYY')}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: getStatusColor(transaksi.status)},
              ]}>
              <Text style={styles.statusText}>{transaksi.status}</Text>
            </View>
          </View>
        </View>

        {/* Transaction Content Based on Type */}
        {renderTransactionContent()}

        {/* Purchase Details */}
        {renderPurchaseDetails()}

        {/* Customer Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Pembeli</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.value}>{transaksi.nama_customer}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{transaksi.username}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Telepon</Text>
            <Text style={styles.value}>{transaksi.telepon_customer}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Alamat</Text>
            <Text style={styles.value}>{transaksi.alamat_customer}</Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Pembayaran</Text>

          {transaksi.pembayaran && (
            <View style={styles.row}>
              <Text style={styles.label}>Metode Pembayaran</Text>
              <Text style={styles.value}>{transaksi.pembayaran}</Text>
            </View>
          )}

          {transaksi.bukti_transaksi && (
            <View style={styles.proofContainer}>
              <Text style={styles.label}>Bukti Transfer</Text>
              <TouchableOpacity
                style={styles.proofButton}
                onPress={openProofImage}>
                <Icon
                  name="image-outline"
                  size={20}
                  color={colors.primary || '#007AFF'}
                />
                <Text style={styles.proofButtonText}>Lihat Bukti Transfer</Text>
                <Icon
                  name="open-outline"
                  size={16}
                  color={colors.primary || '#007AFF'}
                />
              </TouchableOpacity>
            </View>
          )}

          {transaksi.catatan && (
            <View style={styles.noteContainer}>
              <Text style={styles.label}>Catatan</Text>
              <Text style={styles.noteText}>{transaksi.catatan}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    backgroundColor: colors.white || '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  card: {
    backgroundColor: colors.white || '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text || '#333',
    marginBottom: 12,
    fontFamily: fonts?.primary?.[600] || 'System',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.secondary || '#666',
    flex: 1,
    fontFamily: fonts?.primary?.[400] || 'System',
  },
  value: {
    fontSize: 14,
    color: colors.text || '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts?.primary?.[500] || 'System',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Book specific styles
  bookInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bookCover: {
    width: 80,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text || '#333',
    marginBottom: 4,
    fontFamily: fonts?.primary?.[600] || 'System',
  },
  bookAuthor: {
    fontSize: 14,
    color: colors.secondary || '#666',
    marginBottom: 2,
  },
  bookPublisher: {
    fontSize: 14,
    color: colors.secondary || '#666',
    marginBottom: 2,
  },
  bookCategory: {
    fontSize: 14,
    color: colors.secondary || '#666',
    marginBottom: 2,
  },
  bookYear: {
    fontSize: 14,
    color: colors.secondary || '#666',
    marginBottom: 2,
  },
  bookPages: {
    fontSize: 14,
    color: colors.secondary || '#666',
    marginBottom: 2,
  },
  bookType: {
    fontSize: 14,
    color: colors.primary || '#007AFF',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border || '#e0e0e0',
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text || '#333',
    marginBottom: 8,
  },
  ratingContainer: {
    backgroundColor: colors.primary || '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  // Package specific styles
  packageInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  packageIcon: {
    alignItems: 'center',
    marginRight: 16,
    paddingTop: 8,
  },
  packageDetails: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text || '#333',
    marginBottom: 8,
    fontFamily: fonts?.primary?.[600] || 'System',
  },
  packageDescription: {
    fontSize: 14,
    color: colors.secondary || '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  packageFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.text || '#333',
    marginLeft: 8,
    fontFamily: fonts?.primary?.[400] || 'System',
  },
  // Common styles
  divider: {
    height: 1,
    backgroundColor: colors.border || '#e0e0e0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text || '#333',
    fontFamily: fonts?.primary?.[600] || 'System',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary || '#007AFF',
    fontFamily: fonts?.primary?.[600] || 'System',
  },
  proofContainer: {
    marginTop: 12,
  },
  proofButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary ? `${colors.primary}10` : '#007AFF10',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  proofButtonText: {
    fontSize: 14,
    color: colors.primary || '#007AFF',
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
    fontWeight: '500',
  },
  noteContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border || '#e0e0e0',
  },
  noteText: {
    fontSize: 14,
    color: colors.text || '#333',
    fontStyle: 'italic',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background || '#f5f5f5',
    borderRadius: 8,
  },
});
