import mongoose from 'mongoose';

const products = new mongoose.Schema({
    name: { type: String, required: true},
    coin: { type: Number, required: true}
});


export default mongoose.model('products', products);
