const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
    });

    // Return user data with JWt
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    console.log("LOGIN ATTEMPT", req.body);

    const { email, password } = req.body;

    // Step 1: Find user
    const user = await User.findOne({ email });
    console.log("USER FOUND:", user ? user.email : "NO USER");

    if (!user) {
      console.log("LOGIN FAILED: User not found for", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Step 2: Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      console.log("LOGIN FAILED: Password incorrect for", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Step 3: Generate token
    const token = generateToken(user._id);
    console.log("JWT GENERATED:", token ? "YES" : "NO");

    // Step 4: Respond
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      token,
    });
    console.log("LOGIN SUCCESS for", email);

  } catch (error) {
    console.error("LOGIN ERROR", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    // Handle remove image request
    if (req.body.remove === "true") {
      await User.findByIdAndUpdate(userId, {
        profileImageUrl: null,
      });
      return res.status(200).json({
        message: "Profile image removed successfully",
        user: await User.findById(userId).select("-password"),
      });
    }

    // Handle file upload
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    // Update user's profile with new image URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImageUrl: imageUrl },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile image updated successfully",
      imageUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  uploadProfileImage,
};
