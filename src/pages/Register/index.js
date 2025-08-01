import {View, Text, ScrollView, Image} from 'react-native';
import React from 'react';
import {colors, fonts, windowWidth} from '../../utils';
import {useToast} from 'react-native-toast-notifications';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import {MyButton, MyGap, MyInput} from '../../components';
import {useState} from 'react';
import SoundPlayer from 'react-native-sound-player';
import axios from 'axios';
import {apiURL, storeData} from '../../utils/localStorage';
import MyLoading from '../../components/MyLoading';
import {TouchableOpacity} from 'react-native';
export default function Register({navigation, route}) {
  const [kirim, setKirim] = useState({
    nama_lengkap: '',
    username: '',
    password: '',
  });

  const toast = useToast();
  const updateKirim = (x, v) => {
    setKirim({
      ...kirim,
      [x]: v,
    });
  };
  const [loading, setLoading] = useState(false);
  const sendData = () => {
    if (kirim.username.length == 0) {
      toast.show('Username masih kosong !');
    } else if (kirim.nama_lengkap.length == 0) {
      toast.show('Nama Lengkap masih kosong !');
    } else if (kirim.password.length == 0) {
      toast.show('Kata sandi masih kosong !');
    } else {
      console.log(kirim);
      setLoading(true);
      axios.post(apiURL + 'register', kirim).then(res => {
        console.log(res.data);
        setTimeout(() => {
          setLoading(false);
          toast.show(res.data.message, {type: 'success'});
          navigation.navigate('Login');
        }, 700);
      });
    }
  };
  return (
    <View
      style={{flex: 1, backgroundColor: colors.white, flexDirection: 'column'}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            marginTop: 0,
          }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{
              width: 200,
              height: 200,
            }}
          />
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            backgroundColor: colors.white,
            paddingHorizontal: 20,
            marginTop: 20,
          }}>
          <Text
            style={{
              marginBottom: 20,
              fontFamily: fonts.secondary[800],
              fontSize: 30,
            }}>
            Daftar
          </Text>

          <MyInput
            value={kirim.nama_lengkap}
            onChangeText={x => updateKirim('nama_lengkap', x)}
            label="Nama Lengkap"
            placeholder="Masukan nama lengkap"
            iconname="person-outline"
          />

          <MyInput
            value={kirim.username}
            onChangeText={x => updateKirim('username', x)}
            label="Username"
            placeholder="Masukan username"
            iconname="at"
          />

          <MyInput
            value={kirim.password}
            onChangeText={x => updateKirim('password', x)}
            label="Kata Sandi"
            placeholder="Masukan kata sandi"
            iconname="lock-closed-outline"
            secureTextEntry
          />
          <MyGap jarak={20} />
          {!loading && <MyButton onPress={sendData} title="DAFTAR" />}
          {loading && <MyLoading />}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{
              marginTop: 10,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 15,
            }}>
            <Text
              style={{
                fontFamily: fonts.secondary[600],
                fontSize: 14,
              }}>
              Sudah punya akun ?{' '}
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: fonts.secondary[800],
                }}>
                Masuk disini
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
