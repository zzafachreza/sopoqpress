import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, fonts} from '../../utils';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import {useIsFocused} from '@react-navigation/native';
import axios from 'axios';
import {apiURL, getData, webURL} from '../../utils/localStorage';

const {width} = Dimensions.get('window');

export default function Home({navigation}) {
  const [user, setUser] = useState({});
  const [featuredProducts, setProduct] = useState([]);

  const navigateToDetail = product => {
    navigation.navigate('ProdukDetail', {product});
  };

  const getBuku = () => {
    axios
      .post(apiURL + 'buku', {
        modul: 'buku',
      })
      .then(res => {
        console.log(res.data);
        setProduct(res.data);
      })
      .catch(error => {
        console.log('Error fetching books:', error);
        // Tetap gunakan data dummy jika API gagal
      });
  };

  const formatPrice = price => {
    return `Rp ${new Intl.NumberFormat('id-ID').format(price)}`;
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    getData('user').then(u => {
      setUser(u);
      console.log(u);
    });
    if (isFocused) {
      getBuku();
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerGradient}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Halo, {user.nama_customer}</Text>
          </View>
        </View>
      </View>
      <FastImage
        resizeMode={FastImage.resizeMode.contain}
        source={require('../../assets/logo.png')}
        style={{
          alignSelf: 'center',
          width: 200,
          height: 50,
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Koleksi Buku</Text>
          <Text style={styles.sectionSubtitle}>Temukan buku favorit Anda</Text>
        </View>

        <View style={styles.productsGrid}>
          {featuredProducts.map(product => (
            <TouchableOpacity
              key={product.id_buku || product.id}
              style={styles.productCard}
              onPress={() => navigateToDetail(product)}>
              <View style={styles.cardContent}>
                <FastImage
                  source={{
                    uri:
                      webURL + product.cover ||
                      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&q=80',
                  }}
                  style={styles.productImage}
                  resizeMode="cover"
                  priority={FastImage.priority.normal}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.judul}
                  </Text>
                  <Text style={styles.authorText} numberOfLines={1}>
                    {product.penulis}
                  </Text>
                  <Text style={styles.productPrice}>
                    {formatPrice(product.harga)}
                  </Text>
                  {product.stok && (
                    <Text style={styles.stockText}>
                      Stok: {product.stok} buku
                    </Text>
                  )}
                </View>
                <View
                  style={
                    product.tipe == 'Fisik'
                      ? styles.statusBadge
                      : styles.statusBadge2
                  }>
                  <Text style={styles.statusText}>{product.tipe}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerGradient: {
    paddingBottom: 10,
    backgroundColor: colors.primary,
    // borderBottomLeftRadius: 30,
    // borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    top: 10,
  },
  logo: {
    width: 100,
    height: 50,
    borderRadius: 10,
  },
  greetingText: {
    fontFamily: fonts.secondary[600],
    fontSize: 13,
    color: colors.white,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.secondary[700],
    fontSize: 20,
    color: colors.primary,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontFamily: fonts.secondary[400],
    fontSize: 14,
    color: '#666',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 10,
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    minHeight: 280,
  },
  cardContent: {
    flex: 1,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontFamily: fonts.secondary[700],
    fontSize: 12,
    color: colors.primary,
    marginBottom: 3,
    lineHeight: 16,
  },
  authorText: {
    fontFamily: fonts.secondary[500],
    fontSize: 10,
    color: '#666',
    marginBottom: 3,
    fontStyle: 'italic',
  },
  productPrice: {
    fontFamily: fonts.secondary[600],
    fontSize: 11,
    color: '#e74c3c',
    marginBottom: 3,
  },
  stockText: {
    fontFamily: fonts.secondary[400],
    fontSize: 9,
    color: '#27ae60',
    marginBottom: 2,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#27ae60',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadge2: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4c5df3ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: fonts.secondary[600],
    fontSize: 8,
    color: 'white',
  },
});
