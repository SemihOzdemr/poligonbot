import mongoose from 'mongoose';

const storeMessage = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
});

storeMessage.index({ id: 1 });


export default mongoose.model('storeMessage', storeMessage);
