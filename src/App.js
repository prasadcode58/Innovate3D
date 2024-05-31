import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Login from "./Login"
import Register from "./Register";
import PostUpload from "./PostUpload";
import ExplorePage from "./ExplorePage";
import MainScreen from "./MainScreen";
import ProfilePage from "./ProfilePage";
import ForgotPassword from "./ForgetPassword";
import EditProfile from "./EditProfile";


const App = () => {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/forgetPassword",
      element: <ForgotPassword />,
    },
    {
      path: "/upload",
      element: <PostUpload />,
    },
    {
      path: "/explore",
      element: <ExplorePage />,
    },
    {
      path: "/main/:title",
      element: <MainScreen />,
    },
    {
      path: "/profile",
      element: <ProfilePage />,
    },
    {
      path: "/editprofile",
      element: <EditProfile />,
    },
  ]);
  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;