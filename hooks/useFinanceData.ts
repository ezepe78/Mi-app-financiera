import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/components/FirebaseProvider';
import { v4 as uuidv4 } from 'uuid';

export type AccountType = 'cash' | 'bank' | 'wallet';
export type CategoryType = 'income' | 'expense';
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Account {
  id: string;
  uid: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  createdAt: string;
}

export interface Category {
  id: string;
  uid: string;
  name: string;
  type: CategoryType;
}

export interface Transaction {
  id: string;
  uid: string;
  type: TransactionType;
  description: string;
  amount: number;
  accountId: string;
  categoryId: string;
  issueDate: string;
  dueDate: string;
  completed: boolean;
  note?: string;
  linkedTransactionId?: string; // For transfers
}

export function useFinanceData() {
  const { user, loading: authLoading } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      const tid = setTimeout(() => {
        setAccounts([]);
        setCategories([]);
        setTransactions([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(tid);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (authLoading || !user) return;

    console.log("useFinanceData: Starting data fetch for user", user.uid);
    const tid = setTimeout(() => {
      setLoading(true);
    }, 0);

    let accountsReady = false;
    let categoriesReady = false;
    let transactionsReady = false;

    const checkReady = () => {
      console.log("useFinanceData: checkReady", { accountsReady, categoriesReady, transactionsReady });
      if (accountsReady && categoriesReady && transactionsReady) {
        setLoading(false);
        console.log("useFinanceData: Data fetch complete, loading set to false");
      }
    };

    const qAccounts = query(collection(db, 'accounts'), where('uid', '==', user.uid));
    const qCategories = query(collection(db, 'categories'), where('uid', '==', user.uid));
    const qTransactions = query(collection(db, 'transactions'), where('uid', '==', user.uid));

    console.log("useFinanceData: Attaching onSnapshot listeners");

    const maxWaitTid = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn("useFinanceData: Data fetch timed out after 5s, forcing loading to false");
          return false;
        }
        return prev;
      });
    }, 5000);

    const unsubAccounts = onSnapshot(qAccounts, (snapshot) => {
      console.log("useFinanceData: Accounts snapshot received", snapshot.size);
      setAccounts(snapshot.docs.map(doc => doc.data() as Account));
      accountsReady = true;
      checkReady();
    }, (error) => {
      console.error("Error fetching accounts:", error);
      accountsReady = true;
      checkReady();
    });

    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
      console.log("useFinanceData: Categories snapshot received", snapshot.size);
      setCategories(snapshot.docs.map(doc => doc.data() as Category));
      categoriesReady = true;
      checkReady();
    }, (error) => {
      console.error("Error fetching categories:", error);
      categoriesReady = true;
      checkReady();
    });

    const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
      console.log("useFinanceData: Transactions snapshot received", snapshot.size);
      setTransactions(snapshot.docs.map(doc => doc.data() as Transaction));
      transactionsReady = true;
      checkReady();
    }, (error) => {
      console.error("Error fetching transactions:", error);
      transactionsReady = true;
      checkReady();
    });

    const handleBypass = () => {
      console.warn("useFinanceData: Manual bypass triggered");
      setLoading(false);
    };

    window.addEventListener('bypass-loading', handleBypass);

    return () => {
      console.log("useFinanceData: Cleaning up listeners");
      clearTimeout(tid);
      clearTimeout(maxWaitTid);
      unsubAccounts();
      unsubCategories();
      unsubTransactions();
      window.removeEventListener('bypass-loading', handleBypass);
    };
  }, [user, authLoading]);

  const addAccount = async (account: Omit<Account, 'id' | 'uid' | 'createdAt'>) => {
    if (!user) return;
    const id = uuidv4();
    const newAccount: Account = {
      ...account,
      id,
      uid: user.uid,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'accounts', id), newAccount);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `accounts/${id}`);
    }
  };

  const updateAccount = async (account: Account) => {
    try {
      await setDoc(doc(db, 'accounts', account.id), account);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `accounts/${account.id}`);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'accounts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `accounts/${id}`);
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'uid'>) => {
    if (!user) return;
    const id = uuidv4();
    const newCategory: Category = {
      ...category,
      id,
      uid: user.uid,
    };
    try {
      await setDoc(doc(db, 'categories', id), newCategory);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `categories/${id}`);
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      await setDoc(doc(db, 'categories', category.id), category);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `categories/${category.id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'uid'>) => {
    if (!user) return;
    const id = uuidv4();
    const newTransaction: Transaction = {
      ...transaction,
      id,
      uid: user.uid,
    };
    try {
      await setDoc(doc(db, 'transactions', id), newTransaction);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `transactions/${id}`);
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      await setDoc(doc(db, 'transactions', transaction.id), transaction);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `transactions/${transaction.id}`);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
  };

  const addTransfer = async (fromAccountId: string, toAccountId: string, amount: number, date: string, description: string) => {
    if (!user) return;
    const expenseId = uuidv4();
    const incomeId = uuidv4();

    const expenseTx: Transaction = {
      id: expenseId,
      uid: user.uid,
      type: 'transfer',
      description: description || 'Transfer Out',
      amount,
      accountId: fromAccountId,
      categoryId: 'transfer', // Special category
      issueDate: date,
      dueDate: date,
      completed: true,
      linkedTransactionId: incomeId
    };

    const incomeTx: Transaction = {
      id: incomeId,
      uid: user.uid,
      type: 'transfer',
      description: description || 'Transfer In',
      amount,
      accountId: toAccountId,
      categoryId: 'transfer',
      issueDate: date,
      dueDate: date,
      completed: true,
      linkedTransactionId: expenseId
    };

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'transactions', expenseId), expenseTx);
      batch.set(doc(db, 'transactions', incomeId), incomeTx);
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transactions/batch-transfer');
    }
  };

  return {
    accounts,
    categories,
    transactions,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addTransfer
  };
}
