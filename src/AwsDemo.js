import React, { useEffect, useState } from 'react';
import { Button, Clipboard, Platform, ScrollView, Text, View } from 'react-native';
import { Settings } from 'react-native-fbsdk-next';
import { LoginManager, AccessToken, MessageDialog } from 'react-native-fbsdk-next';
import { Amplify, Auth, Hub, JS } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { Authenticator, withOAuth } from 'aws-amplify-react-native/dist/Auth';
// https://us-east-2_JtS2u9OHo/oauth2/idpresponse
import appleAuth, { AppleButton } from '@invertase/react-native-apple-authentication';
import jwt_decode from "jwt-decode";
const AwsDemo = (props) => {
    console.log("withOAuth props", props);
    const {
        oAuthUser,
        oAuthError,
        hostedUISignIn,
        facebookSignIn,
        googleSignIn,
        amazonSignIn,
        customProviderSignIn,
        signOut,
    } = props;

    const [user, setUser] = useState(null);

    useEffect(() => {
        let token = "EAAQNxkWnZAsMBAG2AyIWtfL8tvm8tZA0XXaNT7Mri5YLum7fBJfy7gCvyySYSQLOHQGjZARCZB60JdM9eeahfcVrA1gu7TwsTZAI4KT8wMflzsWxpC2QpR8sSrkYj6Xg7oDYZCiwVZCADoFgQgVa3hSS6TG3OmEtWXoZBAIdZAERTmFl1W35vdVX2ZAqwc8TMGNdLpjzfOmPhZAM5hZCDOsdPB2uW9XJUzTZCsg90JvjH5Ww36tujaZAKCpDZAd";
        // var decoded = jwt_decode(token);
        // console.log('devodedD: ', decoded);

        Settings.initializeSDK();

        Hub.listen('auth', ({ payload: { event, data } }) => {
            console.log("event :", event);
            console.log("data :", data);
            switch (event) {
                case 'signIn':
                case 'cognitoHostedUI':
                    getUser().then(userData => {
                        setUser(userData)
                        Clipboard.setString(JSON.stringify(userData))
                    });
                    break;
                case 'signOut':
                    setUser(null);
                    break;
                case 'signIn_failure':
                case 'cognitoHostedUI_failure':
                    console.log('Sign in failure', data);
                    break;
            }
        });

        getUser().then(userData => setUser(userData));
    }, []);

    function getUser() {
        return Auth.currentAuthenticatedUser()
            .then(userData => userData)
            .catch(() => console.log('Not signed in'));
    }

    const FacebookLogin = async () => {
        try {
            // Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Facebook })
            Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Facebook }).then((res) => {
                console.log("erresror::federatedSignIn", res);
            }).catch((error) => {
                console.log("error::", error);
            })
        } catch (error) {
            console.log("error::", error);
        }
    }
    const FacebookLoginWay2 = async () => {

        try {
            if (Platform.OS == "android") {
                LoginManager.setLoginBehavior('native_with_fallback');
            }
            else {
                LoginManager.setLoginBehavior("browser")
            }

            const result = await LoginManager.logInWithPermissions([
                'email',
                'public_profile',
            ]);
            console.log("result::", result);

            if (result.isCancelled) {
                throw 'User cancelled the login process';
            }

            const data = await AccessToken.getCurrentAccessToken();

            console.log("Data::", data);
            // sign in with federated identity
            Auth.federatedSignIn('facebook', { token: data.accessToken, expires_at: data.expirationTime })
                .then(credentials => {
                    console.log('get aws credentials', credentials);
                }).catch(e => {
                    console.log(e);
                });
        } catch (error) {
            console.log("error::", error);

        }
    }
    console.log("userdata :", user);

    async function onAppleButtonPress() {
        // performs login request

        // try {
        //     // Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Facebook })
        //     Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.A }).then((res) => {
        //         console.log("erresror::federatedSignIn", res);
        //     }).catch((error) => {
        //         console.log("error::", error);
        //     })
        // } catch (error) {
        //     console.log("error::", error);
        // }

        // return;
        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            // Note: it appears putting FULL_NAME first is important, see issue #293
            requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        });
        console.log("appleAuthRequestResponse ::", appleAuthRequestResponse);
        // get current authentication state for user
        // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
        const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

        // use credentialState response to ensure the user is authenticated
        if (credentialState === appleAuth.State.AUTHORIZED) {
            // user is authenticated
            const { email, email_verified, is_private_email, sub } = jwt_decode(appleAuthRequestResponse.identityToken)

        }
    }

    const onPressAppleWithAws = () => {
        try {
            // Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Facebook })
            Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Apple }).then((res) => {
                console.log("erresror::federatedSignIn", res);
            }).catch((error) => {
                console.log("error::", error);
            })
        } catch (error) {
            console.log("error::", error);
        }
    }

    return (
        <View style={{
            flex: 1, backgroundColor: "white",
        }}>
            <ScrollView contentContainerStyle={{ paddingVertical: 50 }}>
                <Button title='Login with facebook' onPress={FacebookLogin} />
                <Button title='Login with facebook 2' onPress={FacebookLoginWay2} />
                {/* <Button title="Facebook Login 3" onPress={facebookSignIn} /> */}

                {/* {
                    user ?
                        <Text style={{ color: "black", paddingVertical: 30 }}>{JSON.stringify(user)}</Text>
                        : null
                } */}
                <AppleButton
                    buttonStyle={AppleButton.Style.BLACK}
                    buttonType={AppleButton.Type.CONTINUE}
                    style={{
                        width: 200, // You must specify a width
                        height: 50, // You must specify a height
                        alignSelf: "center",
                        marginTop: 50,
                    }}
                    cornerRadius={50}
                    // onPress={() => onAppleButtonPress()}
                    onPress={onPressAppleWithAws}
                />
            </ScrollView>
        </View>
    )
}

export default withOAuth(AwsDemo);
