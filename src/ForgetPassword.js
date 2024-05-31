// ForgotPassword.js
import React, { useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { Link } from "react-router-dom";

import "./cssFiles/ForgetPassword.css";

import forgetVid from "./assets/ForgetScreenAssets/forget.mp4";

import siteLogo from "./assets/GlobalAssets/siteLogo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [error, setError] = useState(null);

  const handleResetPassword = async () => {
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      setResetEmailSent(true);
      setError(null);
    } catch (error) {
      setResetEmailSent(false);
      setError(error.message);
    }
  };

  return (
    // <div>
    //   <h2>Forgot Password</h2>
    //   {resetEmailSent ? (
    //     <p>An email with instructions to reset your password has been sent to your email address. <Link style={{textDecoration: "none"}} to={'/login'}>Login...</Link></p>
    //   ) : (
    //     <div>
    //       <p>Enter your email address to reset your password:</p>
    //       <input
    //         type="email"
    //         placeholder="Enter Email"
    //         value={email}
    //         onChange={(e) => setEmail(e.target.value)}
    //       />
    //       {error && <p style={{ color: "red" }}>{error}</p>}
    //       <button onClick={handleResetPassword}>Reset Password</button>
    //     </div>
    //   )}
    // </div>

    <div className="forget_wrapper">

        <div class="forget_logo_set">
          <img id="forget_site_logo" src={siteLogo}></img>
          <h3 id="forget_logo_text">INNOVATE 3D</h3>
        </div>


      <video src= {forgetVid} autoPlay loop muted />
      
    

      <div className="forget_container">

        <h2 id="forget_heading">Forget Password</h2>
        
        {resetEmailSent ? (
          <div id="reset_msg_form">
            <p id="reset_message">An email with instructions to reset your password has been sent to your email address. </p>
            <h4 id="login_direct_text">Done resetting ? 
            <Link to={'/login'} style={{textDecoration: "none", color: "#F2B500"}}> Login here</Link></h4>
          </div>
        ) : (
        <div id="forget_form">
        <div>
            <h4 class="forget_top_headings">Email</h4>
            
            <input className="forget_input_fields"
               type="email"
               placeholder="Enter Email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          

          {error && <p style={{ color: "red", fontFamily: "gilroyBold" }}>{error}</p>}
          <button id="reset_password_btn" onClick={handleResetPassword}>Reset Password</button>

        </div>

        )}

      </div>

    </div>
  );
};

export default ForgotPassword;
