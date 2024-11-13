import mongoose from 'mongoose';

const sales = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    user: {type: String, required: true},
    active: {type: Boolean, required: true},
    deliverer: {type: String},
    productId: {type: String, required: true},
    productName: {type: String, required: true},
    productCoin: {type: Number, required: true}
});

sales.index({ id: 1 });


export default mongoose.model('sales', sales);
