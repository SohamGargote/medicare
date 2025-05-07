import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import AdminHeader from "./layouts/AdminHeader";
import AdminSideBar from "./layouts/AdminSideBar";
import AdminFooter from "./layouts/AdminFooter";

export default function Dashboard(props) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [balance, setBalance] = useState(0);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [showSubtractBalanceModal, setShowSubtractBalanceModal] = useState(false);
  const [balanceToAdd, setBalanceToAdd] = useState('');
  const [balanceToSubtract, setBalanceToSubtract] = useState('');
  const [profitGoal, setProfitGoal] = useState(10000);
  const [showSetGoalModal, setShowSetGoalModal] = useState(false);
  const [newProfitGoal, setNewProfitGoal] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completed: doc.data().completed || false
      }));
      setTasks(tasksData);
    });

    const goalUnsubscribe = onSnapshot(collection(db, "profitGoals"), (snapshot) => {
      if (!snapshot.empty) {
        const goalData = snapshot.docs[0].data();
        setProfitGoal(goalData.amount || 10000);
      }
    });

    const balanceUnsubscribe = onSnapshot(collection(db, "balance"), (snapshot) => {
      if (!snapshot.empty) {
        const balanceData = snapshot.docs[0].data();
        setBalance(balanceData.amount || 0);
      }
    });

    return () => {
      unsubscribe();
      balanceUnsubscribe();
      goalUnsubscribe();
    };
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      await addDoc(collection(db, "tasks"), {
        title: newTask,
        completed: false,
        createdAt: new Date()
      });
      setNewTask("");
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  const toggleTask = async (taskId, completed) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        completed: !completed
      });
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
      console.error("Error deleting task: ", error);
    }
  };

  const calculateTaskCompletion = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const handleAddBalance = async (e) => {
    e.preventDefault();
    const amount = parseFloat(balanceToAdd);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    try {
      const balanceRef = collection(db, 'balance');
      const balanceSnapshot = await getDocs(balanceRef);
      
      if (balanceSnapshot.empty) {
        await addDoc(balanceRef, { amount: amount });
      } else {
        const docRef = doc(db, 'balance', balanceSnapshot.docs[0].id);
        await updateDoc(docRef, {
          amount: balance + amount
        });
      }
      
      setBalanceToAdd('');
      setShowAddBalanceModal(false);
    } catch (error) {
      console.error('Error updating balance: ', error);
      alert('Failed to update balance');
    }
  };

  const handleSetGoal = async (e) => {
    e.preventDefault();
    const amount = parseFloat(newProfitGoal);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const goalRef = collection(db, 'profitGoals');
      const goalSnapshot = await getDocs(goalRef);
      
      if (goalSnapshot.empty) {
        await addDoc(goalRef, { amount: amount });
      } else {
        const docRef = doc(db, 'profitGoals', goalSnapshot.docs[0].id);
        await updateDoc(docRef, {
          amount: amount
        });
      }
      
      setNewProfitGoal('');
      setShowSetGoalModal(false);
    } catch (error) {
      console.error('Error updating profit goal: ', error);
      alert('Failed to update profit goal');
    }
  };

  const handleSubtractBalance = async (e) => {
    e.preventDefault();
    const amount = parseFloat(balanceToSubtract);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (amount > balance) {
      alert('Insufficient balance');
      return;
    }
    
    try {
      const balanceRef = collection(db, 'balance');
      const balanceSnapshot = await getDocs(balanceRef);
      
      if (!balanceSnapshot.empty) {
        const docRef = doc(db, 'balance', balanceSnapshot.docs[0].id);
        await updateDoc(docRef, {
          amount: balance - amount
        });
      }
      
      setBalanceToSubtract('');
      setShowSubtractBalanceModal(false);
    } catch (error) {
      console.error('Error updating balance: ', error);
      alert('Failed to update balance');
    }
  };

  return (
    <>
      <AdminHeader />
      <AdminSideBar />
      <div className="main-panel">
        <div className="content">
          <div className="container-fluid">
            <h4 className="page-title">Dashboard</h4>
            <div className="row">
              <div className="col-md-3">
                <div className="card card-stats card-warning">
                  <div className="card-body ">
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center">
                          <i className="la la-users"></i>
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Visitors</p>
                          <h4 className="card-title">1,294</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card card-stats card-success">
                  <div className="card-body ">
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center">
                          <i className="la la-bar-chart"></i>
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Sales</p>
                          <h4 className="card-title">₹ 1,345</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card card-stats card-danger">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center">
                          <i className="la la-newspaper-o"></i>
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Subscribers</p>
                          <h4 className="card-title">1303</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card card-stats card-primary">
                  <div className="card-body ">
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center">
                          <i className="la la-check-circle"></i>
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Order</p>
                          <h4 className="card-title">576</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row row-card-no-pd">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <p className="fw-bold mt-1">My Balance</p>
                    <h4>
                      <b>₹ {balance.toLocaleString()}</b>
                    </h4>
                    <div className="d-flex flex-column">
                      <a href="#" className="btn btn-primary btn-full text-left mt-3" onClick={() => setShowAddBalanceModal(true)}>
                        <i className="la la-plus"></i> Add Balance
                      </a>
                      <a href="#" className="btn btn-info btn-full text-left mt-2" onClick={() => setShowSetGoalModal(true)}>
                        <i className="la la-bullseye"></i> Set Profit Goal
                      </a>
                      <a href="#" className="btn btn-danger btn-full text-left mt-2 mb-3" onClick={() => setShowSubtractBalanceModal(true)}>
                        <i className="la la-minus"></i> Subtract Balance
                      </a>
                    </div>
                  </div>
                  <div className="card-footer">
                    <ul className="nav">
                      <li className="nav-item">
                        <a className="btn btn-default btn-link" href="#">
                          <i className="la la-history"></i> History
                        </a>
                      </li>
                      <li className="nav-item ml-auto">
                        <a className="btn btn-default btn-link" href="#">
                          <i className="la la-refresh"></i> Refresh
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-5">
                <div className="card">
                  <div className="card-body">
                    <div className="progress-card">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Profit</span>
                        <span className="text-muted fw-bold">₹ {balance.toLocaleString()}</span>
                      </div>
                      <div className="progress mb-2" style={{ height: "7px" }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{ width: `${Math.min((balance / (profitGoal || 10000)) * 100, 100)}%` }}
                          aria-valuenow={Math.min((balance / profitGoal) * 100, 100)}
                          aria-valuemin="0"
                          aria-valuemax={profitGoal}
                          data-toggle="tooltip"
                          data-placement="top"
                          title={`${Math.min((balance / 10000) * 100, 100)}%`}></div>
                      </div>
                    </div>
                    <div className="progress-card">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Orders</span>
                        <span className="text-muted fw-bold"> 576</span>
                      </div>
                      <div className="progress mb-2" style={{ height: "7px" }}>
                        <div
                          className="progress-bar bg-info"
                          role="progressbar"
                          style={{ width: "65%" }}
                          aria-valuenow="60"
                          aria-valuemin="0"
                          aria-valuemax={profitGoal}
                          data-toggle="tooltip"
                          data-placement="top"
                          title="65%"></div>
                      </div>
                    </div>
                    <div className="progress-card">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Tasks Complete</span>
                        <span className="text-muted fw-bold"> {calculateTaskCompletion()}%</span>
                      </div>
                      <div className="progress mb-2" style={{ height: "7px" }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${calculateTaskCompletion()}%` }}
                          aria-valuenow={calculateTaskCompletion()}
                          aria-valuemin="0"
                          aria-valuemax={profitGoal}
                          data-toggle="tooltip"
                          data-placement="top"
                          title={`${calculateTaskCompletion()}%`}></div>
                      </div>
                    </div>
                    <div className="progress-card">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Open Rate</span>
                        <span className="text-muted fw-bold"> 60%</span>
                      </div>
                      <div className="progress mb-2" style={{ height: "7px" }}>
                        <div
                          className="progress-bar bg-warning"
                          role="progressbar"
                          style={{ width: "60%" }}
                          aria-valuenow="60"
                          aria-valuemin="0"
                          aria-valuemax={profitGoal}
                          data-toggle="tooltip"
                          data-placement="top"
                          title="60%"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card card-stats">
                  <div className="card-body">
                    <p className="fw-bold mt-1">Statistic</p>
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center icon-warning">
                          <i className="la la-pie-chart text-warning"></i>
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Number</p>
                          <h4 className="card-title">150GB</h4>
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center">
                          <i className="la la-heart-o text-primary"></i>
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Followers</p>
                          <h4 className="card-title">+45K</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="card card-tasks">
                  <div className="card-header ">
                    <h4 className="card-title">Tasks</h4>
                    <p className="card-category">To Do List</p>
                  </div>
                  <div className="card-body ">
                    <div className="table-full-width">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>
                              <div className="form-check">
                                <label className="form-check-label">
                                  <input
                                    className="form-check-input  select-all-checkbox"
                                    type="checkbox"
                                    data-select="checkbox"
                                    data-target=".task-select"
                                  />
                                  <span className="form-check-sign"></span>
                                </label>
                              </div>
                            </th>
                            <th>Task</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.map((task) => (
                            <tr key={task.id}>
                              <td>
                                <div className="form-check">
                                  <label className="form-check-label">
                                    <input
                                      className="form-check-input task-select"
                                      type="checkbox"
                                      checked={task.completed}
                                      onChange={() => toggleTask(task.id, task.completed)}
                                    />
                                    <span className="form-check-sign"></span>
                                  </label>
                                </div>
                              </td>
                              <td style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                                {task.title}
                              </td>
                              <td className="td-actions text-right">
                                <div className="form-button-action">
                                  <button
                                    type="button"
                                    onClick={() => deleteTask(task.id)}
                                    data-toggle="tooltip"
                                    title="Remove"
                                    className="btn btn-link btn-simple-danger">
                                    <i className="la la-times"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan="3">
                              <form onSubmit={addTask} className="d-flex">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Add new task..."
                                  value={newTask}
                                  onChange={(e) => setNewTask(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary ml-2">
                                  Add
                                </button>
                              </form>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="card-footer ">
                    <div className="stats">
                      <i className="now-ui-icons loader_refresh spin"></i> Updated 3 minutes ago
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AdminFooter />

        {showAddBalanceModal && (
          <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Balance</h5>
                  <button type="button" className="close" onClick={() => setShowAddBalanceModal(false)}>
                    <span>&times;</span>
                  </button>
                </div>
                <form onSubmit={handleAddBalance}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Amount to Add</label>
                      <input
                        type="number"
                        className="form-control"
                        value={balanceToAdd}
                        onChange={(e) => setBalanceToAdd(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddBalanceModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showSetGoalModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Set Monthly Profit Goal</h5>
                <button type="button" className="close" onClick={() => setShowSetGoalModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleSetGoal}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Monthly Profit Goal</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newProfitGoal}
                      onChange={(e) => setNewProfitGoal(e.target.value)}
                      min="0"
                      step="100"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSetGoalModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Goal</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showSubtractBalanceModal && (
          <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Subtract Balance</h5>
                  <button type="button" className="close" onClick={() => setShowSubtractBalanceModal(false)}>
                    <span>&times;</span>
                  </button>
                </div>
                <form onSubmit={handleSubtractBalance}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Amount to Subtract</label>
                      <input
                        type="number"
                        className="form-control"
                        value={balanceToSubtract}
                        onChange={(e) => setBalanceToSubtract(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowSubtractBalanceModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-danger">Subtract</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
