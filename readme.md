### Friendly Games with Next.js + Firebase

A video game review application built with Next.js and Firebase.

#### Run the application

1. In your terminal, run:

```sh
firebase emulators:start --project demo-codelab-nextjs
```

2. Copy the file `lib/firebase/config-copy.js` to `lib/firebase/config.js` and fill in the values from the Firebase console.

3. In a new terminal tab/window, run:

```sh
npm i
npm run dev
```

4. In your browser, open the URL: `http://localhost:3000`

#### Use the application

1. While on `http://localhost:3000/` within your browser, click the "Sign in" button in the top right corner and sign in.
2. In the dropdown menu in the top right menu, select "Add sample games".

#### Features

- Browse video games with filters for genre, platform, and price
- View detailed game pages with reviews
- Add your own reviews with star ratings
- AI-powered review summaries using Google Gemini
- Real-time updates powered by Firebase Firestore
