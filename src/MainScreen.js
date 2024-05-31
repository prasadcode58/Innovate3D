import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/storage";
import "./cssFiles/MainScreen.css"
import * as THREE from "three";
import { Link } from "react-router-dom";

import siteLogo from "./assets/GlobalAssets/siteLogo.png";

import {AiFillHeart} from "react-icons/ai"
import {AiOutlineMessage} from "react-icons/ai"
import {FiBookmark} from "react-icons/fi"
import {CgProfile} from "react-icons/cg"

import waitingVid from "./assets/MainScreenAssets/waiting_vid.mp4";
import backIcon from "./assets/GlobalAssets/back_icon.png";

import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";



const MainScreen = () => {
  const [user, setUser] = useState(null);
  const storage = getStorage();
  const { title } = useParams();
  const [data, setData] = useState(null);

  // For the 3D model
  const canvasRef = useRef(null);
  const modelRef = useRef(null);

  const [like, setLike] = useState(false);

  const handleLikeClick = () => {
    // Toggle the like state
    setLike(!like);
  };

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
        const fileFolderRef = ref(storage, `${user.uid}/posts/${title}/file`);
        const postFolders = await listAll(fileFolderRef);
        if (postFolders.items.length === 0) return;
        const fileUrl = await getDownloadURL(postFolders.items[0]);

        const descriptionFolderRef = ref(
          storage,
          `${user.uid}/posts/${title}/description`
        );
        const descriptionFolders = await listAll(descriptionFolderRef);
        if (postFolders.items.length === 0) return;
        const descriptionUrl = await getDownloadURL(
          descriptionFolders.items[0]
        );

        const thumbnailFolderRef = ref(
          storage,
          `${user.uid}/posts/${title}/thumbnail`
        );
        const thumbnailFolders = await listAll(thumbnailFolderRef);
        if (thumbnailFolders.items.length === 0) return;
        const thumbnailUrl = await getDownloadURL(thumbnailFolders.items[0]);
        setData({ fileUrl, descriptionUrl, thumbnailUrl, text: "" });

        const response = await fetch(descriptionUrl);
        const text = await response.text();

        setData({ fileUrl, descriptionUrl, thumbnailUrl, text });
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };
    fetchPost();
  }, [user, storage, title]);

  useEffect(() => {
    const modelUrl = data?.fileUrl;

    if (!canvasRef.current) {
      console.error("Canvas element not ready");
      return;
    }

    const scene = new THREE.Scene();
    const canvas = canvasRef.current;

    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const loader = new GLTFLoader();
    loader.load(modelUrl, (gltf) => {
      const model = gltf.scene;
      modelRef.current = model;
      scene.add(model);

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 10, 5);
      scene.add(directionalLight);

      camera.position.z = 10;

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;

      animate();
    });

    const animate = () => {
      requestAnimationFrame(animate);

      if (modelRef.current) {
        modelRef.current.rotation.y += 0.002;
      }

      // Check if canvasRef.current exists before updating camera and rendering
      if (canvasRef.current) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);

        renderer.render(scene, camera);
      }
    };

    const handleResize = () => {
      if (canvasRef.current) {
        const newWidth = canvas.clientWidth;
        const newHeight = canvas.clientHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [data]);

  if (!data) {
    return  <video src= {waitingVid} autoPlay loop muted />     
  }

  return (
    
    <div class="mainscreen_wrapper">

        <button id="model_back_btn">
          <Link to={"/explore"}>
            <img src={backIcon} />
          </Link>
          </button>

        <div class="mainscreen_nav">

        <div class="mainscreen_logo_set">
        <img id="mainscreen_site_logo" src={siteLogo}></img>
        <h3 id="mainscreen_logo_text">INNOVATE 3D</h3>
      </div>
            
        </div>

        <div class="mainscreen_content_container">

            <div class="mainscreen_main_container">
                <div class="mainscreen_left_section">
                    <canvas ref={canvasRef} id="myThreeJsCanvas"></canvas>
                    <div class="mainscreen_model_reaction_btns">
                        <i id="mainscreen_model_like_btn" onClick={handleLikeClick}><AiFillHeart color={like ? "red" : "#f2b500"}/></i>
                        <i id="mainscreen_model_comm_btn" ><AiOutlineMessage/></i>
                        <i id="mainscreen_model_bmk_btn" ><FiBookmark/></i>
                    </div>
                </div>

                <div class="mainscreen_right_section">
                    <div class="mainscreen_info_container">
                        <div class="mainscreen_user_info">
                            <h3 id="mainscreen_model_title">{title}</h3>
                            <div class="mainscreen_details">
                                <div class="mainscreen_user_profile_sec">
                                    
                                    <div id="mainscreen_profile_pic">
                                    {user?.photoURL ? <img style={{width:"3rem", height:"3rem", borderRadius:"2rem", objectFit:"cover"}} src={user?.photoURL}/> : <CgProfile style={{fontSize:"3rem", color:"white"}}/> }
                                    </div>

                                    <h4 id="mainscreen_user_name">{user?.displayName}</h4>
                                </div>
                                <button id="mainscreen_follow_btn">Follow</button>
                            </div>
                        </div>
                        <div class="mainscreen_desc_container">
                        
                            <h3 id="mainscreen_desc_head">Description :</h3>

                            <div id="mainscreen_desc_text_layout"><p id="mainscreen_desc_text">{data?.text}
                            </p></div>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};

export default MainScreen;
