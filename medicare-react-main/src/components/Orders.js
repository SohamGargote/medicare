



import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminHeader from './layouts/AdminHeader';
import AdminSideBar from './layouts/AdminSideBar';
import AdminFooter from './layouts/AdminFooter';
import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export default function Orders() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const productsCollectionRef = collection(db, 'products');

  useEffect(() => {
    const getProducts = async () => {
      const data = await getDocs(productsCollectionRef);
      setProducts(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    getProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const handlePlaceOrder = async () => {
    try {
      // 1. Add order to 'orders' collection
      await addDoc(collection(db, 'orders'), {
        items: cart,
        total: totalAmount,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // 2. Subtract totalAmount from balance
      const balanceRef = collection(db, 'balance');
      const balanceSnapshot = await getDocs(balanceRef);

      if (!balanceSnapshot.empty) {
        const balanceDoc = balanceSnapshot.docs[0];
        const currentBalance = balanceDoc.data().amount || 0;

        if (currentBalance < totalAmount) {
          alert('Insufficient balance to place order.');
          return;
        }

        const docRef = doc(db, 'balance', balanceDoc.id);
        await updateDoc(docRef, {
          amount: currentBalance - totalAmount
        });
      }

      setCart([]);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(products.filter(product => product.id !== productId));
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <>
      <AdminHeader />
      <AdminSideBar />
      <div className="main-panel">
        <div className="content">
          <div className="container-fluid">
            <h4 className="page-title">Place Order</h4>
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Available Products</div>
                  </div>
                  <div className="card-body">
                    {products.map(product => (
                      <div key={product.id} className="d-flex align-items-center justify-content-between w-100 mb-3 px-4">
                        <div className="flex-grow-1 me-4">
                          <h5>{product.name}</h5>
                          <div>₹{product.price}</div>
                        </div>
                        <div className="d-flex gap-3 me-6">
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => addToCart(product)}
                          >
                            Add to Cart
                          </button>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => navigate(`/addproduct/${product.id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Order Summary</div>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <h5>Items ({cart.length})</h5>
                      {cart.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between">
                          <span>{item.name}</span>
                          <span>₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between">
                        <h5>Total:</h5>
                        <h5>₹{totalAmount}</h5>
                      </div>
                      <button 
                        className="btn btn-success btn-block"
                        onClick={handlePlaceOrder}
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    </>
  );
}