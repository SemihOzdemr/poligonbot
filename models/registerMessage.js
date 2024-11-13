import mongoose from 'mongoose';

const registerMessage = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
});

registerMessage.index({ id: 1 });


export default mongoose.model('registerMessage', registerMessage);
