import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    formData: {
        date: '',
        partyName: '',
        partyAddress: '',
        billType: '',
        data: []
    },
    product: {
        name: '',
        quantity: '',
        unit: '',
        rate: ''
    },
    error: null,
    loading: false,
    loaded: false,
    isModalLoading: false,


}

const formSlice = createSlice({
    name: 'formDetails',
    initialState,
    reducers: {
        setFormData: (state, action) => {
            state.formData = { ...state.formData, ...action.payload }
        },

        setProduct: (state, action) => {
            //state.product = { ...state.product, ...action.payload }
            state.product = action.payload;
        },

        clearProductData: (state, action) => {
            state.product = {
                name: '',
                quantity: '',
                unit: '',
                rate: ''
            }
        },

        removeProduct: (state, action) => {
            const index = action.payload;
            state.formData.data = state.formData.data.filter((_, i) => i !== index);
        },

        setError: (state, action) => {
            state.error = action.payload
        },

        setLoading: (state, action) => {
            state.loading = action.payload
        },

        setLoaded: (state, action) => {
            state.loaded = action.payload
        },
        setIsModalLoading: (state, action) => {
            state.isModalLoading = action.payload
        },
    }
});


//export actions
export const {
    setFormData,
    setProduct,
    clearProductData,
    setError,
    setLoaded,
    setLoading,
    removeProduct,
    setIsModalLoading,
} = formSlice.actions;

export const selectFormData = (state) => state.form.formData
export const selectProduct = (state) => state.form.product
export const selectLoaded = (state) => state.form.loaded
export const selectLoading = (state) => state.form.loading
export const selectError = (state) => state.form.error
export const selectIsModalLoading = (state) => state.form.isModalLoading

export default formSlice.reducer;