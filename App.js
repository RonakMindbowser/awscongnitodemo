import React from 'react';
import {
  Linking,
  View,
} from 'react-native';
import AwsDemo from './src/AwsDemo';

import { Amplify, Auth } from 'aws-amplify';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppBrowser from 'react-native-inappbrowser-reborn';

Amplify.configure({
  Auth: {

    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-east-2:ae6dc421-6bb3-416a-88c1-6b6ad72fe1e9',

    // REQUIRED - Amazon Cognito Region
    region: 'us-east-2',

    // OPTIONAL - Amazon Cognito Federated Identity Pool Region 
    // Required only if it's different from Amazon Cognito Region
    identityPoolRegion: 'us-east-2',

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'us-east-2_JtS2u9OHo',

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: '6uderp771defghsukkiuprv5mt',

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    // mandatorySignIn: false,

    // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
    // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
    // signUpVerificationMethod: 'code', // 'code' | 'link' 

    // OPTIONAL - Configuration for cookie storage
    // Note: if the secure flag is set to true, then the cookie transmission requires a secure protocol
    // cookieStorage: {
    //   // REQUIRED - Cookie domain (only required if cookieStorage is provided)
    //   domain: '.yourdomain.com',
    //   // OPTIONAL - Cookie path
    //   path: '/',
    //   // OPTIONAL - Cookie expiration in days
    //   expires: 365,
    //   // OPTIONAL - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
    //   sameSite: "strict" | "lax",
    //   // OPTIONAL - Cookie secure flag
    //   // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
    //   secure: true
    // },

    // OPTIONAL - customized storage object
    // storage: AsyncStorage,

    // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
    // authenticationFlowType: 'USER_PASSWORD_AUTH',

    // OPTIONAL - Manually set key value pairs that can be passed to Cognito Lambda Triggers
    // clientMetadata: { myCustomKey: 'myCustomValue' },

    // // OPTIONAL - Hosted UI configuration
    oauth: {
      domain: 'mbtravelritelocaldemo.auth.us-east-2.amazoncognito.com',
      // scope: ['email', 'public_profile'],
      scope: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin', 'phone'],
      redirectSignIn: 'awscongnitodemo://',
      redirectSignOut: 'awscongnitodemo://',
      responseType: 'code', // or 'token', note that REFRESH token will only be generated when the responseType is code
      // urlOpener: urlOpener,
    }
  }
});
async function urlOpener(url, redirectUrl) {
  await InAppBrowser.isAvailable();
  const { type, url: newUrl } = await InAppBrowser.openAuth(url, redirectUrl, {
    showTitle: true,
    enableUrlBarHiding: true,
    enableDefaultShare: false,
    ephemeralWebSession: false,
  });

  if (type === 'success') {
    Linking.openURL(newUrl);
  }
}

// You can get the current config object
const currentConfig = Auth.configure();
Amplify.configure(currentConfig);

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      <AwsDemo />
    </View>
  )
};

export default App;
