import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FormGroup from './FormGroup';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
/* import '../assets/BillingForm.css'; */ // Import the CSS file for styling
import { setFormData, setProduct, setError, setLoaded, setLoading, selectFormData, selectError, selectLoaded, selectLoading, selectProduct } from '../store/formSlice';
import { useSelector, useDispatch } from 'react-redux';

const BillingForm = () => {

    /* const [formData, setFormData] = useState({
        date: '',
        partyName: '',
        partyAddress: '',
        billType: '',
        data: []
    });

    const [product, setProduct] = useState({
        name: '',
        quantity: '',
        unit: '',
        rate: ''
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false); */  // Track if initial data is loaded

    const dispatch = useDispatch();

    const formData = useSelector(selectFormData);
    const product = useSelector(selectProduct);
    const error = useSelector(selectError);
    const loaded = useSelector(selectLoaded);
    const loading = useSelector(selectLoading);

    //console.log("formData :- ", formData);

    const date = new Date(formData.date);
    const month = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();

    const billTypes = ['Labour Bill', 'Labour + Material Bill', 'Material Bill', 'Quotation'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        dispatch(setFormData({ ...formData, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.date || !formData.partyName || !formData.partyAddress) {
            return 'Please fill out all required fields.';
        }
        if (formData.data.length === 0) {
            return 'Please add at least one product.';
        }
        return null;
    };

    const apiURI = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            dispatch(setError(validationError));
            return;
        }

        dispatch(setError(null));
        dispatch(setLoading(true));

        try {
            //console.log("formData : ", formData)
            const response = await axios.post(`${apiURI}/write-to-file`, formData, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${formData.partyName}_${day}_${month}_${year}.docx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            dispatch(setError('Failed to generate the report. Please try again.'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    // Load data from sessionStorage when component mounts
    useEffect(() => {
        const savedData = sessionStorage.getItem('formData');
        //console.log("savedData : ", JSON.parse(savedData));

        //console.log("loaded 1st useEffect : ", loaded);
        if (savedData) {
            const savedData2 = JSON.parse(savedData);
            dispatch(setFormData(savedData2));
        }
        dispatch(setLoaded(true));  // Mark data as loaded
    }, []);

    // Update sessionStorage whenever formData changes, but only after initial load
    useEffect(() => {
        //console.log("loaded inside second effect : ", loaded);
        if (loaded) {
            sessionStorage.setItem('formData', JSON.stringify(formData));
        }
    }, [formData, loaded]);

    const handleBillTypeChange = (e) => {
        const { name, value } = e.target;
        dispatch(setFormData({ ...formData, [name]: value }));

        //console.log(e.target.name, " - - ", e.target.value);
    }

    return (
        <div className=''>
            <form onSubmit={handleSubmit} className="">
                <FormGroup
                    label="Date:"
                    type="date"
                    name="date"
                    value={formData?.date}
                    onChange={handleInputChange}

                />

                <FormGroup
                    label="Party Name:"
                    type="text"
                    placeholderText="Enter Party Name"
                    name="partyName"
                    value={formData?.partyName}
                    onChange={handleInputChange}
                />

                <FormGroup
                    label="Party Address:"
                    type="text"
                    placeholderText="Enter Party Address"
                    name="partyAddress"
                    value={formData?.partyAddress}
                    onChange={handleInputChange}
                />

                <div className='flex flex-col my-4 px-5'>
                    <label htmlFor="" className='mb-1 font-semibold'>Type:</label>
                    <select
                        name="billType"
                        value={formData?.billType}
                        onChange={(e) => handleBillTypeChange(e)}
                        className='p-2 rounded-lg'
                    >
                        <option value="">Select Type of Bill</option>
                        {billTypes.map((billType, idx) => (
                            <option key={idx} value={billType}>{billType}</option>
                        ))}
                    </select>

                </div>

                <ProductForm />

                <ProductList />

                {error && <div className="text-red-500 ml-3">{error}</div>}

                <div className='flex flex-col items-center justify-center mb-4 mt-5'>
                    <button type="submit" disabled={loading} className="p-2 mb-2 bg-blue-900 text-white font-semibold px-10 rounded-full">
                        {loading ? 'Generating...' : 'Generate Word File'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BillingForm;
