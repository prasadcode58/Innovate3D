import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { useNavigate, Link } from "react-router-dom";
import "./cssFiles/Login.css";

import loginVid from "./assets/LoginPageAssets/tree.mp4";
import welcomeVid from "./assets/WelcomePageAssets/Welcome.mp4";

import siteLogo from "./assets/GlobalAssets/siteLogo.png";

// import { Link } from "react-router-dom";

const firebaseConfig = {
  apiKey: "AIzaSyC15DIGHXbAg5ukhTBy0TG3wHIlceTXiLY",
  authDomain: "ieee-40444.firebaseapp.com",
  projectId: "ieee-40444",
  storageBucket: "ieee-40444.appspot.com",
  messagingSenderId: "269534527954",
  appId: "1:269534527954:web:2173bdaf3222c3ce0f080b",
};

firebase.initializeApp(firebaseConfig);

const Login = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if the user is already signed in
    const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      setError(error.message);
    }
    navigate("/login");
  };

  const signIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
    navigate("/login");
  };

  const navigate = useNavigate();

  const handleSharing = () => {
    navigate("/upload");
  };

  const handleExplore = () => {
    navigate("/explore");
  };

  const signOut = () => {
    firebase.auth().signOut();
  };

  return (
    <div>
      {user ? (
        <div className="welcome_wrapper">
          <div class="login_logo_set">
            <img id="login_site_logo" src={siteLogo}></img>
            <h3 id="login_logo_text">INNOVATE 3D</h3>
          </div>

          <button id="welcome_logout_btn" onClick={signOut}>
            Log out
          </button>

          <video src={welcomeVid} autoPlay loop muted />

          <div className="welcome_container">
            <p id="welcome_text">WELCOME</p>
            <p id="welcome_username">{user.displayName} !</p>
            <button id="welcome_explore_btn" onClick={handleExplore}>
              Let's Go Into 3D World
            </button>
            <button id="welcome_share_btn" onClick={handleSharing}>
              Share Your Creation
            </button>
          </div>
        </div>
      ) : (
        <div className="login_wrapper">
          <div class="login_logo_set">
            <img id="login_site_logo" src={siteLogo}></img>
            <h3 id="login_logo_text">INNOVATE 3D</h3>
          </div>

          <video src={loginVid} autoPlay loop muted />

          <div className="login_container">
            <h2 id="login_heading">Login</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div id="login_form">
              <div>
                <h4 class="login_top_headings">Email</h4>
                <input
                  className="login_input_fields"
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <h4 class="login_top_headings">Password</h4>
                <input
                  className="login_input_fields"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button id="login_btn" onClick={handleLogin}>
                Login
              </button>
            </div>

            <h4 id="forget_password_btn">
              Forget password ?
              <Link
                to={"/forgetPassword"}
                style={{ textDecoration: "none", color: "#F2B500" }}
              >
                {" "}
                Click here
              </Link>
            </h4>

            <div id="line_above_google_auth_login"></div>

            <button id="login_with_google_btn" onClick={signIn}>
              Sign In with Google
            </button>

            <h4 id="signup_direct_text">
              Don't have an account?{" "}
              <Link
                to={"/register"}
                style={{ textDecoration: "none", color: "#F2B500" }}
              >
                Signup
              </Link>
            </h4>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
