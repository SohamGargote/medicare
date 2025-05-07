import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import AdminHeader from './layouts/AdminHeader';
import AdminSideBar from './layouts/AdminSideBar';
import AdminFooter from './layouts/AdminFooter';
import { db } from '../firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const productsCollectionRef = collection(db, 'products');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [product, setProduct] = useState({
    name: '',
    price: ''
  });
  const isEditMode = !!id;

  const handleAddProduct = async () => {
    if (product.name && product.price) {
      setErrorMsg('');
      
      if (isEditMode) {
        await updateDoc(doc(db, 'products', id), {
          name: product.name,
          price: parseFloat(product.price)
        });
        setSuccessMsg('Product updated successfully!');
      } else {
        await addDoc(productsCollectionRef, {
          name: product.name,
          price: parseFloat(product.price)
        });
        setSuccessMsg('Product added successfully!');
      }

      setTimeout(() => {
        setSuccessMsg('');
        navigate('/orders');
      }, 1000);
    } else {
      setErrorMsg('Product name and price required!');
    }
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        const docSnap = await getDoc(doc(db, 'products', id));
        if (docSnap.exists()) {
          setProduct(docSnap.data());
        }
      };
      fetchProduct();
    }
  }, [id]);

  return (
    <>
      <AdminHeader />
      <AdminSideBar />
      <div className="main-panel">
        <div className="content">
          <div className="container-fluid">
            <h4 className="page-title">Create Product</h4>
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">
                      New Product Details
                      <Link to="/orders" className="btn btn-danger btn-sm float-right">
                        Go BACK
                      </Link>
                    </div>
                  </div>
                  <div className="card-body px-4">
                    <div className="form-group">
                      <label htmlFor="name">Product Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={product.name}
                        onChange={(e) => setProduct({...product, name: e.target.value})}
                        placeholder="Enter Product Name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="price">Price (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={product.price}
                        onChange={(e) => setProduct({...product, price: e.target.value})}
                        placeholder="Enter Price"
                      />
                    </div>
                  </div>
                  <div className="form-group px-4 mb-3">
                    <div className="text-center text-danger">{errorMsg}</div>
                    <div className="text-center text-success">{successMsg}</div>
                    <button className="btn btn-primary mx-3" onClick={handleAddProduct}>
                      Add Product
                    </button>
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