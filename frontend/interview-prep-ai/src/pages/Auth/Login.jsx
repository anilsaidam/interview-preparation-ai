import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const {updateUser} = useContext(UserContext)
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();

    if(!validateEmail(email)) {
        setError("Please enter a valid email address");
        return;
    }

    if (!password) {
        setError("Please enter the password.");
        return;
    }

    //Login API call
    try{
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const {token} = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data); 
        navigate("/dashboard");
      }
    }catch(error) {
        if (error.response && error.response.data.message) {
            setError(error.response.data.message);
        } else {
            setError("Something went wrong. Please try again.");
        }
    }
  };

  return (
    <div className="relative w-[90%] max-w-md bg-white rounded-lg shadow p-6 mx-auto"> 
      <h3 className="text-lg font-semibold text-black">Welcome Back</h3>
      <p className="text-xs text-slate-700 mt-1 mb-6">
        Please Enter Your Details to Login
      </p>

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <Input
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          label="Email Address"
          placeholder="john@example.com"
          type="text"
        />
        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="Password"
          placeholder="Min 8 characters"
          type="password"
        />

        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

        <button type="submit" className="btn-primary w-full">
          LOGIN
        </button>

        <p className="text-[13px] text-slate-800 mt-3 text-center">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="font-medium text-primary underline cursor-pointer"
            onClick={() => setCurrentPage("signup")}
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;