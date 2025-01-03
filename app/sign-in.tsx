import icons from '@/constants/icons';
import images from '@/constants/images';
import { login } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-povider';
import { Redirect } from 'expo-router';
import * as React from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignIn = () => {
  const { isLoggedIn, loading, refetch } = useGlobalContext();
  if(!loading && isLoggedIn) return <Redirect href="/"/>
  const handleLogin = async () => {
    const result = await login();
    if (result) {
      console.log("Loginn Succes")
      refetch();
    } else {
      Alert.alert("Error", "Failed to login")
    }
  };
  return (
    <SafeAreaView className='bg-white flex-1'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Image source={images.onboarding} style={{
          width: '100%',
          height: '70%',
          resizeMode: 'stretch',
        }} resizeMode='contain' />
        <View className='px-10'>
          <Text className='text-base text-center uppercase font-rubik text-black-200'>Welcome to Restate</Text>
          <Text className='text-3xl font-rubik-bold text-bold-300 text-center mt-2'>Let's get you closer to {"\n"}
            <Text className='text-primary-300'>Your Ideal Home</Text>
          </Text>
          <Text className='text-lg font-rubik text-black-200 text-center mt-2'>Login to Restate with google</Text>
          <TouchableOpacity onPress={handleLogin} className='bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 my-3'>
            <View className='flex flex-row items-center justify-center'>
              <Image source={icons.google} className='w-5 h-5' resizeMode='contain' />
              <Text className='text-lg font-rubik-medium text-black-300 ml-2'>Continue with Google</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
