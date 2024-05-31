import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/storage";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import "./cssFiles/ExplorePage.css";

import siteLogo from "./assets/GlobalAssets/siteLogo.png";

import{IoIosArrowDown} from "react-icons/io";
import{PiBellRingingBold} from "react-icons/pi";
import{CgProfile} from "react-icons/cg";

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ExplorePage = () => {
  const [user, setUser] = useState(null);
  const storage = getStorage();
  const [allUrls, setAllUrls] = useState([]);
  const [parentFolderNames, setParentFolderNames] = useState([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [map, setMap] = useState({});
  //   const user = firebase.auth().currentUser;
  //   const uid = user.uid;

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
        const urls = [];
        const newMap = {};
        const names = [];
        const listRef = ref(storage, `${user.uid}/posts`);
        const postFolders = await listAll(listRef);
        // postFolders.prefixes.map(folderRef)
        const all = await Promise.all(
          postFolders.prefixes.map(async (folderRef) => {
            const thumbnailFolderRef = ref(folderRef, "thumbnail");
            const items = await listAll(thumbnailFolderRef);
            if (items.items.length > 0) {
              const url = await getDownloadURL(items.items[0]);

              // Extract and store the parent folder name
              const folderName = folderRef.name.split("/").pop();
              names.push(folderName);
              console.log(folderName);
              newMap[folderName] = url;
              return url;
            }
          })
        );
        setMap(newMap);
        setAllUrls(all);
        setParentFolderNames(names);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };
    fetchPost();
  }, [user, storage]);

  const navigate = useNavigate();
  const handlePageChange = () => {
    navigate("/upload");
  };

  const signOut = () => {
    firebase.auth().signOut();

    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div class="explore_wrapper">
      <div class="explore_nav">
        <div class="explore_left_options">
          <img id="explore_site_logo" src={siteLogo}></img>
          <h3 id="explore_logo_text">INNOVATE 3D</h3>
        </div>

        <div class="explore_right_options">
          <div class="explore_choose_btns">
            <button id="blog_btn">Blogs</button>
            <button id="learn_btn">Learn Design</button>
            <div class="dropdown">
              <button id="categories_btn">Categories <IoIosArrowDown /></button>
              <div class="dropdown-container">
                <a class="dropdown-option" href="#">
                  Option 1
                </a>
                <a class="dropdown-option" href="#">
                  Option 2
                </a>
                <a class="dropdown-option" href="#">
                  Option 3
                </a>
                <a class="dropdown-option" href="#">
                  Option 4
                </a>
                <a class="dropdown-option" href="#">
                  Option 5
                </a>
                <a class="dropdown-option" href="#">
                  Option 6
                </a>
              </div>
            </div>
          </div>

          <button id="explore_share_btn" onClick={handlePageChange}>Share Work</button>

          <button id="explore_logout_btn" onClick={signOut}>Log out</button>

          <div class="explore_choose_icons">
            <button id="explore_bell_icon"><PiBellRingingBold/></button>
            <button id="explore_profile_icon" onClick={handleProfileClick}>
            {user?.photoURL ? <img src={user?.photoURL} 
            style={{width:"2.5rem", height:"2.5rem", 
            borderRadius:"2rem", objectFit:"cover"}}/> : <CgProfile/> }</button>
          </div>
        </div>
      </div>

      <div className="explore_section">
        <div className="explore_model_showcase">
        {parentFolderNames.map((folderName, index) => {
            const url = map[folderName];
            return (
              <div key={index}>
                <div className="explore_model_card">
                  <Link to={`/main/${folderName}`}>
                    <img
                      id="thumbnail_img"
                      src={url}
                      alt="Thumbnail"
                      // Add onClick handler
                    />

                    <div>
                      <img src={user?.photoURL} id="explore_model_profile"></img>
                      <p id="explore_model_title">{folderName}</p>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
          {selectedFileUrl && (
            <div>
              <p>Selected File:</p>
              <a
                href={selectedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
