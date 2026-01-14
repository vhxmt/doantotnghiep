import express from "express";
import crypto from "crypto";
import qs from "qs";
import moment from "moment";
import {
  Order,
  OrderItem,
  Product,
  User,
  Inventory,
  ProductImage,
} from "../models/index.js";
import { Op } from "sequelize";
import sequelize from "../database/config.js";
import { catchAsync, ValidationError } from "../utils/errors.js";

const router = express.Router();

/**
 * Sắp xếp object theo key alphabet - Theo chuẩn VNPay
 */
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

/**
 * API tạo URL thanh toán VNPay - THEO CHUẨN CODE MẪU VNPAY
 * POST /api/v1/vnpay/create_payment_url
 */
router.post("/create_payment_url", function (req, res, next) {
  process.env.TZ = "Asia/Ho_Chi_Minh";

  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");
  let orderId = req.body.orderNumber || moment(date).format("HHmmss");

  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = process.env.VNPAY_TMN_CODE;
  let secretKey = process.env.VNPAY_HASH_SECRET;
  let vnpUrl = process.env.VNPAY_URL;
  let returnUrl = process.env.VNPAY_RETURN_URL;

  let amount = req.body.amount;
  let bankCode = req.body.bankCode;

  let locale = req.body.language;
  if (locale === null || locale === "" || !locale) {
    locale = "vn";
    
  }
  let currCode = "VND";
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] =
    req.body.orderDescription || "Thanh toan don hang " + orderId;
  vnp_Params["vnp_OrderType"] = req.body.orderType || "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  if (bankCode !== null && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  let signData = qs.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

  console.log("=== VNPAY CREATE PAYMENT URL ===");
  console.log("Sign Data:", signData);
  console.log("Signature:", signed);
  console.log("Payment URL:", vnpUrl);
  console.log("================================");

  res.json({ code: "00", data: vnpUrl });
});

/**
 * VNPay Return URL (Redirect từ VNPay về)
 * GET /api/v1/vnpay/vnpay_return
 */
router.get("/vnpay_return", async function (req, res, next) {
  let vnp_Params = req.query;

  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  let secretKey = process.env.VNPAY_HASH_SECRET;

  let signData = qs.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

  console.log("=== VNPay Return ===");
  console.log("Sign Data:", signData);
  console.log("Received Hash:", secureHash);
  console.log("Calculated Hash:", signed);
  console.log("Response Code:", vnp_Params["vnp_ResponseCode"]);
  console.log("====================");

  if (secureHash === signed) {
    let orderNumber = vnp_Params["vnp_TxnRef"];
    let rspCode = vnp_Params["vnp_ResponseCode"];

    if (rspCode === "00") {
      // Thanh toán thành công - Cập nhật database
      try {
        const order = await Order.findByOrderNumber(orderNumber);
        if (order) {
          await order.update({
            paymentStatus: "paid",
            paymentMethod: "vnpay",
          });
        }
      } catch (error) {
        console.error("Update order error:", error);
      }

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(
        `${frontendUrl}/payment/success?order=${encodeURIComponent(
          orderNumber
        )}`
      );
    } else {
      // Thanh toán thất bại
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(
        `${frontendUrl}/payment/failure?order=${encodeURIComponent(
          orderNumber
        )}&code=${rspCode}`
      );
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid signature",
    });
  }
});

/**
 * VNPay IPN (Instant Payment Notification)
 * GET /api/v1/vnpay/vnpay_ipn
 */
router.get("/vnpay_ipn", async function (req, res, next) {
  let vnp_Params = req.query;
  let secureHash = vnp_Params["vnp_SecureHash"];

  let orderNumber = vnp_Params["vnp_TxnRef"];
  let rspCode = vnp_Params["vnp_ResponseCode"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  let secretKey = process.env.VNPAY_HASH_SECRET;

  let signData = qs.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

  console.log("=== VNPay IPN ===");
  console.log("Order Number:", orderNumber);
  console.log("Response Code:", rspCode);
  console.log("Signature Valid:", secureHash === signed);
  console.log("=================");

  if (secureHash === signed) {
    // Kiểm tra order có tồn tại không
    try {
      const order = await Order.findByOrderNumber(orderNumber);
      if (!order) {
        return res.status(200).json({
          RspCode: "01",
          Message: "Order not found",
        });
      }

      // Kiểm tra số tiền có khớp không (vnp_Amount is in cents)
      const vnpAmount = parseInt(vnp_Params["vnp_Amount"], 10) / 100;
      if (Number(order.totalAmount) !== Number(vnpAmount)) {
        return res.status(200).json({
          RspCode: "04",
          Message: "Amount invalid",
        });
      }

      // Cập nhật trạng thái order
      if (order.paymentStatus === "unpaid") {
        if (rspCode === "00") {
          // Thanh toán thành công
          await order.update({
            paymentStatus: "paid",
            paymentMethod: "vnpay",
          });
          return res.status(200).json({
            RspCode: "00",
            Message: "Success",
          });
        } else {
          // Thanh toán thất bại
          await order.update({ paymentStatus: "failed" });
          return res.status(200).json({
            RspCode: "00",
            Message: "Success",
          });
        }
      } else {
        return res.status(200).json({
          RspCode: "02",
          Message: "This order has been updated to the payment status",
        });
      }
    } catch (error) {
      console.error("VNPay IPN error:", error);
      return res.status(200).json({
        RspCode: "99",
        Message: "Unknown error",
      });
    }
  } else {
    return res.status(200).json({
      RspCode: "97",
      Message: "Checksum failed",
    });
  }
});

/**
 * Create order and get payment URL in one call
 * POST /api/v1/vnpay/create_order_payment
 */
router.post(
  "/create_order_payment",
  catchAsync(async (req, res) => {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      subtotal,
      shippingFee = 0,
      total,
      notes,
      discountAmount = 0,
      bankCode,
      language = "vn",
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone) {
      throw new ValidationError("Thông tin khách hàng là bắt buộc");
    }

    if (!shippingAddress || !shippingAddress.addressLine1) {
      throw new ValidationError("Địa chỉ giao hàng là bắt buộc");
    }

    if (!items || items.length === 0) {
      throw new ValidationError("Đơn hàng phải có ít nhất 1 sản phẩm");
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    let order;
    let orderNumber;

    try {
      // Find or create user
      let user;
      if (req.user) {
        user = req.user;
      } else {
        user = await User.findOne({
          where: { email: customerEmail },
          transaction,
        });

        if (!user) {
          const [firstName, ...lastNameParts] = customerName.split(" ");
          const lastName = lastNameParts.join(" ") || "";

          user = await User.create(
            {
              firstName,
              lastName,
              email: customerEmail,
              phone: customerPhone,
              password: "guest_user",
              emailVerified: false,
              status: "active",
            },
            { transaction }
          );
        }
      }

      // Validate products and check inventory
      const productIds = items.map((item) => item.productId);
      const products = await Product.findAll({
        where: { id: { [Op.in]: productIds } },
        include: [{ model: Inventory, as: "inventory" }],
        transaction,
      });

      if (products.length !== items.length) {
        throw new ValidationError("Một số sản phẩm không tồn tại");
      }

      // Check inventory and calculate totals
      let calculatedSubtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new ValidationError(
            `Không tìm thấy sản phẩm ${item.productId}`
          );
        }

        if (product.status !== "active") {
          throw new ValidationError(`Sản phẩm ${product.name} không có sẵn`);
        }

        const availableQuantity = product.inventory?.quantity || 0;
        if (availableQuantity < item.quantity) {
          throw new ValidationError(
            `Không đủ hàng cho ${product.name}. Còn lại: ${availableQuantity}`
          );
        }

        const itemTotal = product.price * item.quantity;
        calculatedSubtotal += itemTotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemTotal,
        });

        // Update inventory
        await Inventory.update(
          {
            quantity: availableQuantity - item.quantity,
            reservedQuantity:
              (product.inventory?.reservedQuantity || 0) + item.quantity,
          },
          {
            where: { productId: item.productId },
            transaction,
          }
        );
      }

      // Generate order number manually
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      orderNumber = `ML${timestamp}${random}`;

      // Create order
      order = await Order.create(
        {
          orderNumber,
          userId: user.id,
          status: "pending",
          paymentStatus: "unpaid",
          paymentMethod: "vnpay",
          subtotal: calculatedSubtotal,
          shippingAmount: shippingFee,
          discountAmount,
          totalAmount: total,
          currency: "VND",
          notes,
          shippingAddress,
          billingAddress: shippingAddress,
        },
        { transaction }
      );

      // Create order items
      const orderItemsWithOrderId = orderItems.map((item) => ({
        ...item,
        orderId: order.id,
      }));

      await OrderItem.bulkCreate(orderItemsWithOrderId, { transaction });

      // Commit transaction BEFORE generating payment URL
      await transaction.commit();
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }

    // Generate VNPAY payment URL - THEO CHUẨN VNPAY
    try {
      process.env.TZ = "Asia/Ho_Chi_Minh";
      let date = new Date();
      let createDate = moment(date).format("YYYYMMDDHHmmss");

      let ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress ||
        "127.0.0.1";

      let tmnCode = process.env.VNPAY_TMN_CODE;
      let secretKey = process.env.VNPAY_HASH_SECRET;
      let vnpUrl = process.env.VNPAY_URL;
      let returnUrl = process.env.VNPAY_RETURN_URL;

      if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
        throw new ValidationError("VNPAY configuration is missing");
      }

      let locale = language || "vn";
      let currCode = "VND";
      let vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderNumber;
      vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang " + orderNumber;
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = Math.round(parseFloat(total) * 100);
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      if (bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = bankCode;
      }

      vnp_Params = sortObject(vnp_Params);

      let signData = qs.stringify(vnp_Params, { encode: false });
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

      console.log("=== VNPAY CREATE ORDER PAYMENT ===");
      console.log("Order number:", orderNumber);
      console.log("Sign Data:", signData);
      console.log("Signature:", signed);
      console.log("Payment URL:", vnpUrl);
      console.log("==================================");

      // Fetch complete order
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email", "phone"],
          },
          {
            model: OrderItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["id", "name", "sku", "price", "slug"],
              },
            ],
          },
        ],
      });

      return res.status(201).json({
        status: "success",
        message: "Đơn hàng được tạo thành công",
        data: {
          order: completeOrder,
          paymentUrl: vnpUrl,
        },
      });
    } catch (error) {
      console.error("VNPAY payment URL generation error:", error);
      throw error;
    }
  })
);

/**
 * Query transaction status
 * POST /api/v1/vnpay/query
 */
router.post("/query", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Query feature not implemented yet",
  });
});

/**
 * Refund
 * POST /api/v1/vnpay/refund
 */
router.post("/refund", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Refund feature not implemented yet",
  });
});

export default router;
