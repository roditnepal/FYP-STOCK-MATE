import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAdmin } from "../../redux/features/auth/authSlice";
import TransactionList from "../../components/transaction/TransactionList";
import TransactionStats from "../../components/transaction/TransactionStats";
import { FaPlus } from "react-icons/fa";
import "../../components/transaction/Transaction.scss";
import { toast } from "react-toastify";

const TransactionPage = () => {
  const [activeTab, setActiveTab] = useState("list");
  const isAdmin = useSelector(selectIsAdmin);

  const handleStatsClick = () => {
    if (isAdmin) {
      setActiveTab("stats");
    } else {
      toast.error("Only admin users can access statistics");
    }
  };

  return (
    <div className="transaction-page">
      <div className="tabs">
        <button
          className={`tab ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Transactions
        </button>
        <button
          className={`tab ${activeTab === "stats" ? "active" : ""}`}
          onClick={handleStatsClick}
        >
          Statistics{" "}
          {!isAdmin && <span className="admin-only">(Admin Only)</span>}
        </button>
        <button
          className="add-button"
          onClick={() => {
            const baseUrl = window.location.origin;
            window.location.href = `${baseUrl}/add-transaction`;
          }}
        >
          <FaPlus /> New Transaction
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "list" ? (
          <TransactionList />
        ) : (
          isAdmin && <TransactionStats />
        )}
      </div>
    </div>
  );
};

export default TransactionPage;
