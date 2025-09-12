import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import ProfilePhotoSelecter from "../../components/Inputs/ProfilePhotoSelecter";
import { validateEmail } from "../../utils/helper";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";

const SignUp = ({ setCurrentPage }) => {
  const [profilePic, setProfilePic] = useState();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const {updateUser} = useContext(UserContext);
  const navigate = useNavigate();


  const handleSignUp = async (e) => {
    e.preventDefault();
     
    let profileImageUrl = "";
    
    if(!fullName) {
        setError("Please enter the full name.");
        return;
    }

    if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
    }

    if (!password) {
        setError("Please enter the password")
        return;
    }

    
    //Signup API call
    try {
        // Upload image if present
        if (profilePic) {
          const imgUploadRes = await uploadImage(profilePic);
          profileImageUrl = imgUploadRes.imageUrl || "";
        }

        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
          name: fullName,
          email,
          password,
          profileImageUrl,
        })

        const {token} = response.data;

        if (token) {
          localStorage.setItem("token", token);
          updateUser(response.data);
          navigate("/dashboard")
        }
    } catch (error) {
        if (error.response && error.response.data.message) {
            setError(error.response.data.message);
        } else {
            setError("Something went wrong. Please try again.")
        }
    }
  };

  return (
    <div className="relative w-[90%] max-w-md bg-white rounded-lg shadow p-6 mx-auto"> 
      <h3 className="text-lg font-semibold text-black">Create an account</h3>
      <p className="text-xs text-slate-700 mt-1 mb-6">
        Join us today by entering your details below.
      </p>

      <form onSubmit={handleSignUp} className="flex flex-col gap-3">
        <ProfilePhotoSelecter image={profilePic} setImage={setProfilePic} />

        <Input
          value={fullName}
          onChange={({ target }) => setFullName(target.value)}
          label="Full Name"
          placeholder="John"
          type="text"
        />
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
          SIGN UP
        </button>

        <p className="text-[13px] text-slate-800 mt-3 text-center">
          Already have an account?{" "}
          <button
            type="button"
            className="font-medium text-primary underline cursor-pointer"
            onClick={() => setCurrentPage("login")}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignUp;