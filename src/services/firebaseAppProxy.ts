import * as realFirebaseApp from 'firebase/app'
import type { FirebaseApp, FirebaseOptions, FirebaseAppSettings } from 'firebase/app'
import { getSystemConfigSync } from './systemConfig'

export * from 'firebase/app'

export function initializeApp(
  options?: FirebaseOptions,
  configOrName?: FirebaseAppSettings | string
): FirebaseApp {
  const isCustomTestApp =
    typeof configOrName === 'string' && configOrName.startsWith('__sonai_test_')

  if (isCustomTestApp && options) {
    return realFirebaseApp.initializeApp(options, configOrName)
  }

  const sysFb = getSystemConfigSync().firebase
  const mergedOptions: FirebaseOptions = {
    ...(options || {}),
    ...(sysFb.apiKey ? { apiKey: sysFb.apiKey } : {}),
    ...(sysFb.authDomain ? { authDomain: sysFb.authDomain } : {}),
    ...(sysFb.databaseURL ? { databaseURL: sysFb.databaseURL } : {}),
    ...(sysFb.projectId ? { projectId: sysFb.projectId } : {}),
    ...(sysFb.storageBucket ? { storageBucket: sysFb.storageBucket } : {}),
    ...(sysFb.messagingSenderId ? { messagingSenderId: sysFb.messagingSenderId } : {}),
    ...(sysFb.appId ? { appId: sysFb.appId } : {}),
    ...(sysFb.measurementId ? { measurementId: sysFb.measurementId } : {})
  }

  if (configOrName !== undefined) {
    return realFirebaseApp.initializeApp(mergedOptions, configOrName as any)
  }
  return realFirebaseApp.initializeApp(mergedOptions)
}
