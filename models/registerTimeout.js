import mongoose from 'mongoose';

const registerTimeout = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    Date: {type: Number, required: true}
});

registerTimeout.index({ id: 1 });


export default mongoose.model('registerTimeout', registerTimeout);
