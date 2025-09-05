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
  const [allTransactions, setAllTransactions] = useState({
    buku: [],
    bundling: [],
    kolaborasi: [],
    mandiri: [],
  });
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter options
  const filterOptions = [
    {key: 'all', label: 'Semua', icon: 'list-outline'},
    {key: 'buku', label: 'Pesanan Buku', icon: 'book-outline'},
    {
      key: 'bundling',
      label: 'Publikasi Paket Bundling',
      icon: 'albums-outline',
    },
    {key: 'mandiri', label: 'Publikasi Paket Mandiri', icon: 'person-outline'},
    {
      key: 'kolaborasi',
      label: 'Publikasi Paket Kolaborasi',
      icon: 'people-outline',
    },
  ];

  // Load transactions from API
  useEffect(() => {
    const loadTransactions = async () => {
      getData('user').then(u => {
        axios
          .post(apiURL + 'transaksi', {
            fid_customer: u.id_customer,
          })
          .then(res => {
            console.log(res.data);
            setAllTransactions(res.data);
            // Set filtered transactions to all by default
            const combined = combineAllTransactions(res.data);
            setFilteredTransactions(combined);
          })
          .catch(error => {
            console.error('Error loading transactions:', error);
          });
      });
    };

    const unsubscribe = navigation.addListener('focus', loadTransactions);
    loadTransactions();
    return unsubscribe;
  }, [navigation]);

  // Combine all transactions into single array with type identifier
  const combineAllTransactions = data => {
    const combined = [];

    // Add buku transactions
    if (data.buku) {
      data.buku.forEach(item => {
        combined.push({
          ...item,
          type: 'buku',
          id: item.id_transaksi,
          kode: item.kode,
          status: item.status,
          tanggal: item.tanggal,
          total: item.total,
          judul: item.judul,
          jumlah: item.jumlah,
          harga: item.harga,
        });
      });
    }

    // Add bundling transactions
    if (data.bundling) {
      data.bundling.forEach(item => {
        combined.push({
          ...item,
          type: 'bundling',
          id: item.id_transaksi2,
          kode: item.kode,
          status: item.status,
          tanggal: item.tanggal,
          total: item.total,
          judul: `Paket Bundling ${item.jenis}`,
          jumlah: '1',
          harga: item.total,
        });
      });
    }

    // Add mandiri transactions
    if (data.mandiri) {
      data.mandiri.forEach(item => {
        combined.push({
          ...item,
          type: 'mandiri',
          id: item.id_transaksi2,
          kode: item.kode,
          status: item.status,
          tanggal: item.tanggal,
          total: item.total,
          judul: `Paket Mandiri ${item.jenis}`,
          jumlah: '1',
          harga: item.total,
        });
      });
    }

    // Add kolaborasi transactions
    if (data.kolaborasi) {
      data.kolaborasi.forEach(item => {
        combined.push({
          ...item,
          type: 'kolaborasi',
          id: item.id_transaksi3,
          kode: item.kode,
          status: item.status,
          tanggal: item.tanggal,
          total: item.total,
          judul: `Paket Kolaborasi\nPenulis ke-${item.penulis}\n${item.nama_judul}`,
          jumlah: 1,
          harga: item.total,
        });
      });
    }

    // Sort by date (newest first)
    return combined.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  };

  // Filter transactions based on active filter
  const handleFilterChange = filterKey => {
    setActiveFilter(filterKey);

    if (filterKey === 'all') {
      const combined = combineAllTransactions(allTransactions);
      setFilteredTransactions(combined);
    } else {
      const filtered = combineAllTransactions(allTransactions).filter(
        transaction => transaction.type === filterKey,
      );
      setFilteredTransactions(filtered);
    }
  };

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
        return 'Buku';
      case 'bundling':
        return 'Bundling';
      case 'mandiri':
        return 'Mandiri';
      case 'kolaborasi':
        return 'Kolaborasi';
      default:
        return type;
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

      {/* Filter Buttons */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContentContainer}>
          {filterOptions.map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                activeFilter === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange(filter.key)}>
              <Icon
                name={filter.icon}
                size={16}
                color={
                  activeFilter === filter.key ? colors.white : colors.primary
                }
              />
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter.key && styles.filterButtonTextActive,
                ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View
        style={{
          flex: 1,
        }}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="receipt-outline" size={60} color={colors.gray} />
            <Text style={styles.emptyText}>
              {activeFilter === 'all'
                ? 'Belum ada transaksi'
                : `Belum ada transaksi ${
                    filterOptions.find(f => f.key === activeFilter)?.label
                  }`}
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {filteredTransactions.map((transaction, index) => (
              <View
                key={`${transaction.type}_${transaction.id}_${index}`}
                style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionIdContainer}>
                    <Text style={styles.transactionId}>
                      #{transaction.kode}
                    </Text>
                    <View
                      style={[
                        styles.typeBadge,
                        {backgroundColor: getTypeColor(transaction.type)},
                      ]}>
                      <Text style={styles.typeBadgeText}>
                        {getTypeLabel(transaction.type)}
                      </Text>
                    </View>
                  </View>
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
                  <Text style={styles.itemName}>{transaction.judul}</Text>
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
                  <Icon
                    name="chevron-forward"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  // Filter Styles
  filterContainer: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContentContainer: {
    paddingHorizontal: 15,
    height: 60,
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    height: 40,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  filterButtonText: {
    fontFamily: fonts.primary[500],
    fontSize: 12,
    marginLeft: 5,
    color: colors.primary,
  },
  filterButtonTextActive: {
    fontFamily: fonts.primary[500],
    fontSize: 12,

    marginLeft: 5,
    color: colors.white,
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 10,
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
    textAlign: 'center',
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
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  transactionIdContainer: {
    flex: 1,
  },
  transactionId: {
    fontFamily: fonts.primary[600],
    fontSize: 14,
    color: colors.dark,
    marginBottom: 5,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontFamily: fonts.primary[600],
    fontSize: 10,
    color: colors.white,
  },
  transactionStatus: {
    fontFamily: fonts.primary[600],
    fontSize: 14,
    textAlign: 'right',
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
    flex: 1,
    marginRight: 10,
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
  // Tracking Detail Styles (kept from original)
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
