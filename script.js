// script.js

// === Form toggle ===
const forms = document.querySelector(".forms"),
  pwShowHide = document.querySelectorAll(".eye-icon"),
  links = document.querySelectorAll(".link");

pwShowHide.forEach(eyeIcon => {
  eyeIcon.addEventListener("click", () => {
    let pwFields = eyeIcon.parentElement.parentElement.querySelectorAll(".password");
    pwFields.forEach(password => {
      if (password.type === "password") {
        password.type = "text";
        eyeIcon.classList.replace("bx-hide", "bx-show");
        return;
      }
      password.type = "password";
      eyeIcon.classList.replace("bx-show", "bx-hide");
    });
  });
});

links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    forms.classList.toggle("show-signup");
  });
});

// === Firebase Setup ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyDwJnXHz89BExap-LPyX1xEc3dRD7ar5a4",
  authDomain: "neat-pagoda-412310.firebaseapp.com",
  databaseURL: "https://neat-pagoda-412310-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "neat-pagoda-412310",
  storageBucket: "neat-pagoda-412310.firebasestorage.app",
  messagingSenderId: "606835868303",
  appId: "1:606835868303:web:47fb7d7cd8a5db089466fa",
  measurementId: "G-EGC4866KWC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// === Auto Redirect if Logged In ===
onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    window.location.href = "home.html"; // Already logged in → Go to home
  }
});

// === Signup ===
const signupBtn = document.querySelector(".signup button");
signupBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.querySelector(".signup .input").value;
  const password = document.querySelectorAll(".signup .password")[0].value;
  const confirm = document.querySelectorAll(".signup .password")[1].value;

  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    await sendEmailVerification(user);

    await set(ref(db, "users/" + user.uid), {
      email: user.email,
      createdAt: Date.now(),
      verified: false
    });

    alert("Signup successful! Check your email for verification.");
    forms.classList.remove("show-signup");
  } catch (err) {
    alert(err.message);
  }
});

// === Login ===
const loginBtn = document.querySelector(".login button");
loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.querySelector(".login .input").value;
  const password = document.querySelector(".login .password").value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    await user.reload();

    if (!user.emailVerified) {
      alert("Please verify your email first!");
      await signOut(auth);
      return;
    }

    // Mark user online
    const userRef = ref(db, "presence/" + user.uid);
    await set(userRef, {
      email: user.email,
      isOnline: true,
      lastSeen: Date.now()
    });
    onDisconnect(userRef).update({ isOnline: false, lastSeen: Date.now() });

    alert("Login successful ✅");
    window.location.href = "home.html"; // Redirect to main page
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

