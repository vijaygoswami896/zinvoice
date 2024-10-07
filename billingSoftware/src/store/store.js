import { configureStore } from '@reduxjs/toolkit';
import formReducer from '../store/formSlice';

const store = configureStore({
    reducer: {
        form: formReducer,
    }
})

export default store;