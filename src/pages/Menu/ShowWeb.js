import {View, Text, ScrollView, StyleSheet, Image, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import {colors, fonts, windowWidth} from '../../utils';
import {MyButton, MyHeader} from '../../components';
import axios from 'axios';
import {apiURL, MYAPP, webURL} from '../../utils/localStorage';
import RenderHTML from 'react-native-render-html';
import WebView from 'react-native-webview';
import {showMessage} from 'react-native-flash-message';
import {useToast} from 'react-native-toast-notifications';
export default function ShowWeb({navigation, route}) {
  const item = route.params;
  const toast = useToast();
  console.log(item);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
      }}>
      <MyHeader title={!item.judul ? 'Lihat Web / Video' : item.judul} />
      <View
        style={{
          flex: 1,
        }}>
        <WebView
          onMessage={event => {
            if (event.nativeEvent.data === 'success') {
              toast.show('Data berhasil disimpan !', {
                type: 'success',
              });

              navigation.goBack();
            } else if (event.nativeEvent.data === 'success_edit') {
              toast.show('Data berhasil diedit !', {
                type: 'success',
              });
              navigation.pop(2);
            } else if (event.nativeEvent.data === 'duplikasi') {
              toast.show('Data nomor ktp tidak boleh sama !', {
                type: 'error',
              });
              navigation.goBack();
            }
          }}
          source={{
            uri: item.link,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
