import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./cssFiles/EditProfile.css";
import { ref, listAll, getDownloadURL, getStorage } from "firebase/storage";
import siteLogo from "./assets/GlobalAssets/siteLogo.png";

import backIcon from "./assets/GlobalAssets/back_icon.png";

const EditProfile = () => {
  const [user, setUser] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  // const [newUsername, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();
  const storage = getStorage();
  const [data, setData] = useState(null);

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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setNewPhoto(file);
  };

  const handleUsernameChange = (e) => {
    const username = e.target.value;
    setNewUsername(username);
  };

  const uploadNewPhoto = async () => {
    if (newPhoto) {
      const storageRef = firebase.storage().ref(`${user?.uid}/profilePhoto`);
      const snapshot = await storageRef.put(newPhoto);

      // Get the URL of the uploaded photo
      const photoURL = await snapshot.ref.getDownloadURL();
      // const username = await user?.displayName;

      // Update the user's photoURL in Firebase Auth
      await user?.updateProfile({
        photoURL,
      });

      // Update the user's profile data in Firestore if you are using Firestore
      // Example: await firebase.firestore().collection('users').doc(user.uid).update({ photoURL });
    }

    navigate("/editprofile");

    alert("Profile changed successfully");
  };

  const handleBioChange = (e) => {
    const bio = e.target.value;
    setBio(bio);
    console.log(bio);
  };
  const updateBio = () => {
    const bioRef = firebase.storage().ref(`${user.uid}/profile//bio/bio.txt`);
    const bioUploadTask = bioRef.putString(bio);
    bioUploadTask.on(
      "state_changed",
      () => {},
      (error) => {
        console.error(error);
      }
    );
    alert("Bio updated Successfully");
  };

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

  const updateUsername = async () => {
    try {
      await user?.updateProfile({
        displayName: newUsername, // Use displayName to update the username
      });

      navigate("/editprofile");

      alert("Username Changed Successfully");
    } catch (error) {
      console.error("Error updating username:", error);
    }
  };

  const handleSave = () => {
    navigate("/profile");
  };

  return (
    // <div >
    //

    //   <br />
    //   <input
    //     type="text"
    //     placeholder={user?.displayName}
    //     value={newUsername}
    //     onChange={handleUsernameChange}
    //   />
    //   <button onClick={updateUsername}>Update Username</button>
    //   <p>{user?.displayName}</p>
    //   <p>{user?.email}</p>
    //     <button onClick={handleSave}>Save</button>
    // </div>

    <div class="edit_prof_wrapper">
      <div class="edit_prof_container">
        <button id="edit_prof_back_btn">
          <Link to={"/profile"}>
            <img src={backIcon} />
          </Link>
        </button>

        <div class="login_logo_set">
          <img id="login_site_logo" src={siteLogo}></img>
          <h3 id="login_logo_text">INNOVATE 3D</h3>
        </div>

        <div class="edit_prof_main_container">
          <div class="edit_prof_upper_half">
            <div class="edit_prof_upper_left">
              <div class="edit_prof_image_sec">
                <img
                  id="edit_prof_pic"
                  src={user?.photoURL}
                  alt="Profile Image"
                />
              </div>

              <div id="edit_pic_btns">
                <input
                  id="edit_prof_pic_choose"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                <label for="edit_prof_pic_choose">Select image</label>
                <button id="save_prof_image_btn" onClick={uploadNewPhoto}>
                  Save Image
                </button>
              </div>
            </div>
            <div class="edit_prof_upper_right">
              <input
                id="edit_prof_user_id_sec"
                type="text"
                placeholder={user?.displayName}
                value={newUsername}
                onChange={handleUsernameChange}
              />
              <button id="edit_prof_user_id_save" onClick={updateUsername}>
                Update Username
              </button>

              <input
                id="prof_user_bio"
                type="text"
                placeholder="Let everyone know who you are..."
                onChange={handleBioChange}
              />

              <button id="bio_save_btn" onClick={updateBio}>
                Update Bio
              </button>
            </div>
          </div>

          <div class="edit_prof_lower_half">
            <button id="prof_save_btn" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
