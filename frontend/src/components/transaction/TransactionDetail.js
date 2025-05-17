import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { getTransaction } from "../../redux/features/transaction/transactionSlice";
import { SpinnerImg } from "../loader/Loader";
import "./Transaction.scss";
import { FaArrowLeft, FaPrint } from "react-icons/fa";

const TransactionDetail = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  const { transaction, isLoading } = useSelector((state) => state.transaction);

  // Log the transaction data received from the backend
  console.log("Transaction data received:", transaction);

  useEffect(() => {
    dispatch(getTransaction(id));
  }, [dispatch, id]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return "$" + parseFloat(amount).toFixed(2);
  };

  // Print receipt
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="transaction-detail">
      <div className="transaction-detail-header">
        <h3>Transaction Details</h3>
        <div className="action-buttons">
          <Link
            to="/transactions"
            className="--btn --btn-secondary"
          >
            <FaArrowLeft /> Back to Transactions
          </Link>
          <button
            className="--btn --btn-primary"
            onClick={handlePrint}
          >
            <FaPrint /> Print Receipt
          </button>
        </div>
      </div>

      {isLoading ? (
        <SpinnerImg />
      ) : !transaction ? (
        <p>Transaction not found.</p>
      ) : (
        <div className="transaction-receipt">
          <div className="receipt-header">
            <h2>Sales Receipt</h2>
            <div className="receipt-info">
              <p>
                <strong>Transaction ID:</strong> {transaction._id}
              </p>
              <p>
                <strong>Date:</strong> {formatDate(transaction.transactionDate)}
              </p>
            </div>
          </div>

          <div className="customer-info">
            <h4>Customer Information</h4>
            <p>
              <strong>Name:</strong> {transaction.customer.name}
            </p>
            {transaction.customer.email && (
              <p>
                <strong>Email:</strong> {transaction.customer.email}
              </p>
            )}
            {transaction.customer.phone && (
              <p>
                <strong>Phone:</strong> {transaction.customer.phone}
              </p>
            )}
          </div>

          <div className="products-info">
            <h4>Products</h4>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {transaction.products.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan="3"
                    className="total-label"
                  >
                    Total Amount:
                  </td>
                  <td className="total-amount">
                    {formatCurrency(transaction.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="payment-info">
            <h4>Payment Information</h4>
            <p>
              <strong>Payment Method:</strong> {transaction.paymentMethod}
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              <span
                className={`status ${transaction.paymentStatus.toLowerCase()}`}
              >
                {transaction.paymentStatus}
              </span>
            </p>

            <p>
              <strong>Performed By:</strong>{" "}
              <span className="performed-by">
                {transaction.performedBy && transaction.performedBy.user
                  ? transaction.performedBy.user.role === "admin"
                    ? "Admin"
                    : transaction.performedBy.user.name
                  : "User not found"}
              </span>
            </p>

            {transaction.notes && (
              <div className="notes">
                <h4>Notes</h4>
                <p>{transaction.notes}</p>
              </div>
            )}
          </div>

          <div className="receipt-footer">
            <p>Thank you for your business!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetail;
