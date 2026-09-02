import type { HydratedDocument } from "mongoose";

import type { IOrder } from "../models/order.model.js";
import type { MailOptions } from "../utils/sendMail.js";
import config from "../config/env.js";

const FROM_EMAIL =
  `"Tech Gadgets" <${config.EMAIL}>`;

const escapeHtml = (
  value: string,
): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const buildResetMailOptions = (
  targetEmail: string,
  resetCode: string,
): MailOptions => ({
  from: FROM_EMAIL,
  to: targetEmail,
  subject: "Reset Your Password",

  text:
    `Your password reset code is: ${resetCode}. ` +
    "If you did not request this, ignore this email.",

  html: `
    <div
      style="
        font-family: Arial, sans-serif;
        color: #333;
        line-height: 1.6;
      "
    >
      <h2>Security Verification</h2>

      <p>
        Your verification code for resetting
        your password is:
      </p>

      <h1>${escapeHtml(resetCode)}</h1>

      <p>
        If you did not request this,
        please ignore this email.
      </p>
    </div>
  `,
});

export const buildOrderConfirmationMailOptions = (
  email: string,
  username: string,
  order: HydratedDocument<IOrder>,
): MailOptions => {
  const itemsTableRows =
    order.orderItems
      .map(
        (item) => `
          <tr>
            <td
              style="
                padding:8px;
                border:1px solid #ddd;
              "
            >
              ${escapeHtml(item.name)}
            </td>

            <td
              style="
                padding:8px;
                border:1px solid #ddd;
                text-align:center;
              "
            >
              ${item.quantity}
            </td>

            <td
              style="
                padding:8px;
                border:1px solid #ddd;
                text-align:right;
              "
            >
              ${item.price.toFixed(2)} EGP
            </td>

            <td
              style="
                padding:8px;
                border:1px solid #ddd;
                text-align:right;
              "
            >
              ${(
                item.price *
                item.quantity
              ).toFixed(2)} EGP
            </td>
          </tr>
        `,
      )
      .join("");

  return {
    from: FROM_EMAIL,

    to: email,

    subject:
      `Order Confirmation - #${order._id}`,

    text:
      `Thank you for your order, ${username}. ` +
      `Your order ID is #${order._id}. ` +
      `Total price: ` +
      `${order.totalOrderPrice.toFixed(2)} EGP.`,

    html: `
      <div
        style="
          font-family:Arial,sans-serif;
          color:#333;
          line-height:1.6;
        "
      >
        <h2>Order Confirmation</h2>

        <p>
          Hello
          <strong>
            ${escapeHtml(username)}
          </strong>,
        </p>

        <p>
          Thank you for your order.
          Your order ID is
          <strong>#${order._id}</strong>.
        </p>

        <h3>Order Items</h3>

        <table
          style="
            width:100%;
            border-collapse:collapse;
            margin-bottom:20px;
          "
        >
          <thead>
            <tr style="background:#f2f2f2;">
              <th
                style="
                  padding:8px;
                  border:1px solid #ddd;
                "
              >
                Product
              </th>

              <th
                style="
                  padding:8px;
                  border:1px solid #ddd;
                "
              >
                Qty
              </th>

              <th
                style="
                  padding:8px;
                  border:1px solid #ddd;
                "
              >
                Unit Price
              </th>

              <th
                style="
                  padding:8px;
                  border:1px solid #ddd;
                "
              >
                Subtotal
              </th>
            </tr>
          </thead>

          <tbody>
            ${itemsTableRows}
          </tbody>
        </table>

        <h3>Price Breakdown</h3>

        <table
          style="
            width:100%;
            max-width:400px;
            border-collapse:collapse;
          "
        >
          <tr>
            <td>Subtotal:</td>

            <td style="text-align:right;">
              ${order.subtotal.toFixed(2)} EGP
            </td>
          </tr>

          <tr>
            <td>Shipping Fee:</td>

            <td style="text-align:right;">
              ${order.shippingFee.toFixed(2)} EGP
            </td>
          </tr>

          <tr>
            <td>Tax:</td>

            <td style="text-align:right;">
              ${order.tax.toFixed(2)} EGP
            </td>
          </tr>

          ${
            order.discount > 0
              ? `
                <tr>
                  <td style="color:green;">
                    <strong>Discount:</strong>
                  </td>

                  <td
                    style="
                      text-align:right;
                      color:green;
                    "
                  >
                    <strong>
                      -${order.discount.toFixed(2)} EGP
                    </strong>
                  </td>
                </tr>
              `
              : ""
          }

          <tr
            style="
              border-top:2px solid #333;
            "
          >
            <td style="padding-top:8px;">
              <strong>Total Price:</strong>
            </td>

            <td
              style="
                padding-top:8px;
                text-align:right;
              "
            >
              <strong>
                ${order.totalOrderPrice.toFixed(2)}
                EGP
              </strong>
            </td>
          </tr>
        </table>

        <p>
          We will notify you when your
          order status changes.
        </p>
      </div>
    `,
  };
};

export const buildOrderStatusMailOptions = (
  email: string,
  username: string,
  orderId: string,
  status: string,
  total: number,
  adminNote?: string,
): MailOptions => {
  return {
    from: FROM_EMAIL,

    to: email,

    subject:
      `Order #${orderId} Status Update: ` +
      status.toUpperCase(),

    text:
      `Hello ${username}. ` +
      `Your order #${orderId} status has been ` +
      `updated to ${status}. ` +
      `Total order price: ${total.toFixed(2)} EGP.` +
      (
        adminNote
          ? ` Note from seller: ${adminNote}`
          : ""
      ),

    html: `
      <div
        style="
          font-family:Arial,sans-serif;
          color:#333;
          line-height:1.6;
        "
      >
        <h2>Order Status Updated</h2>

        <p>
          Hello
          <strong>
            ${escapeHtml(username)}
          </strong>,
        </p>

        <p>
          Your order
          <strong>
            #${escapeHtml(orderId)}
          </strong>
          status has been updated to
          <strong>
            ${escapeHtml(status)}
          </strong>.
        </p>

        <p>
          <strong>Total order price:</strong>
          ${total.toFixed(2)} EGP
        </p>

        ${
          adminNote
            ? `
              <p>
                <strong>
                  Note from seller:
                </strong>

                ${escapeHtml(adminNote)}
              </p>
            `
            : ""
        }

        <p>
          Thank you for shopping with us.
        </p>
      </div>
    `,
  };
};

export const buildRoleUpdateMailOptions = (
  email: string,
  username: string,
  oldRole: string,
  newRole: string,
): MailOptions => {
  return {
    from: FROM_EMAIL,

    to: email,

    subject:
      "Account Notice - Role Updated",

    text:
      `Hello ${username}. ` +
      `Your account role has been updated ` +
      `from ${oldRole} to ${newRole}.`,

    html: `
      <h2>
        Hello ${escapeHtml(username)},
      </h2>

      <p>
        Your account role has been updated from
        <b>${escapeHtml(oldRole)}</b>
        to
        <b>${escapeHtml(newRole)}</b>
        by the administrator.
      </p>

      <p>
        If you did not request this change,
        please secure your account immediately.
      </p>
    `,
  };
};

export const buildPaymentSuccessMailOptions = (
  email: string,
  username: string,
  orderId: string,
  total: number,
): MailOptions => ({
  from: FROM_EMAIL,

  to: email,

  subject:
    `Payment Successful - Order #${orderId}`,

  text:
    `Hello ${username}. ` +
    `Your payment for order #${orderId} was successful. ` +
    `Total paid: ${total.toFixed(2)} EGP.`,

  html: `
    <div
      style="
        font-family:Arial,sans-serif;
        color:#333;
        line-height:1.6;
      "
    >
      <h2>Payment Successful</h2>

      <p>
        Hello
        <strong>
          ${escapeHtml(username)}
        </strong>,
      </p>

      <p>
        Your payment for order
        <strong>
          #${escapeHtml(orderId)}
        </strong>
        was successfully processed.
      </p>

      <p>
        <strong>Total paid:</strong>
        ${total.toFixed(2)} EGP
      </p>

      <p>
        We will notify you when your
        order status changes.
      </p>
    </div>
  `,
});

export const buildPaymentFailureMailOptions = (
  email: string,
  username: string,
  orderId: string,
): MailOptions => ({
  from: FROM_EMAIL,

  to: email,

  subject:
    `Payment Failed - Order #${orderId}`,

  text:
    `Hello ${username}. ` +
    `The payment for order #${orderId} could not be completed. ` +
    "Please try again with a valid payment method.",

  html: `
    <div
      style="
        font-family:Arial,sans-serif;
        color:#333;
        line-height:1.6;
      "
    >
      <h2>Payment Failed</h2>

      <p>
        Hello
        <strong>
          ${escapeHtml(username)}
        </strong>,
      </p>

      <p>
        The payment for order
        <strong>
          #${escapeHtml(orderId)}
        </strong>
        could not be completed.
      </p>

      <p>
        Please try again with a valid payment method.
      </p>
    </div>
  `,
});