import React, { useState, useRef, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./cssFiles/PostUpload.css";

import cancelIcon from "./assets/UploadPageAssets/cancel_icon.png";
import thumbnailIMG from "./assets/UploadPageAssets/thumbnail_logo.png";
import model from "./assets/UploadPageAssets/model_logo.png";
import siteLogo from "./assets/GlobalAssets/siteLogo.png";

const firebaseConfig = {
  apiKey: "AIzaSyC15DIGHXbAg5ukhTBy0TG3wHIlceTXiLY",
  authDomain: "ieee-40444.firebaseapp.com",
  projectId: "ieee-40444",
  storageBucket: "ieee-40444.appspot.com",
  messagingSenderId: "269534527954",
  appId: "1:269534527954:web:2173bdaf3222c3ce0f080b",
};

firebase.initializeApp(firebaseConfig);

const PostUpload = () => {
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [thumbnailURL, setThumbnailURL] = useState(null);

  const [selectedThumbnailURL, setSelectedThumbnailURL] = useState(null);
  const [selectedModelURL, setSelectedModelURL] = useState(null);

  const user = firebase.auth().currentUser;

  const canvasRef = useRef(null);
  const modelRef = useRef(null);

  const handleThumbnailChange = (e) => {
    const selectedThumbnail = e.target.files[0];
    setThumbnail(selectedThumbnail);
    setSelectedThumbnailURL(URL.createObjectURL(selectedThumbnail));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setSelectedModelURL(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!user) {
      console.error("User not signed in.");
      return;
    }

    if (!title || !description || !thumbnail || !file) {
      console.error("Please fill out all fields.");
      return;
    }

    // Upload thumbnail
    const thumbnailRef = firebase
      .storage()
      .ref(`${user.uid}/posts/${title}/thumbnail/${thumbnail.name}`);
    const thumbnailUploadTask = thumbnailRef.put(thumbnail);

    thumbnailUploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error(error);
      },
      async () => {
        // Thumbnail upload complete
        const thumbnailUrl = await thumbnailRef.getDownloadURL();
        setThumbnailURL(thumbnailUrl);

        // Upload file
        const fileRef = firebase
          .storage()
          .ref(`${user.uid}/posts/${title}/file/${file.name}`);
        const fileUploadTask = fileRef.put(file);

        fileUploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error(error);
          },
          async () => {
            // File upload complete

            // Upload description
            const descriptionRef = firebase
              .storage()
              .ref(`${user.uid}/posts/${title}/description/description.txt`);
            const descriptionUploadTask = descriptionRef.putString(description);
            descriptionUploadTask.on(
              "state_changed",
              () => {},
              (error) => {
                console.error(error);
              }
            );
            setUploadComplete(true);
          },

          async () => {
            // File upload complete
            const fileUrl = await fileRef.getDownloadURL();

            // Save post data in Firestore
            const postsCollection = firebase.firestore().collection("posts");
            await postsCollection.add({
              title,
              description,
              thumbnailUrl,
              fileUrl,
              userId: user.uid,
            });

            setUploadProgress(100);
          }
        );
        setUploadStatus(true);
      }
    );
  };

  useEffect(() => {
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

    loader.load(selectedModelURL, (gltf) => {
      const model = gltf.scene;
      modelRef.current = model;
      scene.add(model);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 10, 2);
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
        modelRef.current.rotation.y += 0.0009;
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
  }, [selectedModelURL]);

  return (
    <div className="post_wrapper">
      <div class="nav">
        <div style={{ fontWeight: "400", color: "gray" }}>
          {uploadStatus && (
            <div id="upload_progress_text">
              Upload Progress: {uploadProgress.toFixed(1)}%
            </div>
          )}
        </div>

        <div class="post_mid_options">
          <img id="post_site_logo" src={siteLogo}></img>
          <h3 id="post_logo_text">INNOVATE 3D</h3>
        </div>

        {uploadComplete && (
          <div id="upload_completed_text">
            Upload completed! -
            <Link to={"/explore"} style={{ textDecoration: "none" }}>
              <h4 id="redirect_btn">Check it out !</h4>
            </Link>
          </div>
        )}
      </div>

      <div class="content_container">
        <button id="upload_cancel_btn">
          <Link to={"/explore"}>
            <img src={cancelIcon} />
          </Link>
        </button>

        <div className="main_container">
          <input
            id="title_text"
            type="text"
            placeholder="A VERY LOOOOOOOOOOOOONG TITLE"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="upload_section">
            <div className="thumbnail_side">
              <h3 class="upload_headings">THUMBNAIL</h3>

              <input
                id="thumbnail_upload"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                required
              />

              {selectedThumbnailURL ? (
                <div>
                  <img
                    className="upload_preview"
                    src={selectedThumbnailURL}
                    alt="Thumbnail"
                  />
                </div>
              ) : (
                <img
                  className="upload_logos"
                  src={thumbnailIMG}
                  alt="Thumbnail Placeholder"
                />
              )}

              <p class="upload_supply_text">
                Drag and drop an image, or{" "}
                <label for="thumbnail_upload">Browse</label>
              </p>

              <p class="upload_supply_text">
                Minimum 1600px width recommended. Max 10MB each.
              </p>

              <p class="upload_supply_text">
                High resolution images (png, jpg, gif)
              </p>
            </div>

            <div className="model_side">
              <h3 class="upload_headings">3D MODEL</h3>

              <input
                id="model_upload"
                type="file"
                onChange={handleFileChange}
                required
              />

              {selectedModelURL ? (
                <canvas ref={canvasRef} id="UploadThreeJsCanvas"></canvas>
              ) : (
                <>
                  <img
                    className="upload_logos"
                    src={model}
                    alt="Model Placeholder"
                  />
                </>
              )}

              <p class="upload_supply_text">
                Drag and drop an .glb file, or{" "}
                <label for="model_upload">Browse</label>
              </p>
              <p class="upload_supply_text">
                Minimum 1600px width recommended. Max 1GB each.
              </p>
              <p class="upload_supply_text">High resolution 3D (obj, srt, glb)</p>
            </div>
          </div>

          <input
            id="desc_text"
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button id="upload_btn" onClick={handleUpload}>
          UPLOAD
        </button>
      </div>
    </div>
  );
};

export default PostUpload;
