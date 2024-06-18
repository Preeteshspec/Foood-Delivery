import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Placing user order for frontend
const placeOrder = async (req, res) => {
  const frontend_url = "https://urban-bites.onrender.com";

  try {
    const newOrder = new orderModel({
      userID: req.body.userID,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userID, { cartData: {} });

    const amountInPaise = (req.body.amount + 2) * 100; // Converting amount to paise

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: newOrder._id.toString(),
    };

    const order = await razorpay.orders.create(options);

    res.json({ success: true, orderId: newOrder._id, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// orderController.js
const verifyPayment = async (req, res) => {
    const { orderId, paymentId, signature } = req.body;
  
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest('hex');
  
    if (generatedSignature === signature) {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  };
  
  export { placeOrder, verifyPayment };
  
