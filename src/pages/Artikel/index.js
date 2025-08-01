import {View, Text, ScrollView, Image, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {colors, fonts} from '../../utils';
import {MyHeader} from '../../components';
import axios from 'axios';
import {apiURL, webURL} from '../../utils/localStorage';
import {useIsFocused} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {Linking} from 'react-native';

export default function Artikel({navigation}) {
  // Data artikel dalam bentuk array dengan konten lengkap
  const [artikelData, setData] = useState([]);

  // Fungsi untuk handle navigasi ke detail artikel
  const handleArtikelPress = artikel => {
    navigation.navigate('DetailArtikel', {
      artikel,
      title: artikel.title,
    });
  };

  const getTransaksi = () => {
    try {
      setLoading(true);
      axios
        .post(apiURL + 'listdata', {
          modul: 'artikel',
        })
        .then(res => {
          console.log(res.data);
          setData(res.data);
        });
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getTransaksi();
    }
  }, [isFocused]);
  const [loading, setLoading] = useState(false);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
      }}>
      <MyHeader title="Artikel" />

      <ScrollView>
        <View style={{padding: 20}}>
          {/* List Artikel menggunakan map */}
          {artikelData.map(artikel => (
            <TouchableOpacity
              key={artikel.id}
              style={{marginBottom: 20}}
              onPress={() => {
                handleArtikelPress(artikel);
                // Linking.openURL(webURL + artikel.foto);
              }}
              activeOpacity={0.7}>
              <View
                style={{
                  padding: 20,
                  borderRadius: 20,
                  backgroundColor: colors.primary,
                  height: 250,
                }}>
                <View>
                  <FastImage
                    style={{
                      width: '100%',
                      height: 150,
                      borderRadius: 10,
                    }}
                    source={{
                      uri: webURL + artikel.foto,
                    }}
                  />
                </View>

                <View>
                  <Text
                    style={{
                      fontFamily: fonts.primary[500],
                      color: colors.white,
                      textAlign: 'left',
                      fontSize: 13,
                      marginTop: 20,
                    }}>
                    {artikel.judul}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
