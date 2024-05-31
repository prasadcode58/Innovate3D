import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { ref, listAll, getDownloadURL, getStorage } from "firebase/storage";
import { useNavigate, Link } from "react-router-dom";
import "./cssFiles/ProfilePage.css";
import siteLogo from "./assets/GlobalAssets/siteLogo.png";
import backIcon from "./assets/GlobalAssets/back_icon.png";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const storage = getStorage();

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

  useEffect(() => {
    const fetchPost = async () => {
      if (!user?.uid) {
        return;
      }
      try {
        const fileFolderRef = ref(storage, `${user.uid}/profile/`);
        const postFolders = await listAll(fileFolderRef);
        if (postFolders.items.length === 0) return;
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };
    fetchPost();
  }, [user, storage]);

  useEffect(() => {
    const fetchBio = async () => {
      if (!user?.uid) {
        return;
      }
      try {
        const bioFolderRef = ref(storage, `${user.uid}/profile/bio`);
        const bioFolders = await listAll(bioFolderRef);
        if (bioFolders.items.length === 0) return;
        const bioUrl = await getDownloadURL(bioFolders.items[0]);

        setData({ bioUrl, text: "" });

        const response = await fetch(bioUrl);
        const text = await response.text();

        setData({ bioUrl, text });
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };
    fetchBio();
  }, [user, storage]);

  const navigate = useNavigate();

  const handleChange = () => {
    navigate("/editprofile");
  };

  return (
    <div class="profile_wrapper">
      <div class="profile_content_container">
        <button id="profile_back_btn">
          <Link to={"/explore"}>
            <img src={backIcon} />
          </Link>
        </button>

        <div class="login_logo_set">
          <img id="login_site_logo" src={siteLogo}></img>
          <h3 id="login_logo_text">INNOVATE 3D</h3>
        </div>

        <div class="profile_main_container">
          <div class="profile_upper_half">
            <div class="profile_upper_left">
              <div class="profile_image_sec">
                <img
                  id="profile_pic"
                  src={user?.photoURL}
                  alt="Profile Image"
                />
              </div>
            </div>
            <div class="profile_upper_right">
              <h3 id="profile_user_id_sec">@{user?.displayName}</h3>
              <p id="profile_about_user_sec">{data?.text}</p>
              <div class="profile_btns">
                <button id="share_profile_btn">Share</button>
                <button id="edit_profile_btn" onClick={handleChange}>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          <div class="profile_lower_half"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;