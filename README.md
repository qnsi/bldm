npx expo prebuild --platform ios
npx expo prebuild --platform android

## build apk

eas build -p android --profile preview --local

## supabase

generate types:
`npx supabase gen types typescript --local > database.types.ts`
