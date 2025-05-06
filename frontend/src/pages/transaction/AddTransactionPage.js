import React from "react";
import TransactionForm from "../../components/transaction/TransactionForm";
import "../../components/transaction/Transaction.scss";

const AddTransactionPage = () => {
  return (
    <div className="add-transaction-page">
      <TransactionForm />
    </div>
  );
};

export default AddTransactionPage;
