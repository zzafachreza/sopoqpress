import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {colors, fonts, windowWidth} from '../../utils';
import {MyHeader} from '../../components';
import {ScrollView} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import {apiURL, MYAPP, webURL} from '../../utils/localStorage';
import axios from 'axios';
import RenderHtml from 'react-native-render-html';
import {Alert} from 'react-native';
import {ToastProvider, useToast} from 'react-native-toast-notifications';
export default function BukuDetail({navigation, route}) {
  // Get book data from navigation params
  const systemFonts = [fonts.secondary[600], fonts.secondary[600]];
  const {product} = route.params || {
    product: {
      id: 1,
      judul_buku: 'Atomic Habits',
      harga: 89000,
      penulis: 'James Clear',
      penerbit: 'Gramedia Pustaka Utama',
      tahun_terbit: 2019,
      deskripsi:
        'Panduan praktis membangun kebiasaan baik dan menghilangkan kebiasaan buruk.',
      cover_buku:
        'https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=300&h=400&fit=crop&q=80',
      kategori: 'Self Development',
      halaman: 352,
      stok: 18,
      rating: 4.9,
      status: 'tersedia',
    },
  };

  const handleBuyNow = () => {
    navigation.navigate('CheckOut', {product}); // Kirim book data ke Checkout
  };

  const [comp, setComp] = useState({});
  const [loading, setLoading] = useState(true);

  const getCompany = () => {
    axios
      .post(apiURL + 'company')
      .then(res => {
        console.log(res.data);
        setComp(res.data);
      })
      .catch(error => {
        console.log('Error fetching company:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Set timeout untuk menghindari loading terlalu lama
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    getCompany();

    return () => clearTimeout(timer);
  }, []);

  const openWhatsApp = () => {
    const message = `Halo, saya tertarik dengan buku "${
      product.judul_buku
    }" karya ${product.penulis} (${formatPrice(
      product.harga,
    )}). Bisa dibantu untuk pembelian?`;
    const newLocal = Linking.openURL(
      `https://wa.me/${comp.tlp}&text=${encodeURIComponent(message)}`,
    );
    console.log(
      `whatsapp://send?phone=${comp.tlp}&text=${encodeURIComponent(message)}`,
    );
  };

  const formatPrice = price => {
    return `Rp ${new Intl.NumberFormat('id-ID').format(price)}`;
  };

  const renderRatingStars = rating => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={16} color="#f39c12" />);
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half" size={16} color="#f39c12" />,
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color="#f39c12"
        />,
      );
    }

    return stars;
  };

  const toast = useToast();

  return (
    <View style={styles.container}>
      <MyHeader title="Detail Buku" onPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Book Cover */}
        <View style={styles.imageContainer}>
          <FastImage
            source={{
              uri:
                webURL + product.cover ||
                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&q=80',
            }}
            style={styles.productImage}
            resizeMode="cover"
            priority={FastImage.priority.high}
          />
        </View>

        {/* Book Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.judul_buku}</Text>
          <Text style={styles.authorName}>oleh {product.penulis}</Text>
          <Text style={styles.productPrice}>{formatPrice(product.harga)}</Text>

          {/* Rating */}

          <Text style={styles.productName}>{product.tipe}</Text>

          {product.tipe == 'Digital' && (
            <TouchableOpacity
              onPress={() => Linking.openURL(product.link_buku)}
              style={styles.ratingContainer}>
              <Text style={styles.ratingText}>Download Buku Digital</Text>
            </TouchableOpacity>
          )}

          {/* Stock Info */}
          <View style={styles.stockContainer}>
            <Icon name="library" size={20} color={colors.primary} />
            <Text style={styles.stockText}>Stok: {product.stok}</Text>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deskripsi Buku</Text>
            <RenderHtml
              tagsStyles={{
                p: {
                  fontFamily: fonts.secondary[600],
                  textAlign: 'justify',
                  lineHeight: 26,
                },
                div: {
                  fontFamily: fonts.secondary[600],
                  textAlign: 'justify',
                  lineHeight: 26,
                },
              }}
              systemFonts={systemFonts}
              contentWidth={windowWidth}
              source={{
                html: product.deskripsi,
              }}
            />
          </View>

          {/* Book Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detail Buku</Text>
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Icon name="person" size={16} color={colors.dark} />
                <Text style={styles.detailLabel}>Penulis:</Text>
                <Text style={styles.detailText}>{product.penulis}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="business" size={16} color={colors.dark} />
                <Text style={styles.detailLabel}>Penerbit:</Text>
                <Text style={styles.detailText}>{product.penerbit}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="calendar" size={16} color={colors.dark} />
                <Text style={styles.detailLabel}>Tahun Terbit:</Text>
                <Text style={styles.detailText}>{product.tahun}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="document-text" size={16} color={colors.dark} />
                <Text style={styles.detailLabel}>Halaman:</Text>
                <Text style={styles.detailText}>{product.halaman} halaman</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="bookmark" size={16} color={colors.dark} />
                <Text style={styles.detailLabel}>Kategori:</Text>
                <Text style={styles.detailText}>{product.kategori}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => {
            Alert.alert(MYAPP, 'Apakah kamu yakin akan hapus ini ?', [
              {
                text: 'TIDAK',
              },
              {
                text: 'Ya, HAPUS',
                onPress: () => {
                  axios
                    .post(apiURL + 'delete', {
                      modul: 'buku',
                      id: product.id_buku,
                    })
                    .then(res => {
                      if (res.data.status == 200) {
                        toast.show(res.data.message, {
                          type: 'success',
                        });
                        navigation.goBack();
                      }
                    });
                },
              },
            ]);
          }}>
          <Icon name="trash-outline" size={20} color={colors.danger} />
          <Text style={styles.helpButtonText}>Hapus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={() =>
            navigation.replace('ShowWeb', {
              link: webURL + 'buku/edit2/' + product.id_buku,
              judul: 'Edit Buku',
            })
          }>
          <Text style={styles.buyButtonText}>Edit </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  imageContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.white,
    position: 'relative',
    zIndex: 1,
  },
  productImage: {
    width: 200,
    height: 280,
    borderRadius: 15,
    shadowColor: '#000',

    marginTop: 20, // Add margin to give space for badge above
    zIndex: 1,
  },
  statusBadge: {
    position: 'absolute',
    top: 10, // Changed from 30 to 0 to position at the very top
    right: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10, // Ensure it's above other elements
  },
  availableBadge: {
    backgroundColor: '#27ae60',
  },
  unavailableBadge: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    fontFamily: fonts.secondary[600],
    fontSize: 12,
    color: 'white',
  },
  infoContainer: {
    padding: 20,
    paddingTop: 0,
  },
  productName: {
    fontFamily: fonts.secondary[700],
    fontSize: 24,
    color: colors.dark,
    marginBottom: 5,
    textAlign: 'center',
  },
  authorName: {
    fontFamily: fonts.secondary[500],
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  productPrice: {
    fontFamily: fonts.secondary[700],
    fontSize: 22,
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff8e7',
    borderRadius: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontFamily: fonts.secondary[600],
    fontSize: 14,
    color: '#f39c12',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  stockText: {
    fontFamily: fonts.secondary[600],
    fontSize: 14,
    color: colors.dark,
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.secondary[700],
    fontSize: 18,
    color: colors.dark,
    marginBottom: 12,
  },
  productDescription: {
    fontFamily: fonts.secondary[400],
    fontSize: 14,
    color: colors.dark,
    lineHeight: 22,
    textAlign: 'justify',
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontFamily: fonts.secondary[600],
    fontSize: 13,
    color: colors.dark,
    marginLeft: 8,
    minWidth: 80,
  },
  detailText: {
    fontFamily: fonts.secondary[400],
    fontSize: 13,
    color: colors.dark,
    marginLeft: 8,
    flex: 1,
  },
  rulesContainer: {
    backgroundColor: '#f0f8f0',
    padding: 15,
    borderRadius: 10,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleText: {
    fontFamily: fonts.secondary[400],
    fontSize: 13,
    color: colors.dark,
    marginLeft: 8,
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  helpButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    marginRight: 10,
  },
  helpButtonText: {
    fontFamily: fonts.secondary[600],
    fontSize: 14,
    color: colors.danger,
    marginLeft: 8,
  },
  buyButton: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  buyButtonText: {
    fontFamily: fonts.secondary[700],
    fontSize: 16,
    color: colors.white,
  },
});
