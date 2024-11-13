import mongoose from 'mongoose';

const streamers = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    mods: {type: Array, required: true, default: []},
    channelName: {type: String, required: true},
    channelId: {type: String}
});


streamers.index({ id: 1 });


export default mongoose.model('streamers', streamers);
