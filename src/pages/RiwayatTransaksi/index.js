import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {colors, fonts} from '../../utils';
import {MyHeader} from '../../components';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiURL, getData} from '../../utils/localStorage';
import axios from 'axios';

export default function RiwayatTransaksi({navigation}) {
  const [transactions, setTransactions] = useState([]);

  // Load transactions from local storage
  useEffect(() => {
    const loadTransactions = async () => {
      getData('user').then(u => {
        axios
          .post(apiURL + 'transaksi', {
            fid_customer: u.id_customer,
          })
          .then(res => {
            console.log(res.data);
            setTransactions(res.data);
          });
      });
    };

    // Tambahkan listener untuk refresh saat kembali ke screen
    const unsubscribe = navigation.addListener('focus', loadTransactions);

    // Load pertama kali
    loadTransactions();

    return unsubscribe;
  }, [navigation]);

  const getStatusColor = status => {
    switch (status) {
      case 'Selesai':
        return colors.success;
      case 'Sedang Diproses':
        return colors.warning;
      case 'Batal':
        return colors.danger;
      case 'Menunggu Konfirmasi':
        return colors.info;
      default:
        return colors.gray;
    }
  };

  const renderStatusIcon = status => {
    switch (status) {
      case 'Selesai':
        return (
          <Icon
            name="checkmark-circle"
            size={20}
            color={getStatusColor(status)}
          />
        );
      case 'Sedang Diproses':
        return <Icon name="time" size={20} color={getStatusColor(status)} />;
      case 'Batal':
        return (
          <Icon name="close-circle" size={20} color={getStatusColor(status)} />
        );
      case 'Menunggu Konfirmasi':
        return (
          <Icon name="hourglass" size={20} color={getStatusColor(status)} />
        );
      default:
        return (
          <Icon name="help-circle" size={20} color={getStatusColor(status)} />
        );
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <MyHeader title="Riwayat Transaksi" onPress={() => navigation.goBack()} />

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="receipt-outline" size={60} color={colors.gray} />
          <Text style={styles.emptyText}>Belum ada transaksi</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {transactions.map(transaction => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionId}>#{transaction.kode}</Text>
                <Text
                  style={[
                    styles.transactionStatus,
                    {color: getStatusColor(transaction.status)},
                  ]}>
                  {transaction.status}
                </Text>
              </View>

              <Text style={styles.transactionDate}>
                {formatDate(transaction.tanggal)}
              </Text>

              <View style={styles.itemRow}>
                <Text style={styles.itemName}>{transaction.nama_jasa}</Text>
                <Text style={styles.itemPrice}>
                  {transaction.jumlah} × Rp
                  {new Intl.NumberFormat().format(transaction.harga)}
                </Text>
              </View>

              <Text style={styles.totalText}>
                Total: Rp {new Intl.NumberFormat().format(transaction.total)}
              </Text>

              <TouchableOpacity
                style={styles.detailButton}
                onPress={() =>
                  navigation.navigate('DetailTransaksi', {transaction})
                }>
                <Text style={styles.detailButtonText}>
                  Lihat Detail Transaksi
                </Text>
                <Icon name="chevron-forward" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
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
    padding: 15,
    paddingBottom: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.primary[400],
    fontSize: 16,
    color: colors.gray,
    marginTop: 10,
  },
  transactionCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  transactionId: {
    fontFamily: fonts.primary[600],
    fontSize: 14,
    color: colors.dark,
  },
  transactionStatus: {
    fontFamily: fonts.primary[600],
    fontSize: 14,
  },
  transactionDate: {
    fontFamily: fonts.primary[400],
    fontSize: 12,
    color: colors.gray,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemName: {
    fontFamily: fonts.primary[400],
    fontSize: 14,
    color: colors.dark,
  },
  itemPrice: {
    fontFamily: fonts.primary[400],
    fontSize: 14,
    color: colors.dark,
  },
  totalText: {
    fontFamily: fonts.primary[600],
    fontSize: 14,
    color: colors.dark,
    marginTop: 5,
    textAlign: 'right',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailButtonText: {
    fontFamily: fonts.primary[500],
    fontSize: 14,
    color: colors.primary,
  },
  // Tracking Detail Styles
  trackingItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  timeline: {
    width: 40,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginVertical: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
  },
  trackingContent: {
    flex: 1,
    paddingBottom: 15,
  },
  trackingTime: {
    fontFamily: fonts.primary[400],
    fontSize: 12,
    color: colors.gray,
    marginBottom: 5,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  trackingStatusText: {
    fontFamily: fonts.primary[600],
    fontSize: 14,
    marginLeft: 5,
  },
  trackingNote: {
    fontFamily: fonts.primary[400],
    fontSize: 13,
    color: colors.dark,
    marginBottom: 5,
  },
  trackingAction: {
    fontFamily: fonts.primary[500],
    fontSize: 13,
    color: colors.primary,
  },
});
