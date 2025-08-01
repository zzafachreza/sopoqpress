import {View, Text, ScrollView, StyleSheet, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Color, colors, fonts} from '../../utils';
import {MyHeader} from '../../components';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {apiURL} from '../../utils/localStorage';
import moment from 'moment';

export default function DetailTransaksi({route, navigation}) {
  // Get transaction data from route params
  const {transaction} = route.params;

  const [tracking, setTracking] = useState([]);

  // Format date function
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = status => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return colors.warning;
      case 'Sedang Diproses':
        return colors.primary;
      case 'Dikirim':
        return colors.info;
      case 'Selesai':
        return colors.success;
      case 'Batal':
        return colors.danger;
      default:
        return colors.gray;
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return 'time-outline';
      case 'Sedang Diproses':
        return 'refresh-outline';
      case 'Dikirim':
        return 'car-outline';
      case 'Selesai':
        return 'checkmark-done-outline';
      case 'Batal':
        return 'close-outline';
      default:
        return 'help-outline';
    }
  };

  useEffect(() => {
    axios
      .post(apiURL + 'tracking', {
        kode: transaction.kode,
      })
      .then(res => {
        console.log(res.data);

        setTracking(res.data);
      });
  }, []);

  return (
    <View style={styles.container}>
      <MyHeader title="Detail Transaksi" onPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Tracking Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Transaksi</Text>
          {tracking.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <View>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineDot,
                      {backgroundColor: colors.primary},
                    ]}>
                    <Icon name="checkmark" size={16} color={colors.white} />
                  </View>
                </View>

                <View style={styles.timelineLeft}>
                  <View
                    style={{
                      width: 2,
                      backgroundColor: Color.blueGray[400],
                      height: 100,
                      // flex: 1
                    }}>
                    <Icon name="checkmark" size={16} color={colors.white} />
                  </View>
                </View>
              </View>

              <View style={styles.timelineContent}>
                <Text style={styles.timelineTime}>
                  {moment(item.tanggal_proses).format('DD MMMM YYYY')}{' '}
                  {item.jam_proses.toString().substr(0, 5)}
                </Text>
                <Text
                  style={[
                    styles.timelineStatus,
                    {color: getStatusColor(item.status)},
                  ]}>
                  {item.nama_proses}
                </Text>
                <Text style={styles.timelineNote}>{item.informasi_proses}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: fonts.primary[700],
    fontSize: 18,
    color: colors.dark,
    marginBottom: 15,
  },
  productInfo: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 15,
  },
  productName: {
    fontFamily: fonts.primary[600],
    fontSize: 16,
    color: colors.dark,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceText: {
    fontFamily: fonts.primary[400],
    fontSize: 14,
    color: colors.dark,
  },
  totalText: {
    fontFamily: fonts.primary[600],
    fontSize: 16,
    color: colors.primary,
  },
  paymentInfo: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontFamily: fonts.primary[400],
    fontSize: 14,
    color: colors.dark,
  },
  infoValue: {
    fontFamily: fonts.primary[500],
    fontSize: 14,
    color: colors.dark,
  },
  proofImage: {
    width: '100%',
    // height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: colors.black,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 10,
  },
  timelineTime: {
    fontFamily: fonts.primary[400],
    fontSize: 12,
    color: colors.gray,
    // marginBottom: 3,
  },
  timelineStatus: {
    fontFamily: fonts.primary[600],
    fontSize: 16,
    marginBottom: 5,
  },
  timelineNote: {
    fontFamily: fonts.primary[400],
    fontSize: 14,
    color: colors.dark,
    lineHeight: 20,
  },
});
