import React, { useEffect, useRef } from "react";
import "../../CSS/Login.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useStateUpdateHook } from "../../Helper/useStateUpdate";
import {
  emailCheck,
  nameCheck,
  numberCheck,
  passwordCheck,
} from "../../validation";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { login } from "../../../Redux/React_Slice/expense.reduxSlice";

function Login() {
  let [user, setUser] = useStateUpdateHook({ username: "", password: "" });
  let loginError = useRef("");
  let dispatch = useDispatch();
  let navToHome = useNavigate();
  let showPassword = useRef("Not refer.");
  const { islogin } = useSelector((store) => store.cart);

  function passwordShow() {
    (showPassword.current.type === "password" &&
      (showPassword.current.type = "text")) ||
      (showPassword.current.type = "password");
  }

  async function sendDetails(e) {
    e.preventDefault();
    console.log("Enter to login pag send data function");
    
    loginError.current.innerHTML = "";
    loginError.current.style = "color:red";

    let email, mobile, err;

    //^ Set email, mobile and check validation
    if (Number(user.username)) {
      mobile = user.username;
      err = numberCheck(mobile);
    } else {
      email = user.username;
      err = emailCheck(email);
    }

    if (err) {
      return (loginError.current.innerHTML = err);
    }
    err = passwordCheck(user.password);
    if (err) {
      return (loginError.current.innerHTML = err);
    }
    try {
      sessionStorage.clear();
      let { data } = await axios.post(
        "https://the-uploader.onrender.com/api/v1/login",user );
      if (data.error) {
        return (loginError.current.innerHTML = data.message);
      } else {
        loginError.current.innerHTML = "Login successfully";
        loginError.current.style = "color:green";

        dispatch(
          login({
            email: data.data.email,
            first: data.data.first,
            last: data.data.last,
          })
        );
        console.log(islogin);

        sessionStorage.setItem("token", JSON.stringify(data.token));

        setTimeout(() => {
          navToHome("/");
        }, 500);
      }
    } catch (err) {
      console.log(err);
    }
  }

  let useEffectLogin = async (session) => {
    try {
      console.log(session, " session is");
      let { data } = await axios.get(
        "https://the-uploader.onrender.com/api/v1/refreshlogin",
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(sessionStorage.getItem("token"))}`,
          },
        }
      );
      if (!data.error) {
        dispatch(
          login({
            email: data.data.email,
            first: data.data.first,
            last: data.data.last,
          })
        );
        // dispatch(addCategoryToSlice(data.data.category));
        navToHome("/");
      } else {
        sessionStorage.clear();
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    let data = sessionStorage.getItem("token");
    if (data) {
      data = JSON.parse(data);
      useEffectLogin(data);
    }
  }, []);

  return (
    <div className="loginBox">
      <img
        className="img-fluid mx-auto d-block mb-5"
        src="/Images/colorful-bird.png"
        width={"100px"}
        height={"100px"}
        alt=""
      />
      <span className="loginError" ref={loginError}></span>
      <div className="loginformBox">
        <form action="POST" className="loginForm" onSubmit={sendDetails}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              onChange={setUser}
              placeholder="Email/mobile"
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={setUser}
              ref={showPassword}
            />
          </div>
          <p className="login-remember">
            <label>
              <input type="checkbox" value="forever" onClick={passwordShow} />{" "}
              show password
            </label>
          </p>

          <button className="loginSubmit">Submit</button>
        </form>
        <p className="">
          Don't have an account yet? <NavLink to="/signup">Sign up</NavLink>
        </p>
      </div>
    </div>
  );
}

export default Login;
